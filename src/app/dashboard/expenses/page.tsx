"use client"

import { useState } from "react"
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
        resolver: zodResolver(expenseSchema),
    })

    const onSubmit = async (data: ExpenseFormValues) => {
        setIsSubmitting(true)
        try {
            console.log("Expense data:", data)
            alert("Expense recorded (demo mode)")
            setIsDialogOpen(false)
            reset()
        } catch (error) {
            alert("An error occurred")
        } finally {
            setIsSubmitting(false)
        }
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
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">This Month</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">PKR 0</div>
                        <p className="text-xs text-muted-foreground">Total expenses</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">PKR 0</div>
                        <p className="text-xs text-muted-foreground">Expenses today</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Categories</CardTitle>
                        <Tag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">Active categories</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="pt-12 pb-12 text-center">
                    <DollarSign className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                    <h3 className="text-xl font-semibold mb-2">No expenses recorded</h3>
                    <p className="text-muted-foreground mb-6">
                        Start tracking your business expenses
                    </p>
                    <Button onClick={() => setIsDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Record First Expense
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
