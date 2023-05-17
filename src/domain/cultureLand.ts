import { Page } from 'puppeteer-core'
import { sleep } from '../utils'

export type SelectedOption = 'option1' | 'option2' | 'option3'

export const login = async ({
  page,
  selectedOption,
}: {
  page: Page
  selectedOption: SelectedOption
}) => {
  await page.goto(
    'https://m.cultureland.co.kr/mmb/loginMain.do?agent_url=%2Fcpn%2FcpnApp.do%3Fcpgm%3Dsgckiosk',
  )

  const loginButtonSelector = '#btnLogin'

  await page.waitForFunction(
    (selector) => document.querySelector(selector) === null,
    {
      timeout: 30000,
    },
    loginButtonSelector,
  )

  // FOR TEST
  // await buyGiftCard({ page, company: 'TEST', price: 10000, count: 3 })
  // return

  if (selectedOption === 'option1') {
    await buyGiftCard({ page, company: 'A', price: 500000, count: 20 })
  } else if (selectedOption === 'option2') {
    await buyGiftCard({ page, company: 'A', price: 300000, count: 33 })
  } else if (selectedOption === 'option3') {
    for (let i = 0; i < 2; i++) {
      if (i === 0) {
        await buyGiftCard({ page, company: 'A', price: 500000, count: 20 })
      } else {
        await buyGiftCard({ page, company: 'B', price: 500000, count: 20 })
      }
    }
  }
  // await buyGiftCard({ page })
}

const COMPANY_ID = {
  A: 'sgckiosk2',
  B: 'sgckiosk',
  TEST: 'ematicon',
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

  await page.goto(
    `https://m.cultureland.co.kr/cpn/cpnApp.do?cpgm=${COMPANY_ID[company]}`,
    {
      waitUntil: 'networkidle2',
    },
  )

  await sleep(1000)

  const notBuyTimeSelector = 'div.contLy > p'

  const notBuyTimeElement = await page.$(notBuyTimeSelector)
  const isNotBuyTime = notBuyTimeElement !== null

  if (isNotBuyTime) {
    console.log('아직 구매할 수 없는 시간입니다.')

    await sleep(1000)
    await buyGiftCard({ page, company, price, count })
    return
  }
  const title = await page.$('#section01 > div > dl')
  const titleText = await title?.evaluate((el) => el.innerText)
  if (titleText?.includes('지류')) {
    console.log('지류 카드입니다.')
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

  // FOR TEST
  // aSelector = '#choiceCoupon > li:nth-child(1) > a'

  const inputSelector = aSelector + ` > input`

  await page.waitForSelector(inputSelector)

  const isSoldOut = await page.$eval(
    inputSelector,
    (input) => (input as HTMLInputElement).disabled,
  )

  const inputPrice = await page.$eval(
    inputSelector,
    (input) => (input as HTMLInputElement).value,
  )

  // Sold Out이면 다음 항목으로 넘어감
  if (isSoldOut) {
    console.log('This item is sold out')
    return
  }

  if (Number(inputPrice) !== price) {
    console.log('가격이 다름')
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

  console.log('구매 완료!!')
  await buyGiftCard({ page, company, price, count: count - 1 })
}
