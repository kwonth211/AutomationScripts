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
    let hasStork = true
    if (stockText === '(재고수량:0)') {
      log('롯데모바일상품권 재고가 없습니다.')
      hasStork = false
      await sleep(1000)
    } else {
      log('롯데모바일상품권 재고가 있습니다.')
      createPopup()
      return
    }

    await page.goto('https://www.happymoney.co.kr/svc/shopping/allianceView.hm?brandId=37')
    await page.waitForSelector(stockSelector)

    const stockText2 = await page.$eval(stockSelector, (el) => el.textContent)
    if (stockText2 === '(재고수량:0)') {
      log('롯데모바일교환권 재고가 없습니다.')
      hasStork = false
      await sleep(1000)
    } else {
      log('롯데모바일교환권 재고가 있습니다.')
      createPopup()
      return
    }

    log('매크로 차단 방지를 위해 3초간 대기합니다..')
    await sleep(3000)
    main({ page, selectedOption })
  } catch (error) {
    log('매크로 실행 중 오류 발생.. 0.5초후 다시 시도합니다.', error)
    await sleep(500)
    main({ page, selectedOption })
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
