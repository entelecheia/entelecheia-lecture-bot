/* eslint-disable @typescript-eslint/no-explicit-any */
// global.d.ts
declare global {
  interface Navigator {
    userAgentData?: {
      getHighEntropyValues: (hints: string[]) => Promise<{ platform: string; model: string }>
    }
  }

  interface Window {
    opera?: any
  }
}

export {}
