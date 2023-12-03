import { app, ipcMain } from 'electron'
import puppeteer from 'puppeteer-core'
import path from 'path'
import { createWindow, sleep } from './utils'
import dotenv from 'dotenv'
import { main } from './domain/happy-money/main'
import { log } from './logger'

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

async function runMacro({ selectedOption }: { selectedOption: 'option1' | 'option2' | 'option3' }) {
  const chromePath = await chromeLauncher.Launcher.getFirstInstallation()

  const extensionPath =
    '/Users/kwontaehoon/Library/Application Support/Google/Chrome/Default/Extensions/dncepekefegjiljlfbihljgogephdhph/1.0.1.15_0'

  let args = ['--start-maximized']
  if (process.platform === 'darwin') {
    args.push(`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`)
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    // headless: false,
    defaultViewport: null,
    executablePath: chromePath,
    protocolTimeout: 300000,
    args: args,
  })

  const page = await browser.newPage()
  await page.setDefaultTimeout(10000)
  try {
    await main({ page, selectedOption })
  } catch (error) {
    log('매크로 실행 중 오류 발생.. 다시 시도 합니다.', error)
    await sleep(500)
    await main({ page, selectedOption })
  }
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  app.quit()
  // if (process.platform !== 'darwin') {
  // }
})

app.on('before-quit', () => {
  app.exit(0)
})

ipcMain.on('start-macro', (_, { selectedOption }) => {
  runMacro({ selectedOption })
    .then(() => {
      log('스피커 볼륨을 알맞게 조절해주세요.')
    })
    .catch((error) => {
      log('매크로 실행 중 오류 발생:', error)
    })
})
