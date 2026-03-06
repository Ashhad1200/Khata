"use client"

import { Button } from "./ui/button"
import { useLanguage } from "./language-provider"
import { Languages } from "lucide-react"

export function LanguageSwitcher() {
    const { locale, setLocale } = useLanguage()

    return (
        <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => setLocale(locale === "en" ? "ur" : "en")}
        >
            <Languages className="h-4 w-4" />
            <span>{locale === "en" ? "اردو" : "English"}</span>
        </Button>
    )
}
