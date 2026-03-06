"use client"

import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "./ui/button"
import { useLanguage } from "./language-provider"
import { LanguageSwitcher } from "./language-switcher"
import {
    LayoutDashboard,
    Building2,
    Users,
    Receipt,
    Package,
    DollarSign,
    BarChart3,
    LogOut
} from "lucide-react"

export function DashboardNav() {
    const { data: session } = useSession()
    const { locale } = useLanguage()

    const translations: any = {
        en: {
            dashboard: "Dashboard",
            organizations: "Organizations",
            customers: "Customers",
            transactions: "Transactions",
            inventory: "Inventory",
            expenses: "Expenses",
            reports: "Reports",
            signOut: "Sign Out"
        },
        ur: {
            dashboard: "ڈیش بورڈ",
            organizations: "تنظیمیں",
            customers: "کسٹمرز",
            transactions: "لین دین",
            inventory: "انوینٹری",
            expenses: "اخراجات",
            reports: "رپورٹس",
            signOut: "لاگ آؤٹ"
        }
    }

    const t = translations[locale] || translations.en

    const navItems = [
        { name: t.dashboard, href: "/dashboard", icon: LayoutDashboard },
        { name: t.organizations, href: "/dashboard/organizations", icon: Building2 },
        { name: t.customers, href: "/dashboard/customers", icon: Users },
        { name: t.transactions, href: "/dashboard/transactions", icon: Receipt },
        { name: t.inventory, href: "/dashboard/inventory", icon: Package },
        { name: t.expenses, href: "/dashboard/expenses", icon: DollarSign },
        { name: t.reports, href: "/dashboard/reports", icon: BarChart3 },
    ]

    return (
        <nav className="w-64 bg-card border-r border-border min-h-screen p-4 flex flex-col">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-primary">Khata</h1>
                <p className="text-sm text-muted-foreground mt-1">Digital Ledger</p>
            </div>

            <div className="space-y-2 flex-1">
                {navItems.map((item) => {
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                            <Icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    )
                })}
            </div>

            <div className="mt-auto pt-4 space-y-4">
                <div className="px-3">
                    <LanguageSwitcher />
                </div>
                
                <div className="pt-4 border-t border-border">
                    <div className="flex items-center gap-3 px-3 py-2 mb-2">
                        <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                            {session?.user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{session?.user?.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3"
                        onClick={() => signOut({ callbackUrl: "/login" })}
                    >
                        <LogOut className="h-5 w-5" />
                        {t.signOut}
                    </Button>
                </div>
            </div>
        </nav>
    )
}
