document.addEventListener('DOMContentLoaded', () => {
  const macroForm = document.getElementById('macro-form')
  const clearButton = document.getElementById('clear-button')

  if (macroForm) {
    macroForm.addEventListener('submit', (e) => {
      e.preventDefault()
      let options = document.getElementsByName('options') as NodeListOf<HTMLInputElement>

      let selectedOption
      for (let i = 0; i < options.length; i++) {
        if (options[i].checked) {
          selectedOption = options[i].value
          break
        }
      }

      const phonePart1 = (document.getElementById('phone-part1') as HTMLInputElement).value
      const phonePart2 = (document.getElementById('phone-part2') as HTMLInputElement).value
      const phonePart3 = (document.getElementById('phone-part3') as HTMLInputElement).value

      window?.electron.send('start-macro', {
        selectedOption,
        phonePart1,
        phonePart2,
        phonePart3,
      })
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
