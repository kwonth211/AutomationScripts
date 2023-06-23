import { Browser, Page } from 'puppeteer-core'
import { BrowserWindow, powerSaveBlocker } from 'electron'
import path from 'path'
import { log } from './logger'

export const detectDialog = ({ page }: { page: Page }) => {
  page.on('dialog', async (dialog) => {
    console.log(`Dialog message: ${dialog.message()}`)
    await dialog.accept() // 확인 버튼을 누릅니다.

    if (dialog.message() === '본인인증에 성공하였습니다.') {
    }

    if (dialog.message() === '잘못된 경로로 접근하였습니다.') {
    }
  })
}
export const closePopups = ({ page }: { page: Page }) => {
  page.on('popup', async (popupPage: Page) => {
    // 새로운 팝업 창이 생성되면 바로 닫음
    await popupPage.close()
  })
}

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
export const createWindow = async () => {
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

  await win.loadFile('./public/index.html')

  log('실제 시,구,동을 정확히 입력해주세요.')
}

export const generateXlsxFileName = () => {
  let originDate = new Date()

  let date = ('0' + originDate.getDate()).slice(-2)

  // Current month
  let month = ('0' + (originDate.getMonth() + 1)).slice(-2)

  // Current year
  let year = originDate.getFullYear()

  // Current hours
  let hours = ('0' + originDate.getHours()).slice(-2)

  // Current minutes
  let minutes = ('0' + originDate.getMinutes()).slice(-2)

  // Current seconds
  let seconds = ('0' + originDate.getSeconds()).slice(-2)

  // Create a unique file name using the current date and time
  let filename = `${year}_${month}_${date}_${hours}:${minutes}:${seconds}.xlsx`
  return filename
}
