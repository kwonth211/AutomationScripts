import puppeteer, { Browser, Page } from 'puppeteer-core'
import { sleep } from '../utils'

export type ReserveFormData = {
  courts: COURT[]
  date: ''
  times: string[]
  'area-code': string
  'middle-number': string
  'last-number': string
  email: string
  division: 'individual' | 'group'
  event: string
  participatingOrganization: string
  participants: string
  eventDetails: string
}

export const FUTSAL_FIELD = {
  A: 'RENT_FACILITY_000031',
  B: 'RENT_FACILITY_000032',
  C: 'RENT_FACILITY_000033',
  D: 'RENT_FACILITY_000035',
}
type COURT = keyof typeof FUTSAL_FIELD

export const reserve = async ({
  page,
  browser,
  formData,
  court,
}: {
  page: Page
  browser: Browser
  formData: ReserveFormData
  court: COURT
}) => {
  const parts = formData.date.split('-')

  const year = parts[0]
  const month = parts[1]
  const day = parts[2]
  await page.goto(
    `https://www.buk.daegu.kr/reserve/index.do?menu_link=/front/rentFacility/reservationCultureFutsalFrontView.do&menu_id=00002622&site_gn=reser&res_year=${year}&res_month=${month}&res_day=${day}&facility_id=${FUTSAL_FIELD[court]}`,
    {
      waitUntil: 'networkidle2',
    },
  )

  // 동의하기 체크박스
  const $policyCheckboxSelector1 = '#certification-check_y'
  const $policyCheckboxSelector2 = '#persnalAgree_y'

  await page.waitForSelector($policyCheckboxSelector1)
  await page.waitForSelector($policyCheckboxSelector2)
  await page.click($policyCheckboxSelector1)
  await page.click($policyCheckboxSelector2)

  // 사용 시간
  for (let i = 0; i < formData.times.length; i++) {
    const time = formData.times[i]
    const $timeSelector = `#rent_use_time${time}`
    await page.click($timeSelector)
  }

  // 휴대폰
  const $phoneSelector2 = '#s_mobile2'
  const $phoneSelector3 = '#s_mobile3'
  await page.type($phoneSelector2, formData['middle-number'])
  await page.type($phoneSelector3, formData['last-number'])

  // 이메일
  const $emailSelector1 = '#email_1'
  const $emailSelector2 = '#email_2'
  const $emailSelector3 =
    '#rentFacilityVO > div > div.application-form.l-wrap > div > table > tbody > tr:nth-child(5) > td > select'

  await page.waitForSelector($emailSelector3)
  await page.select($emailSelector3, 'etc')

  await page.waitForSelector($emailSelector2)

  await page.type($emailSelector1, formData.email.split('@')[0])
  await page.type($emailSelector2, formData.email.split('@')[1])

  // 구분
  if (formData.division === 'individual') {
    const $individualSelector = '#group_yn1'
    await page.click($individualSelector)
  } else {
    const $groupSelector = '#group_yn2'
    await page.click($groupSelector)
  }

  // 행사명
  const eventSelector = '#event_name'
  await page.type(eventSelector, formData.event)

  // 참여단체
  const participatingOrganizationSelector = '#group_name'
  await page.type(participatingOrganizationSelector, formData.participatingOrganization)

  // 참여인원
  const participantsSelector = '#ppl_cnt'
  await page.type(participantsSelector, formData.participants)

  // 행사내용
  const $eventDetailSelector = '#etc'
  await page.type($eventDetailSelector, formData.eventDetails)

  const $submitButtonSelector =
    '#rentFacilityVO > div > div.application-form.l-wrap > div > div.tc.btn.btn-board > a.active'

  await page.waitForSelector($submitButtonSelector)
  await page.click($submitButtonSelector)

  console.log(`${court}구장 예약 완료!!`)
  await sleep(5000)
}

export const authenticateUser = async ({ page }: { page: Page }) => {
  await page.goto('https://www.buk.daegu.kr/apis/niceSelfCheck/selfCheckChoose.do', {
    waitUntil: 'networkidle2',
  })
}
