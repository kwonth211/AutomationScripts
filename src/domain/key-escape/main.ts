import { Page } from 'puppeteer-core'
import { sleep } from '../../utils'
import { log } from '../../logger'

export const main = async ({ page }: { page: Page }) => {
  await page.goto('https://www.keyescape.co.kr/web/home.php?go=rev.make')
  await page.evaluate(() => {
    const _window = window as any
    _window.fun_zizum_select('14', '4', '')
  })
  await sleep(600)

  await page.evaluate(() => {
    const _window = window as any
    // _window.fun_days_select('2023-06-16', '15')
    _window.fun_days_select('2023-06-17', '16')
  })

  await sleep(200)

  // 테마 선택
  await page.evaluate(() => {
    const _window = window as any

    _window.fun_theme_select('48', '0')
  })

  await sleep(200)

  const notReservedSelector = '#contents > div > div > div.revStep > dl.rev4 > dd > div'
  const tdElement = await page.$(notReservedSelector)

  const innerText = await tdElement?.evaluate((el: any) => el.innerText)
  await page.waitForSelector(notReservedSelector)

  log(innerText)

  if (innerText.includes('예약가능시간')) {
    await main({ page })
    return
  }
  // 시간 선택
  await page.evaluate(() => {
    const _window = window as any

    // 10:00
    // _window.fun_theme_time_select('1478', '0')

    //11:30
    _window.fun_theme_time_select('1479', '1')
  })

  await sleep(200)

  await page.evaluate(() => {
    const _window = window as any

    _window.fun_submit()
  })

  const reserveNameSelector = '#contents > div > div > form > table > tbody > tr:nth-child(6) > td > input'

  await page.waitForSelector(reserveNameSelector)
  await page.type(reserveNameSelector, '권태훈')

  const reservePhoneSelector1 =
    '#contents > div > div > form > table > tbody > tr:nth-child(7) > td > input:nth-child(2)'

  await page.waitForSelector(reservePhoneSelector1)
  await page.type(reservePhoneSelector1, '5712')
  const reservePhoneSelector2 =
    '#contents > div > div > form > table > tbody > tr:nth-child(7) > td > input:nth-child(3)'

  await page.waitForSelector(reservePhoneSelector2)
  await page.type(reservePhoneSelector2, '3168')

  const peopleCountSelector = '#contents > div > div > form > table > tbody > tr:nth-child(8) > td > select'

  await page.waitForSelector(peopleCountSelector)
  await page.select(peopleCountSelector, '3')
}
