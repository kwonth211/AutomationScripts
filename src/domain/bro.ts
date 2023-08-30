import { Browser, Page } from 'puppeteer-core'
import { sleep } from '../utils'
import { log } from '../logger'

export type MacroFormData = {
  date: string
  times: string[]
  symptom: string
}

export const reserve = async ({
  page,
  browser,
  formData,
}: {
  page: Page
  browser: Browser
  formData: MacroFormData
}) => {
  await page.goto('https://www.evermedi.com/field_search.do', {
    waitUntil: 'networkidle2',
  })
  const $searchInputSelector = '.input_map'
  await page.waitForSelector($searchInputSelector)
  await page.type($searchInputSelector, '누리엘병원')
  await page.keyboard.press('Enter')

  const $reserveButtonSelector = '.reserve_btn'
  await page.waitForSelector($reserveButtonSelector)
  await page.click($reserveButtonSelector)
  await page.waitForNavigation({ waitUntil: 'networkidle2' })

  await page.evaluate(() => {
    const _window = window as any
    // _window.doctorSet('D20190730122441334', '박하늘', '1')
    _window.doctorSet('D20190730122529015', '김지은', '1')
  })

  const $reserveTypeSelector = '#r_type_info'
  await page.waitForSelector($reserveTypeSelector)
  await page.select($reserveTypeSelector, '001:진료:999:1')
  await sleep(500)

  const iframeElement = await page.$('#reserv_calendar')
  if (!iframeElement) {
    throw new Error('iframeElement 없음')
  }
  const frame = await iframeElement.contentFrame()

  if (!frame) {
    throw new Error('frame 없음')
  }
  // 오늘의 달 가져오기
  const today = new Date()
  const year = today.getFullYear()
  const todayMonth = today.getMonth() + 1

  console.log(todayMonth)

  const month = formData.date.split('-')[1]
  const day = formData.date.split('-')[2]

  if (todayMonth < Number(month)) {
    // 다음달로 이동
    const $monthSelector = '#month'
    await frame.waitForSelector($monthSelector)
    console.log('>>>', String(Number(month) - 1))
    await frame.select($monthSelector, String(Number(month) - 1))
  }
  const foundDay = await frame.$$eval(
    'a',
    (anchors, day) => {
      for (let anchor of anchors) {
        if (anchor.textContent?.trim() === day) {
          anchor.click()
          return true
        }
      }
      return false
    },
    day,
  )

  if (!foundDay) {
    log('날짜가 아직 갱신되지 않았습니다. 0.5초 후 다시 시도합니다.')
    await sleep(500)
    await reserve({ page, browser, formData })
    return
  }

  await sleep(500)

  const timeListElement = await page.$('#time_list') // 원하는 iframe 선택자로 변경
  if (!timeListElement) {
    throw new Error('timeListElement 없음')
  }

  const timeListFrame = await timeListElement.contentFrame()
  if (!timeListFrame) {
    throw new Error('timeListFrame 없음')
  }

  // 시간선택
  // #r_time_9  ~ #r_time_17

  let clicked = false

  for (const time of formData.times) {
    if (clicked) break

    const timeSelector = `#r_time_${time}`
    clicked = await timeListFrame.evaluate((timeSelector) => {
      const select = document.querySelector(timeSelector) as HTMLSelectElement
      if (!select?.options) {
        return false
      }
      for (const option of select.options as any) {
        if (option.value !== 'NON') {
          select.value = option.value
          select.dispatchEvent(new Event('change'))
          return true
        }
      }
      return false
    }, timeSelector)
  }
  if (!clicked) {
    log('시간을 찾지 못했습니다. 0.5초 후 다시 시도합니다.')
    await sleep(500)
    await reserve({ page, browser, formData })
    return
  }

  const $reTextSelector = '#re_text'
  await timeListFrame.waitForSelector($reTextSelector)
  await timeListFrame.type($reTextSelector, formData.symptom)

  const $humanType = '.select_name'
  await timeListFrame.waitForSelector($humanType)
  await timeListFrame.select($humanType, '120211013110520393:권이서')

  // 최종 예약 버튼
  const reserveButtonSelector = '#reserv'
  await page.waitForSelector(reserveButtonSelector)
  await page.click(reserveButtonSelector)
}

export const authenticateUser = async ({ page }: { page: Page }) => {
  await page.goto('https://www.evermedi.com/main.do', {
    waitUntil: 'networkidle2',
  })

  const $idSelector = '#id'
  const $passwordSelector = '#pw'

  await page.waitForSelector($idSelector)
  await page.waitForSelector($passwordSelector)
  await page.type($idSelector, 'zzzz0316')
  await page.type($passwordSelector, 'rntmf242')

  const $loginButtonSelector =
    '#center > div.center2 > div > div.centerlet_one > form:nth-child(5) > div.centerlet_one_bot > span.spar > input'
  await page.click($loginButtonSelector)
}
