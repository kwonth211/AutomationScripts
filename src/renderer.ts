document.addEventListener('DOMContentLoaded', () => {
  const macroForm = document.getElementById('macro-form')

  if (macroForm) {
    macroForm.addEventListener('submit', (e) => {
      e.preventDefault()

      const minRange = (document.getElementById('minRange') as HTMLInputElement).value
      const maxRange = (document.getElementById('maxRange') as HTMLInputElement).value
      const nickname1 = (document.getElementById('nickname1') as HTMLInputElement).value
      const nickname2 = (document.getElementById('nickname2') as HTMLInputElement).value
      const isBackground = (document.getElementById('background') as HTMLInputElement).checked

      if (parseInt(minRange) > parseInt(maxRange)) {
        alert('최소 조회수는 최대 조회수보다 작아야 합니다.')
        return
      }
      window?.electron.send('start-macro', {
        minRange,
        maxRange,
        nickname1,
        nickname2,
        isBackground,
      })
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
