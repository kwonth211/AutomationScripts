import { Browser, Page } from 'puppeteer-core'
import { sleep } from '../utils'
import { log } from '../logger'
const countInterval = 2 * 60 * 1000

const loadPage = async ({ page }: { page: Page }) => {
  try {
    await page.goto('https://cafe.naver.com/joonggonara', {
      waitUntil: 'networkidle2',
    })
    return true
  } catch (err) {
    return false
  }
}

export const visit = async ({
  page,
  browser,
  randomViewCount,
  nickname1,
  nickname2,
}: {
  randomViewCount: number
  page: Page
  browser: Browser
  nickname1: string
  nickname2: string
}) => {
  await page.goto('https://www.google.com/search?q=concerts+near+new+york')
  let isLoaded = false
  try {
    isLoaded = await loadPage({ page })
  } catch (error) {
    isLoaded = false
  }

  if (!isLoaded) {
    log('페이지 로드 실패')
    await sleep(1000)
    await visit({ page, browser, randomViewCount, nickname1, nickname2 })
    return
  }

  await page.waitForSelector('#topLayerQueryInput')
  await page.type('#topLayerQueryInput', '컬쳐랜드')
  await page.keyboard.press('Enter')

  const tbodySelector = '#main-area > div:nth-child(5) > table > tbody'
  const iframeElement = await page.$('#cafe_main')

  if (!iframeElement) {
    log('iframeElement 없음')
    await visit({ page, browser, randomViewCount, nickname1, nickname2 })
    return
  }
  const frame = await iframeElement.contentFrame()

  if (!frame) {
    log('frame 없음')
    await visit({ page, browser, randomViewCount, nickname1, nickname2 })
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
      await visit({ page, browser, randomViewCount, nickname1, nickname2 })
      return
    }
    const nicknameText = await nickname?.evaluate((el) => el.innerText)
    let viewCountNumber = Number(await viewCount?.evaluate((el) => el.innerText))

    if (nicknameText !== nickname1 && nicknameText !== nickname2) {
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

  log('1분간 대기 합니다..')
  await sleep(countInterval)

  await visit({ page, browser, randomViewCount, nickname1, nickname2 })
}
