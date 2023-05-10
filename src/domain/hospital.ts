import puppeteer, { Browser, Page } from 'puppeteer-core'
const CHILD_NAME = '김선율'

export const reserve = async ({
  page,
  browser,
  row,
  teacher,
}: {
  page: Page
  browser: Browser
  row: number
  teacher: number
}) => {
  const tdSelector = `table.ssTd100 > tbody > tr:nth-child(${row}) > td:nth-child(${teacher})`
  const tdElement = await page.$(tdSelector)

  if (!tdElement) {
    console.error('tdElement 없음')
    return
  }
  const childElements = await tdElement.$$('div')

  for (let j = 0; j < childElements.length; j++) {
    const innerText = await childElements[j]?.evaluate((el) => el.innerText)
    if (innerText.trim() === '예약가능') {
      await childElements[j].click()

      const newTarget = await browser.waitForTarget(
        (target) => target.opener() === page.target(),
      )
      const modalPage = await newTarget.page()

      if (!modalPage) {
        console.error('modal 없음')
        return
      }

      const $reservationButtonSelector =
        '#divInfo > table:nth-child(2) > tbody > tr > td:nth-child(1) > table > tbody > tr > td:nth-child(2)'
      await modalPage.waitForSelector($reservationButtonSelector)

      await modalPage.click($reservationButtonSelector)

      const $selectSelector = '#stChildSelect'

      await modalPage.waitForSelector($selectSelector)
      await modalPage.select($selectSelector, CHILD_NAME)

      const $submitButtonSelector = `#divForm > form > table:nth-child(6) > tbody > tr > td:nth-child(1) > table > tbody > tr > td:nth-child(2) > font > b`

      await modalPage.waitForSelector($submitButtonSelector)

      modalPage.click($submitButtonSelector)

      return true
    }
  }
}
