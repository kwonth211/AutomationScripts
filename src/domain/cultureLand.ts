import { Page } from 'puppeteer-core'
import { sleep } from '../utils'
import { log } from '../logger'

export type SelectedOption = 'option1' | 'option2' | 'option3' | 'option4' | 'option5' | 'option6' | 'option7'

export const login = async ({ page, selectedOption }: { page: Page; selectedOption: SelectedOption }) => {
  await page.goto('https://m.cultureland.co.kr/mmb/loginMain.do?agent_url=%2Fcpn%2FcpnApp.do%3Fcpgm%3Dsgckiosk')
  const loginButtonSelector = '#btnLogin'
  log('로그인 시작')
  await page.waitForFunction(
    (selector) => document.querySelector(selector) === null,
    {
      timeout: 60 * 5 * 1000,
    },
    loginButtonSelector,
  )

  log(`선택된 옵션은 ${selectedOption} 입니다.`)

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
  }

  // 지류 카드
  if (selectedOption === 'option5') {
    // await buyJilyuCard({ page, company: 'TRAVEL', price: 10000, count: 3 })
    await buyJilyuCard({ page, company: 'SHINSEGAE', price: 10000, count: 18 })
  } else if (selectedOption === 'option6') {
    await buyJilyuCard({ page, company: 'LOTTE', price: 30000, count: 18 })
  } else if (selectedOption === 'option7') {
    await buyJilyuCard({ page, company: 'HYUNDAI', price: 50000, count: 18 })
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
    return
  }

  await page.goto(`https://m.cultureland.co.kr/cpn/cpnApp.do?cpgm=${COMPANY_ID[company]}`, {
    waitUntil: 'networkidle2',
  })

  await sleep(1000)

  const notBuyTimeSelector = 'div.contLy > p'

  const notBuyTimeElement = await page.$(notBuyTimeSelector)
  const isNotBuyTime = notBuyTimeElement !== null

  if (isNotBuyTime) {
    const innerText = await notBuyTimeElement.evaluate((el) => el.innerText)

    if (innerText.includes('현재 접속인원')) {
      log('접속 인원 초과.')
      await buyGiftCard({ page, company, price, count })
      return
    }

    log('구매할 수 있는 시간이 될 때까지 대기합니다.')

    await sleep(1000)
    await buyGiftCard({ page, company, price, count })
    return
  }
  const title = await page.$('#section01 > div > dl')
  const titleText = await title?.evaluate((el) => el.innerText)
  if (titleText?.includes('지류')) {
    log('지류 카드입니다.')
    await sleep(1000)
    await buyGiftCard({ page, company, price, count })
    return
  }

  // A 회사의 50만원은 6번째
  // A 회사의 30만원은 5번째
  // B 회사의 50만원은 5번째
  let aSelector = `#choiceCoupon > li:nth-child(6) > a`
  if (company === 'A' && price === 500000) {
    aSelector = `#choiceCoupon > li:nth-child(6) > a `
  } else if (company === 'A' && price === 300000) {
    aSelector = `#choiceCoupon > li:nth-child(5) > a`
  } else if (company === 'B' && price === 500000) {
    aSelector = `#choiceCoupon > li:nth-child(5) > a `
  }

  const inputSelector = aSelector + ` > input`

  await page.waitForSelector(inputSelector)

  const isSoldOut = await page.$eval(inputSelector, (input) => (input as HTMLInputElement).disabled)

  const inputPrice = await page.$eval(inputSelector, (input) => (input as HTMLInputElement).value)

  if (isSoldOut) {
    log('이 상품은 품절되었습니다.')
    await sleep(500)
    await buyGiftCard({ page, company, price, count })
    return
  }

  if (Number(inputPrice) !== price) {
    log('가격이 다름')
    return
  }
  await page.click(aSelector)

  //다음 버튼
  const buyButtonSelector = '#nextStep'
  await page.waitForSelector(buyButtonSelector)
  await page.click(buyButtonSelector)

  // 수신번호 버튼
  const receiverNumberInpurtSelector = '#recvHP'
  await page.waitForSelector(receiverNumberInpurtSelector)
  await page.type(receiverNumberInpurtSelector, '01083895583')

  // 동의 버튼
  const agreeButtonSelector = '#section02 > div.paymentAmount > p > label'
  await page.waitForSelector(agreeButtonSelector)
  await page.click(agreeButtonSelector)

  // 결제 버튼
  const payButtonSelector = '#btnBuyCpn'
  await page.waitForSelector(payButtonSelector)
  await page.click(payButtonSelector)

  // 확인 버튼
  const confirmButtonSelector = '.modal.alert .btn_action'
  await page.waitForSelector(confirmButtonSelector)
  await page.click(confirmButtonSelector)

  log('구매 완료!!')
  await sleep(500)

  await buyGiftCard({ page, company, price, count: count - 1 })
}

export const buyJilyuCard = async ({
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
  await page.goto(`https://m.cultureland.co.kr/cpn/cpnAppDlvry.do?cpgm=${COMPANY_ID[company]}`, {
    waitUntil: 'networkidle2',
  })

  await sleep(500)

  const soldOutSelector = '.soldout'

  const soldOutElement = await page.$(soldOutSelector)
  const isSoldOut = soldOutElement !== null
  if (isSoldOut) {
    log('Sold out 되었습니다.')
    return
  }

  const notBuyTimeSelector = 'div.contLy > p'

  const notBuyTimeElement = await page.$(notBuyTimeSelector)
  const isNotBuyTime = notBuyTimeElement !== null

  if (isNotBuyTime) {
    const innerText = await notBuyTimeElement.evaluate((el) => el.innerText)

    if (innerText.includes('현재 접속인원')) {
      log('접속 인원 초과.')
      await sleep(500)

      await buyJilyuCard({ page, company, price, count })
      return
    }

    log('구매할 수 있는 시간이 될 때까지 대기합니다.')
    await sleep(1000)
    await buyJilyuCard({ page, company, price, count })
    return
  }
  const title = await page.$('#section01 > div > dl')
  const titleText = await title?.evaluate((el) => el.innerText)

  if (!titleText?.includes('지류')) {
    log('지류 카드가 아닙니다.')
    await buyJilyuCard({ page, company, price, count })
    return
  }

  const aCountSelector = '#section01 > div > div.amountBtm > div > a.plus'
  await page.waitForSelector(aCountSelector)

  for (let i = 0; i < count - 1; i++) {
    await page.click(aCountSelector)
  }

  const nextButtonSelector = '#nextStep'
  await page.click(nextButtonSelector)

  // 결제 버튼
  const payButtonSelector = '#btnBuyDlvry'
  await page.waitForSelector(payButtonSelector)
  await page.click(payButtonSelector)

  // 확인 버튼
  const confirmButtonSelector = '.modal.alert .btn_action'
  await page.waitForSelector(confirmButtonSelector)
  await page.click(confirmButtonSelector)

  log('구매 완료!!')
}
