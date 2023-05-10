import { Browser, Page } from 'puppeteer-core'
import { sleep } from '../utils'
const countInterval = 5 * 60 * 1000

export const visit = async ({
  page,
  browser,
  randomViewCount,
}: {
  randomViewCount: number
  page: Page
  browser: Browser
}) => {
  await page.goto('https://cafe.naver.com/joonggonara', {
    waitUntil: 'networkidle2',
  })

  await page.waitForSelector('#topLayerQueryInput')
  await page.type('#topLayerQueryInput', '컬쳐랜드')
  await page.keyboard.press('Enter')

  const tbodySelector = '#main-area > div:nth-child(5) > table > tbody'
  const iframeElement = await page.$('#cafe_main')

  if (!iframeElement) {
    throw new Error('iframeElement 없음')
  }
  const frame = await iframeElement.contentFrame()

  if (!frame) {
    throw new Error('frame 없음')
  }
  await frame.waitForSelector(tbodySelector)

  const trElements = await frame.$$(tbodySelector + ' > tr')

  for (let tr of trElements) {
    const [title, _, nickname, date, viewCount] = await tr.$$('td')
    const titleText = await title?.evaluate((el) => el.innerText)
    const alink = await title.$('a')
    if (!alink) {
      throw new Error('alink 없음')
    }
    const nicknameText = await nickname?.evaluate((el) => el.innerText)
    let viewCountNumber = Number(
      await viewCount?.evaluate((el) => el.innerText),
    )

    if (nicknameText !== '24시 마루핀' && nicknameText !== '원모어핀') {
      continue
    }

    if (viewCountNumber < randomViewCount) {
      const newPagePromise = new Promise((x) =>
        browser.once('targetcreated', (target) => x(target.page())),
      )
      console.log('클릭됨 \n', titleText)
      console.log('기존 조회수 \n', viewCountNumber)
      await alink.click({ button: 'middle' })
      await sleep(2000)
      const newPage = (await newPagePromise) as Page // 새 페이지를 얻음
      await newPage.waitForSelector('body')
      await newPage.close()
    }
  }

  await sleep(countInterval)

  await visit({ page, browser, randomViewCount })
}
