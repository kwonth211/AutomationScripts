import { Page } from 'puppeteer-core'
import { log } from '../logger'
import { generateXlsxFileName, sleep } from '../utils'
import xlsx from 'xlsx'
export const start = async ({
  page,
  startYear,
  endYear,
  city,
  gu,
  dong,
}: {
  page: Page
  startYear: string
  endYear: string
  city: string
  gu: string
  dong: string
}) => {
  await page.goto('http://www.nsdi.go.kr/lxportal/?menuno=4085')

  await page.waitForSelector('#searchVO > div.devTable')
  await page.evaluate(
    (cityName, gu, dong) => {
      let $sido = document.querySelector('#shSido') as HTMLSelectElement
      let $gungu = document.querySelector('#shSigungu') as HTMLSelectElement
      let $dong = document.querySelector('#shDong') as HTMLSelectElement
      let event = new Event('change')

      if (!$sido || !$gungu) {
        return
      }

      for (let option of Array.from($sido.options)) {
        if (option.innerText.trim() === cityName) {
          $sido.value = option.value
          break
        }
      }
      $sido.dispatchEvent(event)
      for (let option of Array.from($gungu.options)) {
        if (option.innerText.trim() === gu) {
          $gungu.value = option.value
          break
        }
      }
      $gungu.dispatchEvent(event)
      for (let option of Array.from($dong.options)) {
        if (option.innerText.trim() === dong) {
          $dong.value = option.value
          break
        }
      }
      $dong.dispatchEvent(event)
    },
    city,
    gu,
    dong,
  )

  await page.select('#orderSelect1', '1')
  await page.select('#searchVO > div.devTable > div > select', '50')

  await page.click('#icon_btn_write')
  const wb = xlsx.utils.book_new()
  const header = ['No.', '등록번호', '상호', '소재지', '대표자', '등록일자', '상태', '전화번호']

  let ws = xlsx.utils.aoa_to_sheet([header])
  xlsx.utils.book_append_sheet(wb, ws, 'Data')
  const fileName = generateXlsxFileName()

  let tablePage = 1
  while (true) {
    await sleep(2000)
    // 페이지에서 테이블 데이터를 가져옵니다.
    let trElements = await page.$$('.bl_list > tbody > tr')
    if (trElements.length === 0) {
      log('모든 데이터를 추출하였습니다.')
      break
    }
    const data = []

    for (let i = 0; i < trElements.length; i++) {
      const sangho = await trElements[i].$('td:nth-child(3)')
      const $createdAt = await trElements[i].$('td:nth-child(6)')
      const createdAt = await page.evaluate((el) => el?.innerText, $createdAt)
      if (!createdAt) {
        continue
      }
      const year = Number(createdAt.split('.')[0])
      if (year < Number(startYear) || year > Number(endYear)) {
        log(`${year}년 데이터는 제외합니다.`)
        continue
      }

      const linkElement = await sangho?.$('a')
      if (linkElement) {
        const row = await page.evaluate((el) => el.innerText, trElements[i])

        await linkElement.click()
        await page.waitForNavigation({ waitUntil: 'networkidle0' })

        // phoneNumber를 가져온다.
        const phoneNumberElement = await page.$(
          '#cont_area > div:nth-child(7) > table > tbody > tr:nth-child(4) > td:nth-child(3)',
        )
        let phoneNumber = ''
        if (phoneNumberElement) {
          phoneNumber = await page.evaluate((el) => el.innerHTML, phoneNumberElement)
        }
        data.push({
          row: row.split('\t').filter((x) => x),
          phoneNumber,
        })

        // 돌아가기
        // await page.goBack()
        await page.evaluate((tablePage) => {
          const _window = window as any
          _window.brokerForm.action = `/lxportal/?menuno=4085&pageIndex=${tablePage}`
          _window.brokerForm.submit()
        }, tablePage)
        await page.waitForNavigation({ waitUntil: 'networkidle0' })
        trElements = await page.$$('.bl_list > tbody > tr') // 추가: 페이지 이동 후 다시 요소를 선택합니다.
      }
    }
    // 분리된 데이터를 배열로 변환
    const formattedData = data.map(({ row, phoneNumber }) => [...row, phoneNumber]) // Add phoneNumber to the end of the row

    ws = xlsx.utils.sheet_add_aoa(ws, formattedData, { origin: -1 })
    xlsx.writeFile(wb, fileName)
    log(`${tablePage} 페이지 데이터 추출 완료`)

    // "다음" 버튼이 활성화되어 있는지 확인
    const isNextDisabled = await page.evaluate(() => {
      const nextButton = document.querySelector('a.page_next')
      return nextButton?.hasAttribute('disabled')
    })

    // "다음" 버튼이 활성화되어 있지 않다면 클릭하여 다음 페이지로 이동
    if (!isNextDisabled) {
      await page.evaluate((tablePage) => {
        const _window = window as any
        _window.brokerForm.action = `/lxportal/?menuno=4085&pageIndex=${tablePage}`
        _window.brokerForm.submit()
      }, ++tablePage)
      log(`${tablePage} 페이지로 이동..`)
    } else {
      break
    }
  }

  // 엑셀 파일로 저장
  xlsx.writeFile(wb, 'data.xlsx')
}
