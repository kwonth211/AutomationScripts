// global.d.ts
declare global {
  interface Window {
    selectedTimes: string[]
    electron: {
      send: (channel: any, data: any) => void
      on: (channel: any, callback: any) => void
    }
  }
}

export {}
