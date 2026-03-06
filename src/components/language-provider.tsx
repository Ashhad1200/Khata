"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

type Locale = "en" | "ur"

interface LanguageContextType {
    locale: Locale
    setLocale: (locale: Locale) => void
    isRTL: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>("en")

    useEffect(() => {
        const savedLocale = localStorage.getItem("khata_locale") as Locale
        if (savedLocale) {
            setLocaleState(savedLocale)
        }
    }, [])

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale)
        localStorage.setItem("khata_locale", newLocale)
    }

    const isRTL = locale === "ur"

    useEffect(() => {
        document.documentElement.dir = isRTL ? "rtl" : "ltr"
        document.documentElement.lang = locale
    }, [isRTL, locale])

    return (
        <LanguageContext.Provider value={{ locale, setLocale, isRTL }}>
            <div className={isRTL ? "font-urdu" : ""}>
                {children}
            </div>
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider")
    }
    return context
}
