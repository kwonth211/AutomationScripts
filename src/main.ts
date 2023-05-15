import { app, ipcMain } from 'electron'
import puppeteer from 'puppeteer-core'
import path from 'path'
import { createWindow } from './utils'
import dotenv from 'dotenv'
import { main } from './domain/cultureLand/main'
import { log } from './logger'
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
    // headless: 'new',
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
  await page.setDefaultTimeout(10000)
  try {
    await main({ page, selectedOption })
  } catch (error) {
    log('매크로 실행 중 오류 발생')
  }
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  app.quit()
  // if (process.platform !== 'darwin') {
  // }
})

ipcMain.on('start-macro', (_, { selectedOption }) => {
  runMacro({ selectedOption })
    .then(() => {})
    .catch((error) => {
      console.error('매크로 실행 중 오류 발생:', error)
    })
})
