import { Page } from 'puppeteer-core'
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

  log('항목은 모두 필수 값입니다. 빠짐없이 입력해주세요')
  log('시간을 복수로 선택할 경우, 빠른 시간 기준으로 예약이 진행됩니다.')
}
