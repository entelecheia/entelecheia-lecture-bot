/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { BracesIcon, CardHeadingIcon, TranslateIcon } from '../misc/Icons'
import { getPreferredLanguage } from './userConfig'

type ActionType = {
  icon: any
  label: string
  genPrompt: (selection: string) => Promise<string>
}

export type ActionConfigType = {
  translate: ActionType
  summarize: ActionType
  explain_code: ActionType
}

export const actionConfig: ActionConfigType = {
  translate: {
    icon: TranslateIcon,
    label: 'Translate',
    genPrompt: async (selection: string) => {
      const preferredLanguage = await getPreferredLanguage()
      return (
        `Translate the following into ${preferredLanguage} and only show me the translated content.` +
        `If it is already in ${preferredLanguage},` +
        `translate it into English and only show me the translated content:\n"${selection}"`
      )
    },
  },
  summarize: {
    icon: CardHeadingIcon,
    label: 'Summarize',
    genPrompt: async (selection: string) => {
      const preferredLanguage = await getPreferredLanguage()
      return `Reply in ${preferredLanguage}. Summarize the following as concisely as possible:\n"${selection}"`
    },
  },
  explain_code: {
    icon: BracesIcon,
    label: 'Explain Code',
    genPrompt: async (selection: string) => {
      const preferredLanguage = await getPreferredLanguage()
      return `Reply in ${preferredLanguage}. Explain the following code:\n"${selection}"`
    },
  },
}
