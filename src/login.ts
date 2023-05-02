import { Page } from 'puppeteer-core'

export const login = async ({ page }: { page: Page }) => {
  await page.goto('https://www.ifirstch.com/member.php?sh_type=log')

  const $idSelector =
    'body > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(3) > table > tbody > tr > td > table > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(6) > td > table > tbody > tr:nth-child(1) > td:nth-child(2) > input'
  const $passwordSelector =
    'body > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(3) > table > tbody > tr > td > table > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(6) > td > table > tbody > tr:nth-child(2) > td:nth-child(2) > input'
  const $loginButtonSelector =
    'body > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(3) > table > tbody > tr > td > table > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(6) > td > table > tbody > tr:nth-child(1) > td:nth-child(3) > input[type=image]'

  // 로그인 정보 입력
  await page.waitForSelector($idSelector)
  await page.waitForSelector($passwordSelector)

  // await page.type($idSelector, 'damit')
  // await page.type($passwordSelector, 'shdrn2233!')
  await page.type($idSelector, 'wlals8805')
  await page.type($passwordSelector, 'rla9194!')

  await Promise.all([
    page.click($loginButtonSelector),
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
  ])
}
