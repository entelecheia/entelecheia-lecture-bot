import { ThemeMode } from '../configs'

export function detectSystemColorScheme() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return ThemeMode.Dark
  }
  return ThemeMode.Light
}
