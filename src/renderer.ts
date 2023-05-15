document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('footballForm') as HTMLFormElement

  form.addEventListener('submit', (event) => {
    event.preventDefault()

    const formData: Record<string, any> = {}
    for (let i = 0; i < form.elements.length; i++) {
      let element = form.elements[i] as HTMLInputElement

      if (element.type === 'submit') {
        continue
      }

      if (element.name.includes('time')) {
        if (element.checked) {
          formData.times = [...(formData.times ?? []), element.name.replace('time', '')]
        }
      } else if (element.type === 'radio') {
        if (element.checked) {
          formData[element.name] = element.value
        }
      } else if (element.name.includes('court')) {
        if (element.checked) {
          formData.courts = [...(formData.courts ?? []), element.value]
        }
      } else {
        formData[element.name] = element.value
      }
    }

    ;(window as any)?.electron.send('start-macro', {
      formData,
    })
  })

  // 메인 프로세스에서 전달된 메시지 처리 (옵션)
  // window.electron.on('macro-finished', () => {
  //   console.log('매크로 작업 완료');
  // });
})
