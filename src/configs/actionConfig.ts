import { BracesIcon, CardHeadingIcon, TranslateIcon } from './Icons'
import { getPreferredLanguage } from './userConfig'

export const ActionConfig = {
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
