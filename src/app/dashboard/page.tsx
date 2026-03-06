import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, Receipt, TrendingUp } from "lucide-react"
import { getDashboardMetrics } from "@/lib/metrics"

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/login")
    }

    const data = await getDashboardMetrics(session.user.id)

    const metrics = [
        {
            title: "Total Customers",
            value: data.totalCustomers.toString(),
            description: "Active customers",
            icon: Users,
            trend: "", // Trend calculation requires historical data not yet available
        },
        {
            title: "Outstanding Balance",
            value: `PKR ${data.totalPendingPayments.toLocaleString()}`,
            description: "Total receivables",
            icon: TrendingUp,
            trend: "",
        },
        {
            title: "Transactions Today",
            value: data.totalTransactionsToday.toString(),
            description: "Sales & purchases",
            icon: Receipt,
            trend: "",
        },
        {
            title: "Organizations",
            value: data.organizationsCount.toString(),
            description: "Your businesses",
            icon: Building2,
            trend: "",
        },
    ]

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground mt-2">
                    Welcome back, {session.user.name}! Here's what's happening with your business.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {metrics.map((metric) => {
                    const Icon = metric.icon
                    return (
                        <Card key={metric.title}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {metric.title}
                                </CardTitle>
                                <Icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{metric.value}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {metric.description}
                                </p>
                                {metric.trend && (
                                    <p className="text-xs text-green-600 mt-1">
                                        {metric.trend} from last month
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Get started with common tasks</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <a
                            href="/dashboard/organizations"
                            className="block p-4 rounded-lg border border-border hover:bg-accent transition-colors"
                        >
                            <h3 className="font-semibold mb-1">Create Organization</h3>
                            <p className="text-sm text-muted-foreground">
                                Set up your business structure
                            </p>
                        </a>
                        <a
                            href="/dashboard/customers"
                            className="block p-4 rounded-lg border border-border hover:bg-accent transition-colors"
                        >
                            <h3 className="font-semibold mb-1">Add Customer</h3>
                            <p className="text-sm text-muted-foreground">
                                Register a new customer account
                            </p>
                        </a>
                        <a
                            href="/dashboard/transactions"
                            className="block p-4 rounded-lg border border-border hover:bg-accent transition-colors"
                        >
                            <h3 className="font-semibold mb-1">Record Transaction</h3>
                            <p className="text-sm text-muted-foreground">
                                Add a credit or debit entry
                            </p>
                        </a>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest transactions and updates</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8 text-muted-foreground">
                            <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>No recent activity</p>
                            <p className="text-sm mt-1">Start by creating an organization</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
