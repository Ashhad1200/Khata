"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Users,
    Package,
    Receipt,
    Calendar,
    BarChart3
} from "lucide-react"

export default function ReportsPage() {
    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Reports & Analytics</h1>
                <p className="text-muted-foreground mt-2">
                    Business insights and performance metrics
                </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">PKR 0</div>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                            <span className="text-green-500">0%</span> from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">PKR 0</div>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                            <span className="text-red-500">0%</span> from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">PKR 0</div>
                        <p className="text-xs text-muted-foreground">Revenue - Expenses</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">PKR 0</div>
                        <p className="text-xs text-muted-foreground">Pending payments</p>
                    </CardContent>
                </Card>
            </div>

            {/* Report Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <DollarSign className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle>Sales Report</CardTitle>
                                <CardDescription>Revenue and sales analytics</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>• Daily/Monthly/Yearly sales</li>
                            <li>• Sales by customer</li>
                            <li>• Sales by product</li>
                            <li>• Payment method breakdown</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/10 rounded-lg">
                                <Users className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <CardTitle>Customer Analytics</CardTitle>
                                <CardDescription>Customer insights</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>• Top customers by revenue</li>
                            <li>• Customer balance summary</li>
                            <li>• New vs returning customers</li>
                            <li>• Customer payment behavior</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Package className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle>Inventory Report</CardTitle>
                                <CardDescription>Stock and inventory</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>• Current stock levels</li>
                            <li>• Low stock alerts</li>
                            <li>• Stock movement history</li>
                            <li>• Inventory valuation</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-500/10 rounded-lg">
                                <TrendingDown className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <CardTitle>Expense Analysis</CardTitle>
                                <CardDescription>Cost breakdown</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>• Expenses by category</li>
                            <li>• Monthly expense trends</li>
                            <li>• Expense vs revenue ratio</li>
                            <li>• Cost optimization insights</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                                <BarChart3 className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <CardTitle>Profit & Loss</CardTitle>
                                <CardDescription>Financial statements</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>• Income statement</li>
                            <li>• Gross profit margin</li>
                            <li>• Net profit calculation</li>
                            <li>• Period comparison</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-500/10 rounded-lg">
                                <Receipt className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div>
                                <CardTitle>Outstanding Payments</CardTitle>
                                <CardDescription>Receivables tracking</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>• Aging analysis</li>
                            <li>• Overdue invoices</li>
                            <li>• Customer-wise outstanding</li>
                            <li>• Collection efficiency</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* Date Range Selector Placeholder */}
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>Report Filters</CardTitle>
                    <CardDescription>Select date range and filters for detailed reports</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Start Date</label>
                            <input
                                type="date"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">End Date</label>
                            <input
                                type="date"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Report Type</label>
                            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                <option>Sales Report</option>
                                <option>Expense Report</option>
                                <option>Profit & Loss</option>
                                <option>Customer Report</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">
                            Generate Report
                        </button>
                        <button className="px-4 py-2 border border-input rounded-md text-sm font-medium hover:bg-accent">
                            Export PDF
                        </button>
                        <button className="px-4 py-2 border border-input rounded-md text-sm font-medium hover:bg-accent">
                            Export Excel
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
