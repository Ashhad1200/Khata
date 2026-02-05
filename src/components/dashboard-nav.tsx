"use client"

import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "./ui/button"
import {
    LayoutDashboard,
    Building2,
    Users,
    Receipt,
    Package,
    DollarSign,
    Settings,
    LogOut
} from "lucide-react"

export function DashboardNav() {
    const { data: session } = useSession()

    const navItems = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Organizations", href: "/dashboard/organizations", icon: Building2 },
        { name: "Customers", href: "/dashboard/customers", icon: Users },
        { name: "Transactions", href: "/dashboard/transactions", icon: Receipt },
        { name: "Inventory", href: "/dashboard/inventory", icon: Package },
        { name: "Expenses", href: "/dashboard/expenses", icon: DollarSign },
    ]

    return (
        <nav className="w-64 bg-card border-r border-border min-h-screen p-4">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-primary">Khata</h1>
                <p className="text-sm text-muted-foreground mt-1">Digital Ledger</p>
            </div>

            <div className="space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                            <Icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    )
                })}
            </div>

            <div className="mt-auto pt-8 border-t border-border">
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
                    Sign Out
                </Button>
            </div>
        </nav>
    )
}
