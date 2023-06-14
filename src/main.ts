import { app, ipcMain } from 'electron'
import puppeteer from 'puppeteer-core'
import path from 'path'
import { createWindow, detectDialog } from './utils'
import dotenv from 'dotenv'
import { main } from './domain/cultureLand/main'
import { log } from './logger'
import { visit } from './domain/usedCafe'
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
async function runMacro({
  minRange,
  maxRange,
  isBackground,
  nickname1,
  nickname2,
}: {
  minRange: string
  maxRange: string
  isBackground: boolean
  nickname1: string
  nickname2: string
}) {
  const minRangeNumber = parseInt(minRange)
  const maxRangeNumber = parseInt(maxRange)
  const chromePath = await chromeLauncher.Launcher.getFirstInstallation()

  const browser = await puppeteer.launch({
    headless: isBackground,
    defaultViewport: null,
    executablePath: chromePath,
    args: ['--start-maximized'],
  })

  const page = await browser.newPage()
  detectDialog({ page })

  const randomViewCount = Math.floor(Math.random() * (maxRangeNumber - minRangeNumber + 1)) + minRangeNumber

  try {
    log(`랜덤 조회수: ${randomViewCount}`)
    await visit({
      page,
      browser,
      randomViewCount,
      nickname1,
      nickname2,
    })
  } catch (error) {
    log('매크로 실행 중 오류 발생', error)
  }
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  app.quit()
  // if (process.platform !== 'darwin') {
  // }
})
ipcMain.on('start-macro', (_, { minRange, maxRange, isBackground, nickname1, nickname2 }) => {
  runMacro({ minRange, maxRange, isBackground, nickname1, nickname2 })
    .then(() => {
      // 매크로 작업이 완료되면 렌더러 프로세스에 알립니다.
      // win.webContents.send('macro-finished');
    })
    .catch((error) => {
      log('매크로 실행 중 오류 발생:', error)
    })
})
