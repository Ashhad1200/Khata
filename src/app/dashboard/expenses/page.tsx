"use client"

import { useState, useEffect } from "react"
import { Plus, DollarSign, Calendar, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const expenseSchema = z.object({
    category: z.string().min(1, "Category is required"),
    amount: z.string().min(1, "Amount is required"),
    description: z.string().optional(),
    date: z.string().optional(),
})

type ExpenseFormValues = z.infer<typeof expenseSchema>

const expenseCategories = [
    "RENT",
    "UTILITIES",
    "SALARIES",
    "SUPPLIES",
    "MARKETING",
    "MAINTENANCE",
    "TRANSPORTATION",
    "OTHER",
]

export default function ExpensesPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ExpenseFormValues>({
        resolver: zodResolver(expenseSchema) as any,
    })

    const [expenses, setExpenses] = useState<any[]>([])
    const [businesses, setBusinesses] = useState<any[]>([])
    const [selectedBusinessId, setSelectedBusinessId] = useState<string>("")
    const [isLoading, setIsLoading] = useState(true)

    const fetchInitialData = async () => {
        try {
            const orgResponse = await fetch("/api/organizations")
            if (orgResponse.ok) {
                const orgs = await orgResponse.json()
                if (orgs.length > 0) {
                    const orgDetailResponse = await fetch(`/api/organizations/${orgs[0].id}`)
                    if (orgDetailResponse.ok) {
                        const orgDetail = await orgDetailResponse.json()
                        const bizs = orgDetail.organization.businesses || []
                        setBusinesses(bizs)
                        if (bizs.length > 0) {
                            setSelectedBusinessId(bizs[0].id)
                            fetchExpenses(bizs[0].id)
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching initial data:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchExpenses = async (bizId: string) => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/businesses/${bizId}/expenses`)
            if (response.ok) {
                const data = await response.json()
                setExpenses(data.expenses || [])
            }
        } catch (error) {
            console.error('Failed to fetch expenses:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchInitialData()
    }, [])

    const metrics = {
        thisMonth: expenses
            .filter(e => {
                const d = new Date(e.expenseDate)
                const now = new Date()
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
            })
            .reduce((sum, e) => sum + Number(e.amount), 0),
        today: expenses
            .filter(e => new Date(e.expenseDate).toDateString() === new Date().toDateString())
            .reduce((sum, e) => sum + Number(e.amount), 0),
        categories: new Set(expenses.map(e => e.category)).size
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Expenses</h1>
                    <p className="text-muted-foreground mt-2">
                        Track business expenses and costs
                    </p>
                </div>
                <div className="flex gap-2">
                    {businesses.length > 0 && (
                        <select
                            value={selectedBusinessId}
                            onChange={(e) => {
                                setSelectedBusinessId(e.target.value)
                                fetchExpenses(e.target.value)
                            }}
                            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            {businesses.map((biz) => (
                                <option key={biz.id} value={biz.id}>{biz.name}</option>
                            ))}
                        </select>
                    )}
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button disabled={!selectedBusinessId}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Expense
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Record Expense</DialogTitle>
                                <DialogDescription>
                                    Add a new business expense entry
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Category</Label>
                                        <select
                                            id="category"
                                            {...register("category")}
                                            disabled={isSubmitting}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <option value="">Select category</option>
                                            {expenseCategories.map((cat) => (
                                                <option key={cat} value={cat}>
                                                    {cat.charAt(0) + cat.slice(1).toLowerCase().replace("_", " ")}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.category && (
                                            <p className="text-sm text-destructive">{errors.category.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="amount">Amount (PKR)</Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            step="0.01"
                                            placeholder="5000.00"
                                            {...register("amount")}
                                            disabled={isSubmitting}
                                        />
                                        {errors.amount && (
                                            <p className="text-sm text-destructive">{errors.amount.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Input
                                            id="description"
                                            placeholder="What was this expense for?"
                                            {...register("description")}
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="date">Date</Label>
                                        <Input
                                            id="date"
                                            type="date"
                                            {...register("date")}
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? "Recording..." : "Record Expense"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">This Month</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">PKR {metrics.thisMonth.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Total expenses</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">PKR {metrics.today.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Expenses today</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Categories</CardTitle>
                        <Tag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.categories}</div>
                        <p className="text-xs text-muted-foreground">Active categories</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Expense History</CardTitle>
                    <CardDescription>View and manage your business costs</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">Loading expenses...</p>
                        </div>
                    ) : expenses.length === 0 ? (
                        <div className="text-center py-12">
                            <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-30" />
                            <h3 className="text-xl font-semibold mb-2">No expenses recorded</h3>
                            <p className="text-muted-foreground mb-6">Start tracking your business expenses</p>
                        </div>
                    ) : (
                        <div className="relative overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-muted-foreground uppercase border-b">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Date</th>
                                        <th className="px-6 py-3 font-medium">Category</th>
                                        <th className="px-6 py-3 font-medium">Description</th>
                                        <th className="px-6 py-3 font-medium">Amount</th>
                                        <th className="px-6 py-3 font-medium">Recorded By</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenses.map((expense) => (
                                        <tr key={expense.id} className="border-b hover:bg-muted/50 transition-colors">
                                            <td className="px-6 py-4">{new Date(expense.expenseDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                                                    {expense.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">{expense.description}</td>
                                            <td className="px-6 py-4 font-bold text-destructive">
                                                PKR {Number(expense.amount).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-xs">{expense.createdBy?.name}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
