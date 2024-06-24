import { Page } from 'puppeteer-core'
import { sleep } from '../utils'
import { log } from '../logger'

export type SelectedOption = 'option1' | 'option2' | 'option3' | 'option4' | 'option5'

const callMenu = async ({
  selectedOption,
  page,
  phonePart1,
  phonePart2,
  phonePart3,
}: {
  selectedOption: SelectedOption
  page: Page
  phonePart1: string
  phonePart2: string
  phonePart3: string
}) => {
  // 테스트용
  // await buyGiftCard({
  //   page,
  //   company: 'HYUNDAI',
  //   price: 100000,
  //   count: 20,
  //   phonePart1,
  //   phonePart2,
  //   phonePart3,
  // })

  if (selectedOption === 'option1') {
    await buyGiftCard({ page, company: 'A', price: 500000, count: 20, phonePart1, phonePart2, phonePart3 })
  } else if (selectedOption === 'option2') {
    await buyGiftCard({ page, company: 'A', price: 300000, count: 33, phonePart1, phonePart2, phonePart3 })
  } else if (selectedOption === 'option3') {
    await buyGiftCard({ page, company: 'B', price: 500000, count: 20, phonePart1, phonePart2, phonePart3 })
  } else if (selectedOption === 'option4') {
    for (let i = 0; i < 2; i++) {
      if (i === 0) {
        await buyGiftCard({ page, company: 'A', price: 500000, count: 20, phonePart1, phonePart2, phonePart3 })
      } else {
        await buyGiftCard({ page, company: 'B', price: 500000, count: 20, phonePart1, phonePart2, phonePart3 })
      }
    }
  } else if (selectedOption === 'option5') {
    await buyGiftCard({ page, company: 'LOTTE', price: 100000, count: 10, phonePart1, phonePart2, phonePart3 })
  } else if (selectedOption === 'option6') {
    await buyGiftCard({ page, company: 'LOTTE2', price: 500000, count: 20, phonePart1, phonePart2, phonePart3 })
  } else if (selectedOption === 'option7') {
    await buyGiftCard({ page, company: 'LOTTE2', price: 100000, count: 20, phonePart1, phonePart2, phonePart3 })
  } else if (selectedOption === 'option8') {
    await buyGiftCard({ page, company: 'STARBUCKS', price: 51500, count: 20, phonePart1, phonePart2, phonePart3 })
  }
}

export const login = async ({
  page,
  selectedOption,
  phonePart1,
  phonePart2,
  phonePart3,
}: {
  page: Page
  selectedOption: SelectedOption
  phonePart1: string
  phonePart2: string
  phonePart3: string
}) => {
  await page.goto('https://www.cultureland.co.kr/signin/login.do')
  const loginFormSelector = '#loginForm'
  await page.waitForSelector(loginFormSelector)
  log('로그인 시작')

  try {
    await page.waitForFunction(
      (selector) => document.querySelector(selector) === null,
      {
        timeout: 60 * 5 * 1000 * 5,
      },
      loginFormSelector,
    )
  } catch (error) {
    log('로그인 실패.. 0.5초 후 다시 시도합니다.')
    await sleep(500)
    await login({ page, selectedOption, phonePart1, phonePart2, phonePart3 })
  }

  log(`선택된 옵션은 ${selectedOption} 입니다.`)
  await sleep(1000)

  let i = 0
  while (i < 5) {
    try {
      await callMenu({ selectedOption, page, phonePart1, phonePart2, phonePart3 })

      break // callMenu가 성공적으로 실행되면 while 문을 종료
    } catch (error) {
      log('알 수없는 에러 발생.. 0.5초 후 다시 시도합니다.')
      log(error)
      i++
      await sleep(500)
    }
  }
  // 기프트 카드
}

const COMPANY_ID = {
  A: 'sgckiosk2',
  B: 'sgckiosk',
  TEST: 'ematicon',
  HYUNDAI: 'lhgc',
  LOTTE: 'llgc',
  LOTTE2: 'lgc',
  SHINSEGAE: 'lsgc',
  TRAVEL: 'ktravel',
  STARBUCKS: 'starbucks',
}

const loadPage = async ({ page }: { page: Page }) => {
  try {
    await page.goto('https://www.cultureland.co.kr/coupon/cpnList.do')
    return true
  } catch (error) {
    console.log(error)

    log('페이지 로드 실패.. 0.5초 후 다시 시도합니다.')
    return false
  }
}

export const buyGiftCard = async ({
  page,
  company,
  price,
  count,
  phonePart1,
  phonePart2,
  phonePart3,
}: {
  page: Page
  company: keyof typeof COMPANY_ID
  price: number
  count: number // 20 or 33
  phonePart1: string
  phonePart2: string
  phonePart3: string
}) => {
  while (true) {
    const isLoaded = await loadPage({ page })
    if (!isLoaded) {
      await sleep(500)
      // await buyGiftCard({ page, company, price, count })
      continue
    }

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
      } else if (company === 'LOTTE2') {
        _window.goProdList('(실시간발송)롯데모바일상품권', 'lgc', '89')
      } else if (company === 'STARBUCKS') {
        _window.goProdList('스타벅스 e카드 교환권', 'star', '174')
      }
    }, company)

    await page.waitForNavigation()

    let idx = -1
    // index는 1부터
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
    } else if (company === 'LOTTE2' && price === 500000) {
      idx = 5
    } else if (company === 'LOTTE2' && price === 100000) {
      idx = 4
    } else if (company === 'STARBUCKS' && price === 51500) {
      idx = 3
    }

    if (idx === -1) {
      log('매크로 옵션 이상')
      return
    }
    const notBuyTimeElement = await page.$('#alertPop')
    if (notBuyTimeElement !== null) {
      // log('구매 가능 시간이 아닙니다.')
      continue
    }
    const soldOutSelector = `#contents > div.contents > div.section.sec-tabs > div > div.tab-toggle.tab-toggle-1.active > ul > li:nth-child(${idx}) > div`
    const soldOutElement = await page.$(soldOutSelector)
    const isSoldOut = soldOutElement !== null

    if (isSoldOut) {
      log('품절되었습니다.')
      if (global.gc) {
        global.gc()
      } else {
        log('gc is not defined')
      }
      await page.reload()
      await sleep(200)
      continue
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
        } else if (company === 'LOTTE2' && price === 500000) {
          _window.goDetail3('1527', 'lgc', '', '0', '0', '0', '0', _window)
        } else if (company === 'LOTTE2' && price === 100000) {
          _window.goDetail3('1526', 'lgc', '', '0', '0', '0', '0', _window)
        }
        // 5. company가 STARBUCKS이고 가격이 51500원일때
        else if (company === 'STARBUCKS' && price === 51500) {
          _window.goDetail3('2426', 'star', '', '0', '0', '0', '0', _window)
        }
      },
      company,
      price,
    )
    await page.waitForNavigation()

    const alertButtonElement = await page.$('#alertPop > div > div  button')
    if (alertButtonElement !== null) {
      await alertButtonElement.click()
    }
    const buyButtonSelector =
      '#contents > div.contents > div.section.sec-slide > div > div.btn-cont > div > a.btn.primary'
    await page.waitForSelector(buyButtonSelector)
    await page.click(buyButtonSelector)

    await sleep(300)
    // 직접입력 버튼
    const directInputButtonSelector = '#radio-02'
    await page.waitForSelector(directInputButtonSelector)
    await page.click(directInputButtonSelector)

    // 휴대폰번호 입력
    const phoneInputSelector1 = '#hp_no1'
    const phoneInputSelector2 = '#hp_no2'
    const phoneInputSelector3 = '#hp_no3'

    await page.type(phoneInputSelector1, phonePart1)
    await page.type(phoneInputSelector2, phonePart2)
    await page.type(phoneInputSelector3, phonePart3)

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

            //동의버튼 1의 값을 가져와서 true가 아닐경우
            const isAgreeButtonSelected = await page.evaluate((selector) => {
              const element = document.querySelector(selector) as HTMLInputElement
              return element && element.checked
            }, agreeButtonSelector)

            if (!isAgreeButtonSelected) {
              await page.click(agreeButtonSelector)
            }

            //동의버튼 2의 값을 가져와서 true가 아닐경우
            const isAgreeButton2Selected = await page.evaluate((selector) => {
              const element = document.querySelector(selector) as HTMLInputElement
              return element && element.checked
            }, agreeButtonSelector2)

            if (!isAgreeButton2Selected) {
              await page.click(agreeButtonSelector2)
            }
          }
        } else {
          break
        }
      } catch (error) {
        break
      }
    }

    // 페이지 url이 결제완료 페이지인지 확인 url = https://www.cultureland.co.kr/coupon/cpnOrderEnd.do
    await page.evaluate(() => {
      return location.href === 'https://www.cultureland.co.kr/coupon/cpnOrderEnd.do'
    })

    log('구매 완료!!')

    // await buyGiftCard({ page, company, price, count: count - 1 })
  }
}
