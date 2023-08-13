document.addEventListener('DOMContentLoaded', () => {
  const macroForm = document.getElementById('macro-form')
  const clearButton = document.getElementById('clear-button')

  if (macroForm) {
    macroForm.addEventListener('submit', (e) => {
      e.preventDefault()
      const form = e.target as HTMLFormElement
      if (!form) {
        return
      }

      const formData = {} as any

      // 날짜 선택 값을 가져옴
      formData.date = form.date.value

      // 시간 선택 체크박스 값을 가져와 배열에 저장
      const timeSlots = ['time9', 'time10', 'time11', 'time12', 'time13', 'time14', 'time15', 'time16', 'time17']
      formData.times = timeSlots.reduce((selectedTimes, timeSlotId) => {
        const checkbox = form[timeSlotId]
        if (checkbox && checkbox.checked) {
          selectedTimes.push(checkbox.value)
        }
        return selectedTimes
      }, [] as string[])

      // 증상 입력 값을 가져옴
      formData.symptom = form.symptom.value

      window?.electron.send('start-macro', { formData })
    })
  }
  if (clearButton) {
    clearButton.addEventListener('click', () => {
      const logElement = document.querySelector('#log') as HTMLDivElement
      logElement.innerHTML = ''
    })
  }

  // 메인 프로세스에서 전달된 메시지 처리 (옵션)
  // window.electron.on('macro-finished', () => {
  //   console.log('매크로 작업 완료');
  // });
})

window.electron.on('log-message', (logMessage: any) => {
  const logElement = document.querySelector('#log') as HTMLDivElement
  const messageElement = document.createElement('div')
  messageElement.innerHTML = logMessage
  logElement.appendChild(messageElement)
})
