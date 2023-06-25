import { app, ipcMain } from 'electron'
import puppeteer from 'puppeteer-core'
import path from 'path'
import { createWindow, detectDialog } from './utils'
import dotenv from 'dotenv'
import { log } from './logger'
import { start } from './domain/real-estate'

app.commandLine.appendSwitch('max-old-space-size', '4096')

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
  startYear,
  endYear,
  city,
  gu,
  dong,
}: {
  startYear: string
  endYear: string
  city: string
  gu: string
  dong: string
}) {
  const chromePath = await chromeLauncher.Launcher.getFirstInstallation()

  const extensionPath =
    '/Users/kwontaehoon/Library/Application Support/Google/Chrome/Default/Extensions/dncepekefegjiljlfbihljgogephdhph/1.0.1.15_0'

  let args = ['--start-maximized']
  if (process.platform === 'darwin') {
    // args.push(`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`)
  }

  const browser = await puppeteer.launch({
    // headless: 'new',
    headless: false,
    defaultViewport: null,
    executablePath: chromePath,
    protocolTimeout: 300000,
    args: args,
  })

  const page = await browser.newPage()
  await page.setDefaultTimeout(30000)
  try {
    // detectDialog({ page })
    log('크롤링 시작!')
    await start({ page, startYear, endYear, city, gu, dong })
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

ipcMain.on('start-macro', (_, { startYear, endYear, city, gu, dong }) => {
  runMacro({ startYear, endYear, city, gu, dong })
    .then(() => {})
    .catch((error) => {
      log('매크로 실행 중 오류 발생:', error)
    })
})
