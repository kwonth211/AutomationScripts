import { Browser, Page } from 'puppeteer-core'

const FIELD = {
  signalGrassField: '4',
}

export const authenticateUser = async ({ page, browser }: { page: Page; browser: Browser }) => {
  await page.goto('http://www.gs7330.com/?page_id=2', {
    waitUntil: 'networkidle2',
  })

  await page.evaluate(() => {
    // form element 생성
    const form = document.createElement('form')
    form.name = 'form_chk'
    form.action = 'https://nice.checkplus.co.kr/CheckPlusSafeModel/checkplus.cb'
    form.target = 'popupChk'
    form.method = 'post'

    document.body.appendChild(form)
    form.submit()
  })

  await page.goto('https://nice.checkplus.co.kr/CheckPlusSafeModel/service.cb?m=authMobileMain')

  //   await page.evaluate(() =>
  //     window.open('https://nice.checkplus.co.kr/CheckPlusSafeModel/service.cb?m=authMobileMain', '_blank'),
  //   )
  //   let newTab = await browser.newPage()

  //   const newPagePromise = new Promise((resolve) => browser.once('targetcreated', (target) => resolve(target.page())))

  //   // window.open을 실행. 실제 코드에서는 이 URL을 원하는 것으로 바꿔야 합니다.

  // 새 창이 열릴 때까지 기다림

  // 이제 'popup'은 새 창을 제어하는 데 사용할 수 있습니다.
  // 예를 들어, 새 창에서 특정 URL로 이동하는 것을 시도해 봅니다.
  // await popup.goto('https://example.com')
}
// export const authenticateUser = async ({ page }: { page: Page }) => {
//   await page.goto('http://www.gs7330.com/?page_id=2', {
//     waitUntil: 'networkidle2',
//   })
//   await closePopups({ page })

//   await changeField(page, 'signalGrassField')
//   await page.waitForNavigation()

//   await submitForm(page, '2023-05-31', '2', '0')

//   const agreeButtonSelector = '#agree21'
//   await page.waitForSelector(agreeButtonSelector)
//   await page.click(agreeButtonSelector)
//   const authenticateSelector = 'body > form:nth-child(3) > div > div > a'
//   await page.waitForSelector(authenticateSelector)
//   await page.click(authenticateSelector)

//   //   await page.waitForSelector('#agreeYn', { timeout: 1 * 60 * 1000 })
//   //     await page.click('#agreeYn')
// }

const changeField = async (page: Page, fieldId: keyof typeof FIELD) => {
  await page.evaluate((fieldId) => {
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = `sports_res_index.php?ca=4`
    document.body.appendChild(form)
    form.submit()
  }, fieldId)
}

const submitForm = async (page: Page, wdate: string, ca: string, sun: string) => {
  await page.evaluate(
    (wdate, ca, sun) => {
      const form = document.createElement('form')
      form.method = 'POST' // 'GET' 또는 'POST' 등 원하는 method를 설정하세요.
      form.action = 'sports_res_info.php' // 목표 URL

      const wdateInput = document.createElement('input')
      wdateInput.type = 'hidden'
      wdateInput.name = 'wdate'
      wdateInput.value = wdate
      form.appendChild(wdateInput)

      const caInput = document.createElement('input')
      caInput.type = 'hidden'
      caInput.name = 'ca'
      caInput.value = ca
      form.appendChild(caInput)

      const sunInput = document.createElement('input')
      sunInput.type = 'hidden'
      sunInput.name = 'sun'
      sunInput.value = sun
      form.appendChild(sunInput)

      document.body.appendChild(form)
      form.submit()
    },
    wdate,
    ca,
    sun,
  )
}

export const closePopups = async ({ page }: { page: Page }) => {
  await page.evaluate(() => {
    ;(window as any).closeWin('a')
    ;(window as any).closeWin('b')
    ;(window as any).closeWin('d')
  })
}
