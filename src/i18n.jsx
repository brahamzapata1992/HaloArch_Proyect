import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import en from './locales/en'
import es from './locales/es'

export const LANGUAGES = { en, es }
const STORAGE_KEY = 'halo-lang'

// Priority: ?lang= in the URL (shareable links) → the visitor's saved choice →
// the browser language → English.
function initialLanguage() {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('lang')
    if (fromUrl && LANGUAGES[fromUrl]) return fromUrl
  } catch { /* ignore */ }
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved && LANGUAGES[saved]) return saved
  } catch { /* storage may be blocked */ }
  const browser = (navigator.languages?.[0] || navigator.language || 'en').toLowerCase()
  return browser.startsWith('es') ? 'es' : 'en'
}

const I18nContext = createContext({ lang: 'en', t: en, setLang: () => {} })

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(initialLanguage)

  const setLang = useCallback((next) => {
    if (!LANGUAGES[next]) return
    setLangState(next)
    try { window.localStorage.setItem(STORAGE_KEY, next) } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const value = useMemo(() => ({ lang, t: LANGUAGES[lang], setLang }), [lang, setLang])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export const useI18n = () => useContext(I18nContext)

export function LanguageToggle({ className = '' }) {
  const { lang, setLang, t } = useI18n()
  return (
    <div role="group" aria-label={t.header.language} className={`inline-flex rounded-full border border-black/10 bg-white p-0.5 ${className}`}>
      {Object.keys(LANGUAGES).map((code) => (
        <button
          key={code}
          type="button"
          lang={code}
          aria-pressed={lang === code}
          onClick={() => setLang(code)}
          className={`rounded-full px-2.5 py-1.5 text-[10px] font-semibold tracking-[.12em] transition ${
            lang === code ? 'bg-ink text-white' : 'text-ink/55 hover:text-ink'
          }`}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
