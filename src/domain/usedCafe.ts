import { Browser, Page } from 'puppeteer-core'
import { sleep } from '../utils'
import { log } from '../logger'
const countInterval = 2 * 60 * 1000

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
    log('iframeElement 없음')
    await visit({ page, browser, randomViewCount })
    return
  }
  const frame = await iframeElement.contentFrame()

  if (!frame) {
    log('frame 없음')
    await visit({ page, browser, randomViewCount })
    return
  }
  await frame.waitForSelector(tbodySelector)

  const trElements = await frame.$$(tbodySelector + ' > tr')

  for (let tr of trElements) {
    const [title, _, nickname, date, viewCount] = await tr.$$('td')
    const titleText = await title?.evaluate((el) => el.innerText)
    const alink = await title.$('a')
    if (!alink) {
      log('alink 없음')
      await visit({ page, browser, randomViewCount })
      return
    }
    const nicknameText = await nickname?.evaluate((el) => el.innerText)
    let viewCountNumber = Number(await viewCount?.evaluate((el) => el.innerText))

    if (nicknameText !== '24시 마루핀' && nicknameText !== '원모어핀') {
      continue
    }

    if (viewCountNumber < randomViewCount) {
      const newPagePromise = new Promise((x) => browser.once('targetcreated', (target) => x(target.page())))
      log(`클릭된 닉네임: ${nicknameText}`)
      log(`클릭된 타이틀: ${titleText}`)
      log(`기존 조회수: ${viewCountNumber}`)
      await alink.click({ button: 'middle' })
      await sleep(2000)
      const newPage = (await newPagePromise) as Page // 새 페이지를 얻음
      await newPage.waitForSelector('body')
      await newPage.close()
    }
  }

  log('2분간 대기 합니다..')
  await sleep(countInterval)

  await visit({ page, browser, randomViewCount })
}
