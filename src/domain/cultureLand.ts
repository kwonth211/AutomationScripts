import { Page } from 'puppeteer-core'
import { sleep } from '../utils'
import { log } from '../logger'

export type SelectedOption = 'option1' | 'option2' | 'option3' | 'option4' | 'option5'

export const login = async ({ page, selectedOption }: { page: Page; selectedOption: SelectedOption }) => {
  await page.goto('https://www.cultureland.co.kr/signin/login.do')
  const loginFormSelector = '#loginForm'
  await page.waitForSelector(loginFormSelector)
  log('로그인 시작')
  await page.waitForFunction(
    (selector) => document.querySelector(selector) === null,
    {
      timeout: 60 * 5 * 1000,
    },
    loginFormSelector,
  )

  log(`선택된 옵션은 ${selectedOption} 입니다.`)
  await sleep(1000)
  // 기프트 카드
  if (selectedOption === 'option1') {
    await buyGiftCard({ page, company: 'A', price: 500000, count: 20 })
  } else if (selectedOption === 'option2') {
    await buyGiftCard({ page, company: 'A', price: 300000, count: 33 })
  } else if (selectedOption === 'option3') {
    await buyGiftCard({ page, company: 'B', price: 500000, count: 20 })
  } else if (selectedOption === 'option4') {
    for (let i = 0; i < 2; i++) {
      if (i === 0) {
        await buyGiftCard({ page, company: 'A', price: 500000, count: 20 })
      } else {
        await buyGiftCard({ page, company: 'B', price: 500000, count: 20 })
      }
    }
  } else if (selectedOption === 'option5') {
    await buyGiftCard({ page, company: 'LOTTE', price: 100000, count: 10 })
  }
}

const COMPANY_ID = {
  A: 'sgckiosk2',
  B: 'sgckiosk',
  TEST: 'ematicon',
  HYUNDAI: 'lhgc',
  LOTTE: 'llgc',
  SHINSEGAE: 'lsgc',
  TRAVEL: 'ktravel',
}

export const buyGiftCard = async ({
  page,
  company,
  price,
  count,
}: {
  page: Page
  company: keyof typeof COMPANY_ID
  price: number
  count: number // 20 or 33
}) => {
  if (count === 0) {
    log('구매한 갯수가 0이되도 종료되지 않습니다.')
  }

  await page.goto('https://www.cultureland.co.kr/coupon/cpnList.do')
  await page.evaluate(() => {
    ;(window as any).CommBannerClose()
  })
  await page.evaluate(() => {
    ;(window as any).setHideADBanner()
  })

  await page.evaluate((company) => {
    const _window = window as any

    if (company === 'A') {
      _window.goProdList('신세계모바일상품권', 'sgckiosk2', '160')
    } else if (company === 'B') {
      _window.goProdList('신세계모바일 (키오스크형)', 'sgckiosk', '150')
    } else if (company === 'HYUNDAI') {
      _window.goProdList('현대모바일상품권', 'hgc', '139')
    } else if (company === 'LOTTE') {
      _window.goProdList('(익일발송)롯데모바일상품권', 'lotte', '141')
    }
  }, company)

  await page.waitForNavigation()

  let idx = -1
  if (company === 'A' && price === 500000) {
    idx = 6
  } else if (company === 'A' && price === 300000) {
    idx = 5
  } else if (company === 'B' && price === 500000) {
    idx = 5
  } else if (company === 'HYUNDAI' && price === 100000) {
    idx = 1
  } else if (company === 'LOTTE' && price === 100000) {
    idx = 1
  }

  if (idx === -1) {
    log('매크로 옵션 이상')
    return
  }
  const notBuyTimeElement = await page.$('#alertPop')
  if (notBuyTimeElement !== null) {
    // log('구매 가능 시간이 아닙니다.')
    await buyGiftCard({ page, company, price, count })
    return
  }

  const soldOutSelector = `#contents > div.contents > div.section.sec-tabs > div > div.tab-toggle.tab-toggle-1.active > ul > li:nth-child(${idx}) > div`
  const soldOutElement = await page.$(soldOutSelector)
  const isSoldOut = soldOutElement !== null

  if (isSoldOut) {
    // const innerText = await soldOutElement.evaluate((el: any) => el.innerText)
    // log(innerText)

    log('품절되었습니다.')
    await page.reload()
    await sleep(200)
    await buyGiftCard({ page, company, price, count })
    return
  }

  await page.evaluate(
    (company, price) => {
      const _window = window as any
      // 1. company가 A이고 가격이 50만원일때
      if (company === 'A' && price === 500000) {
        _window.goDetail3('2194', 'sgckiosk2', '', '0', '0', '0', '0', _window)
      }
      // 2. company가 A이고 가격이 30만원일때
      else if (company === 'A' && price === 300000) {
        _window.goDetail3('2193', 'sgckiosk2', '', '0', '0', '0', '0', _window)
      }
      // 3. company가 B이고 가격이 50만원일때
      else if (company === 'B' && price === 500000) {
        _window.goDetail3('1948', 'sgckiosk', '', '0', '0', '0', '0', _window)
      }
      // 4. company가 HYUNDAI이고 가격이 10만원일때
      else if (company === 'HYUNDAI' && price === 100000) {
        _window.goDetail3('1681', 'hgc', '', '0', '0', '0', '0', _window)
      } else if (company === 'LOTTE' && price === 100000) {
        _window.goDetail3('1949', 'lotte', '', '0', '0', '0', '0', _window)
      }
    },
    company,
    price,
  )

  // const alertButtonElement = await page.$('#alertPop > div > div  button')
  // if (alertButtonElement !== null) {
  //   await alertButtonElement.click()
  // }

  await page.waitForNavigation()

  const buyButtonSelector =
    '#contents > div.contents > div.section.sec-slide > div > div.btn-cont > div > a.btn.primary'

  await page.waitForSelector(buyButtonSelector)
  await page.click(buyButtonSelector)

  // await sleep(300)

  // 동의 버튼
  const agreeButtonSelector = '#agreement-pop-00'
  await page.waitForSelector(agreeButtonSelector)
  await page.click(agreeButtonSelector)

  // 동의 버튼2
  const agreeButtonSelector2 = '#agreement-pop-01'
  await page.waitForSelector(agreeButtonSelector2)
  await page.click(agreeButtonSelector2)

  // 결제 버튼
  const payButtonSelector = '#orderBtn'
  await page.waitForSelector(payButtonSelector)

  while (true) {
    let payButton
    try {
      // 확인을 위해 결제 버튼 요소를 가져옵니다.
      payButton = await page.$(payButtonSelector)

      if (payButton) {
        await payButton.click()

        const alertButtonElement = await page.$('#alertPop > div > div > div > div > button')
        if (alertButtonElement !== null) {
          await alertButtonElement.click()
        }
      } else {
        break
      }
    } catch (error) {
      break
    }
  }

  log('구매 완료!!')
  await buyGiftCard({ page, company, price, count: count - 1 })
  return
}
