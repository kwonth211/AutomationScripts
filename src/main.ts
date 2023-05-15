import { app, BrowserWindow, ipcMain, powerSaveBlocker } from 'electron'
import puppeteer from 'puppeteer-core'
import path from 'path'
import { closePopups, detectDialog } from './utils'
import dotenv from 'dotenv'
import { login } from './domain/cultureLand'
const chromeLauncher = require('chrome-launcher')

const resourcesPath = app.isPackaged ? path.join(process.resourcesPath, 'resources') : '.'
const envFilePath = path.join(resourcesPath, '.env')
dotenv.config({ path: envFilePath })

if (process.env.NODE_ENV === 'development') {
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
    awaitWriteFinish: true,
  })
}

async function runMacro({ selectedOption }: { selectedOption: 'option1' | 'option2' | 'option3' }) {
  const chromePath = await chromeLauncher.Launcher.getFirstInstallation()

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    executablePath: chromePath,
    args: [
      '--start-maximized',
      // `--disable-extensions-except=${extensionPath}`,
      // `--load-extension=${extensionPath}`,
    ],
  })

  const page = await browser.newPage()

  await page.setViewport({ width: 375, height: 812 })
  await page.setUserAgent(
    'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
  )

  await page.setDefaultTimeout(10000)

  detectDialog({ page })
  closePopups({ page })

  try {
    await login({ page, selectedOption })
  } catch (error) {
    console.error(error)
  }
}

ipcMain.on('start-macro', (_, { selectedOption }) => {
  runMacro({ selectedOption })
    .then(() => {
      // 매크로 작업이 완료되면 렌더러 프로세스에 알립니다.
      // win.webContents.send('macro-finished');
    })
    .catch((error) => {
      console.error('매크로 실행 중 오류 발생:', error)
    })
})

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, './preload.js'),
    },
  })
  win.webContents.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537',
  )

  powerSaveBlocker.start('prevent-display-sleep')

  win.loadFile('./public/index.html')
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  app.quit()
  // if (process.platform !== 'darwin') {
  // }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
