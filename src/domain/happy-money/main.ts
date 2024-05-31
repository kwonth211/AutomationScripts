import { Page } from 'puppeteer-core'
import { closePopups, detectDialog, sleep } from '../../utils'
import { SelectedOption, login } from '../cultureLand'
import { log } from '../../logger'
import { BrowserWindow, Notification } from 'electron'

const url = {
  option1: 'https://www.happymoney.co.kr/svc/shopping/allianceView.hm?brandId=65',
  option2: 'https://www.happymoney.co.kr/svc/shopping/allianceView.hm?brandId=66',
  option3: 'https://www.happymoney.co.kr/svc/shopping/allianceView.hm?brandId=63',
  option4: 'https://www.happymoney.co.kr/svc/shopping/allianceView.hm?brandId=38',
}
const name = {
  option1: '신세계지류상품권',
  option2: '현대지류상품권',
  option3: '롯데지류상품권',
  option4: '신세계모바일상품권',
  option5: '롯데모바일상품권',
}

export const main = async ({ page, selectedOption }: { page: Page; selectedOption: SelectedOption }) => {
  detectDialog({ page })
  closePopups({ page })

  if (selectedOption === 'option5') {
    try {
      await page.goto('https://www.happymoney.co.kr/svc/shopping/allianceView.hm?brandId=127')

      const stockSelector = '#stockQty'

      await page.waitForSelector(stockSelector)
      const stockText = await page.$eval(stockSelector, (el) => el.textContent)
      let hasStork = true
      if (hasStock(stockText)) {
        log('롯데모바일상품권 재고가 있습니다.')
        createPopup()
        return
      } else {
        log('롯데모바일상품권 재고가 없습니다.')
        hasStork = false
        await sleep(1000)
      }

      await page.goto('https://www.happymoney.co.kr/svc/shopping/allianceView.hm?brandId=37')
      await page.waitForSelector(stockSelector)

      const stockText2 = await page.$eval(stockSelector, (el) => el.textContent)
      if (hasStock(stockText2)) {
        log('롯데모바일교환권 재고가 있습니다.')
        createPopup()
        return
      } else {
        log('롯데모바일교환권 재고가 없습니다.')
        hasStork = false
        await sleep(1000)
      }

      log('매크로 차단 방지를 위해 3초간 대기합니다..')
      await sleep(3000)
      main({ page, selectedOption })
    } catch (error) {
      log('매크로 실행 중 오류 발생.. 0.5초후 다시 시도합니다.', error)
      await sleep(500)
      main({ page, selectedOption })
    }
  } else {
    await stockCheck({ page, selectedOption })
  }
}

const stockCheck = async ({
  page,
  selectedOption,
}: {
  page: Page
  selectedOption: 'option1' | 'option2' | 'option3' | 'option4'
}) => {
  try {
    await page.goto(url[selectedOption])

    const stockSelector = '#stockQty'

    await page.waitForSelector(stockSelector)
    const stockText = await page.$eval(stockSelector, (el) => el.textContent)

    if (hasStock(stockText)) {
      log(`${name[selectedOption]} 재고가 있습니다.`)
      createPopup()
      return
    } else {
      log(`${name[selectedOption]} 재고가 없습니다.`)
      await sleep(1000)
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
const hasStock = (stockText: string | null) => {
  const stock = Number(stockText?.match(/\d+/g))

  log('남은 재고: ' + stock)
  return stock >= 10
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
