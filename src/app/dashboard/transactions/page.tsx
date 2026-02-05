"use client"

import { useState } from "react"
import { Plus, Receipt, Minus, DollarSign } from "lucide-react"
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

const transactionSchema = z.object({
    type: z.enum(["CREDIT", "DEBIT", "PAYMENT_RECEIVED", "PAYMENT_MADE"]),
    amount: z.string().min(1, "Amount is required"),
    description: z.string().optional(),
    paymentMethod: z.string().default("CASH"),
    referenceNumber: z.string().optional(),
})

type TransactionFormValues = z.infer<typeof transactionSchema>

export default function TransactionsPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [transactionType, setTransactionType] = useState<"CREDIT" | "DEBIT">("CREDIT")

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<TransactionFormValues>({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            type: "CREDIT",
            paymentMethod: "CASH",
        },
    })

    const onSubmit = async (data: TransactionFormValues) => {
        setIsSubmitting(true)
        try {
            // Placeholder - would need businessId and customerId from context
            console.log("Transaction data:", data)
            alert("Transaction recorded (demo mode)")
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
                    <h1 className="text-3xl font-bold">Transactions</h1>
                    <p className="text-muted-foreground mt-2">
                        Record credit and debit entries for customers
                    </p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => setTransactionType("CREDIT")}>
                                <Plus className="h-4 w-4 mr-2" />
                                Credit (Sale)
                            </Button>
                        </DialogTrigger>
                        <DialogTrigger asChild>
                            <Button variant="outline" onClick={() => setTransactionType("DEBIT")}>
                                <Minus className="h-4 w-4 mr-2" />
                                Debit (Payment)
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>
                                    Record {transactionType === "CREDIT" ? "Credit (Sale)" : "Debit (Payment)"}
                                </DialogTitle>
                                <DialogDescription>
                                    {transactionType === "CREDIT"
                                        ? "Add a sale or credit transaction to customer account"
                                        : "Record a payment received from customer"}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="amount">Amount (PKR)</Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            step="0.01"
                                            placeholder="1000.00"
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
                                            placeholder="Items purchased or payment details"
                                            {...register("description")}
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="paymentMethod">Payment Method</Label>
                                            <select
                                                id="paymentMethod"
                                                {...register("paymentMethod")}
                                                disabled={isSubmitting}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <option value="CASH">Cash</option>
                                                <option value="ONLINE">Online Transfer</option>
                                                <option value="JAZZCASH">JazzCash</option>
                                                <option value="EASYPAISA">EasyPaisa</option>
                                                <option value="CHEQUE">Cheque</option>
                                                <option value="BANK">Bank Transfer</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="referenceNumber">Reference # (Optional)</Label>
                                            <Input
                                                id="referenceNumber"
                                                placeholder="Transaction ref"
                                                {...register("referenceNumber")}
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? "Recording..." : "Record Transaction"}
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
                        <CardTitle className="text-sm font-medium">Total Receivables</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">PKR 0</div>
                        <p className="text-xs text-muted-foreground">Outstanding balances</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">PKR 0</div>
                        <p className="text-xs text-muted-foreground">Credit transactions</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Payments Received</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">PKR 0</div>
                        <p className="text-xs text-muted-foreground">Debit transactions</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="pt-12 pb-12 text-center">
                    <Receipt className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                    <h3 className="text-xl font-semibold mb-2">No transactions yet</h3>
                    <p className="text-muted-foreground mb-6">
                        Start recording sales and payments
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
