import { CssBaseline, GeistProvider, Radio, Select, Text, useToasts } from '@geist-ui/core'
import { capitalize } from 'lodash-es'
import { Fragment } from 'preact'
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks'
import Browser from 'webextension-polyfill'
import '../../styles/base.css'
import {
  getUserConfig,
  LanguageMode,
  ThemeMode,
  TiggerModeText,
  TriggerMode,
  updateUserConfig,
} from '../configs'
import { detectSystemColorScheme, getExtensionVersion } from '../utils'
import ApiOption from './ApiOption'

const favicon = Browser.runtime.getURL('favicon.png')

function OptionsPage(props: { theme: ThemeMode; onThemeChange: (theme: ThemeMode) => void }) {
  const [triggerMode, setTriggerMode] = useState<TriggerMode>(TriggerMode.Automatically)
  const [language, setLanguage] = useState<LanguageMode>(LanguageMode.Auto)
  const { setToast } = useToasts()

  useEffect(() => {
    getUserConfig().then((config) => {
      setTriggerMode(config.triggerMode)
      setLanguage(config.chatLanguage)
    })
  }, [])

  const onTriggerModeChange = useCallback(
    (mode: TriggerMode) => {
      setTriggerMode(mode)
      updateUserConfig({ triggerMode: mode })
      setToast({ text: 'Changes saved', type: 'success' })
    },
    [setToast],
  )

  const onThemeChange = useCallback(
    (theme: ThemeMode) => {
      updateUserConfig({ themeMode: theme })
      props.onThemeChange(theme)
      setToast({ text: 'Changes saved', type: 'success' })
    },
    [props, setToast],
  )

  const onLanguageChange = useCallback(
    (language: LanguageMode) => {
      updateUserConfig({ chatLanguage: language })
      setToast({ text: 'Changes saved', type: 'success' })
    },
    [setToast],
  )

  return (
    <Fragment>
      <div className="container mx-auto">
        <nav className="flex flex-row justify-center items-center mt-5 px-2 mx-auto">
          <div className="flex flex-row items-center gap-2">
            <img src={favicon} className="w-10 h-10 rounded-lg" />
            <span className="font-semibold">
              LectureBot for ἐντελέχεια.άι(v{getExtensionVersion()})
            </span>
          </div>
        </nav>
        <main className="w-[500px] mx-auto mt-14">
          <Text h2>Options</Text>
          <Text h3 className="mt-5">
            Trigger Mode
          </Text>
          <Radio.Group
            value={triggerMode}
            onChange={(val) => onTriggerModeChange(val as TriggerMode)}
          >
            {Object.entries(TiggerModeText).map(([value, texts]) => {
              return (
                <Radio key={value} value={value}>
                  {texts.title}
                  <Radio.Description>{texts.desc}</Radio.Description>
                </Radio>
              )
            })}
          </Radio.Group>
          <Text h3 className="mt-5">
            Theme
          </Text>
          <Radio.Group
            value={props.theme}
            onChange={(val) => onThemeChange(val as ThemeMode)}
            useRow
          >
            {Object.entries(ThemeMode).map(([k, v]) => {
              return (
                <Radio key={v} value={v}>
                  {k}
                </Radio>
              )
            })}
          </Radio.Group>
          <Text h3 className="mt-5 mb-0">
            Language
          </Text>
          <Text className="my-1">
            The language used in ChatGPT response. <span className="italic">Auto</span> is
            recommended.
          </Text>
          <Select
            value={language}
            placeholder="Choose one"
            onChange={(val) => onLanguageChange(val as LanguageMode)}
          >
            {Object.entries(LanguageMode).map(([k, v]) => (
              <Select.Option key={k} value={v}>
                {capitalize(v)}
              </Select.Option>
            ))}
          </Select>
          <Text h3 className="mt-5 mb-0">
            API Provider
          </Text>
          <ApiOption />
        </main>
      </div>
    </Fragment>
  )
}

function App() {
  const [theme, setTheme] = useState(ThemeMode.Auto)

  const themeType = useMemo(() => {
    if (theme === ThemeMode.Auto) {
      return detectSystemColorScheme()
    }
    return theme
  }, [theme])

  useEffect(() => {
    getUserConfig().then((config) => setTheme(config.themeMode))
  }, [])

  return (
    <GeistProvider themeType={themeType}>
      <CssBaseline />
      <OptionsPage theme={theme} onThemeChange={setTheme} />
    </GeistProvider>
  )
}

export default App
