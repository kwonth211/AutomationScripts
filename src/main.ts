import { app, BrowserWindow, ipcMain } from 'electron'
import puppeteer, { Browser, Page } from 'puppeteer-core'
import path from 'path'
import { login } from './login'
import { detectDialog } from './utils'

const chromeLauncher = require('chrome-launcher')

if (process.env.NODE_ENV === 'development') {
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
    awaitWriteFinish: true,
  })
}

const DOCTOR_ENUM = {
  차인아: 2,
  송광복: 3,
  임성수: 4,
  정권: 5,
  김은성: 6,
  최창선: 7,
  이순주: 8,
  이재성: 9,
  박정아: 10,
}
const CHILD_NAME = '김선율'
async function runMacro(selectedTimes: string[]) {
  const chromePath = await chromeLauncher.Launcher.getFirstInstallation()

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    executablePath: chromePath,
    args: ['--start-maximized'],
  })

  const page = await browser.newPage()
  detectDialog({ page })
  await login({ page })

  const intervalId = setInterval(async () => {
    try {
      await page.goto('https://www.ifirstch.com/reservation.php?sh_type=6')
      if (selectedTimes) {
        selectedTimes.forEach(async (row) => {
          await reserve({ page, browser, row: Number(row), intervalId })
        })
      } else {
        for (let i = 2; i <= 25; i++) {
          await reserve({ page, browser, row: i, intervalId })
        }
      }
    } catch (error) {
      console.error('An error occurred during the process:', error)
      clearInterval(intervalId)
      await page.goto('https://www.ifirstch.com/reservation.php?sh_type=6')
    }
  }, 300)
}
export const reserve = async ({
  page,
  browser,
  intervalId,
  row,
}: {
  page: Page
  browser: Browser
  intervalId: NodeJS.Timer
  row: number
}) => {
  const tdSelector = `table.ssTd100 > tbody > tr:nth-child(${row}) > td:nth-child(${DOCTOR_ENUM['차인아']})`
  const tdElement = await page.$(tdSelector)

  if (!tdElement) {
    return console.error('tdElement 없음')
  }
  const childElements = await tdElement.$$('div')

  for (let j = 0; j < childElements.length; j++) {
    const innerText = await childElements[j]?.evaluate((el) => el.innerText)
    if (innerText.trim() === '예약가능') {
      clearInterval(intervalId)

      await childElements[j].click()

      const newTarget = await browser.waitForTarget(
        (target) => target.opener() === page.target(),
      )
      const modalPage = await newTarget.page()

      if (!modalPage) {
        console.error('modal 없음')
        return
      }

      const $reservationButtonSelector =
        '#divInfo > table:nth-child(2) > tbody > tr > td:nth-child(1) > table > tbody > tr > td:nth-child(2)'
      await modalPage.waitForSelector($reservationButtonSelector)
      await modalPage.click($reservationButtonSelector)

      const $selectSelector = '#stChildSelect'

      await modalPage.waitForSelector($selectSelector)
      await modalPage.select($selectSelector, CHILD_NAME)

      const $submitButtonSelector = `#divForm > form > table:nth-child(6) > tbody > tr > td:nth-child(1) > table > tbody > tr > td:nth-child(2) > font > b`

      await modalPage.waitForSelector($submitButtonSelector)

      modalPage.click($submitButtonSelector)
    }
  }
}

ipcMain.on('start-macro', (_, selectedTimes) => {
  runMacro(selectedTimes)
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
    width: 600,
    height: 450,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, './preload.js'),
    },
  })

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
