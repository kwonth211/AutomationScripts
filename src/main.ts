import { app, BrowserWindow, ipcMain, powerSaveBlocker } from 'electron'
import puppeteer from 'puppeteer-core'
import path from 'path'
import { login } from './login'
import { closePopups, detectDialog, sleep } from './utils'
import dotenv from 'dotenv'
import { visit } from './domain/usedCafe'
import { authenticateUser } from './domain/busan-seo-gu-football'
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

async function runMacro({ isBackground, formData }: { formData: any; isBackground: boolean }) {
  const chromePath = await chromeLauncher.Launcher.getFirstInstallation()

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    executablePath: chromePath,
    args: ['--start-maximized'],
  })

  const page = await browser.newPage()
  detectDialog({ page, browser, formData })

  try {
    await authenticateUser({ page, browser })

    // test용
    // for (let court of formData.courts) {
    //   await reserve({ page, browser, formData, court })
    // }
  } catch (error) {
    console.error(error)
  }
}

ipcMain.on('start-macro', (_, { isBackground, formData }) => {
  runMacro({ isBackground, formData })
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
