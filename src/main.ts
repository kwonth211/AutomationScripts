import { app, ipcMain } from 'electron'
import puppeteer from 'puppeteer-core'
import path from 'path'
import { closePopups, createWindow, sleep } from './utils'
import dotenv from 'dotenv'
import { log } from './logger'
app.commandLine.appendSwitch('max-old-space-size', '4096')
import { MacroFormData, authenticateUser, reserve } from './domain/bro'
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

async function runMacro({ formData }: { formData: MacroFormData }) {
  const chromePath = await chromeLauncher.Launcher.getFirstInstallation()

  const extensionPath =
    '/Users/kwontaehoon/Library/Application Support/Google/Chrome/Default/Extensions/dncepekefegjiljlfbihljgogephdhph/1.0.1.15_0'

  let args = ['--start-maximized']
  if (process.platform === 'darwin') {
    args.push(`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`)
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
  await page.setDefaultTimeout(10000)
  try {
    await authenticateUser({ page })
    closePopups({ page })
    await sleep(500)
    await reserve({ page, browser, formData })
    // test용
    // for (let court of formData.courts) {
    //
    // }
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

ipcMain.on('start-macro', (_, { formData }) => {
  runMacro({ formData })
    .then(() => {})
    .catch((error) => {
      log('매크로 실행 중 오류 발생:', error)
    })
})
