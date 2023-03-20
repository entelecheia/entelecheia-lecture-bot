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

  interface Array<T> {
    findLastIndex(predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any): number
  }
}

declare module '*.png' {
  const value: any
  export = value
}

export {}
