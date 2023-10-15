import { Page } from 'puppeteer-core'
import { closePopups, detectDialog, sleep } from '../../utils'
import { SelectedOption, login } from '../cultureLand'
import { log } from '../../logger'
import { BrowserWindow, Notification } from 'electron'

export const main = async ({ page, selectedOption }: { page: Page; selectedOption: SelectedOption }) => {
  detectDialog({ page })
  closePopups({ page })

  try {
    await page.goto('https://www.happymoney.co.kr/svc/shopping/allianceView.hm?brandId=127')

    const stockSelector = '#stockQty'

    await page.waitForSelector(stockSelector)
    const stockText = await page.$eval(stockSelector, (el) => el.textContent)

    if (stockText === '(재고수량:0)') {
      log('재고가 없습니다.')
      await sleep(3000)
      main({ page, selectedOption })
      return
    }

    createPopup()
  } catch (error) {
    log('매크로 실행 중 오류 발생', error)
  }
}

const createPopup = () => {
  let win: BrowserWindow | null = new BrowserWindow({
    width: 200,
    height: 200,
    webPreferences: {
      nodeIntegration: true,
    },
  })

  win.loadFile('./public/audioPopup.html') // 팝업에 표시할 HTML 파일 경로
  win.on('closed', () => {
    win = null
  })
}
