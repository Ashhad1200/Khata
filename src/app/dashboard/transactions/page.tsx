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
import { SearchBar } from "@/components/ui/search-bar"
import { Pagination } from "@/components/ui/pagination"
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
        resolver: zodResolver(transactionSchema) as any,
        defaultValues: {
            type: "CREDIT",
            paymentMethod: "CASH",
        },
    })

    const onSubmit = async (data: TransactionFormValues) => {
        setIsSubmitting(true)
        try {
            // Get businessId from URL or context
            const businessId = new URLSearchParams(window.location.search).get('businessId') || 'default-business-id'

            const response = await fetch(`/api/businesses/${businessId}/transactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...data,
                    customerId: selectedCustomerId,
                    type: transactionType,
                    amount: parseFloat(data.amount),
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Failed to create transaction')
            }

            const result = await response.json()
            alert(`Transaction recorded successfully! ID: ${result.id}`)
            setIsDialogOpen(false)
            reset()
            // Refresh transactions list
            fetchTransactions()
        } catch (error) {
            console.error('Transaction error:', error)
            alert(error instanceof Error ? error.message : 'An error occurred')
        } finally {
            setIsSubmitting(false)
        }
    }

    const [transactions, setTransactions] = useState<any[]>([])
    const [businesses, setBusinesses] = useState<any[]>([])
    const [selectedBusinessId, setSelectedBusinessId] = useState<string>("")
    const [isLoading, setIsLoading] = useState(true)

    // Fetch businesses and transactions
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
                            fetchTransactions(bizs[0].id)
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

    const fetchTransactions = async (bizId: string) => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/businesses/${bizId}/transactions`)
            if (response.ok) {
                const data = await response.json()
                setTransactions(data.transactions || [])
            }
        } catch (error) {
            console.error("Failed to fetch transactions:", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchInitialData()
    }, [])

    const metrics = {
        totalReceivables: transactions
            .filter(t => t.type === 'CREDIT' && t.status === 'PENDING')
            .reduce((sum, t) => sum + Number(t.amount), 0),
        todaySales: transactions
            .filter(t => t.type === 'CREDIT' && new Date(t.createdAt).toDateString() === new Date().toDateString())
            .reduce((sum, t) => sum + Number(t.amount), 0),
        paymentsReceived: transactions
            .filter(t => t.type === 'DEBIT')
            .reduce((sum, t) => sum + Number(t.amount), 0)
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
                    {businesses.length > 0 && (
                        <select
                            value={selectedBusinessId}
                            onChange={(e) => {
                                setSelectedBusinessId(e.target.value)
                                fetchTransactions(e.target.value)
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
                            <Button onClick={() => setTransactionType("CREDIT")} disabled={!selectedBusinessId}>
                                <Plus className="h-4 w-4 mr-2" />
                                Credit (Sale)
                            </Button>
                        </DialogTrigger>
                        <DialogTrigger asChild>
                            <Button variant="outline" onClick={() => setTransactionType("DEBIT")} disabled={!selectedBusinessId}>
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
                                        <Label htmlFor="customerId">Customer ID (Demo)</Label>
                                        <Input
                                            id="customerId"
                                            placeholder="Enter customer ID"
                                            onChange={(e) => setSelectedCustomerId(e.target.value)}
                                            disabled={isSubmitting}
                                        />
                                    </div>

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
                        <div className="text-2xl font-bold text-destructive">PKR {metrics.totalReceivables.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Outstanding balances</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">PKR {metrics.todaySales.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Credit transactions</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Payments Received</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">PKR {metrics.paymentsReceived.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Debit transactions</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>View all your credit and debit entries</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">Loading transactions...</p>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-12">
                            <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-30" />
                            <h3 className="text-xl font-semibold mb-2">No transactions yet</h3>
                            <p className="text-muted-foreground mb-6">Start recording sales and payments</p>
                        </div>
                    ) : (
                        <div className="relative overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-muted-foreground uppercase border-b">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Date</th>
                                        <th className="px-6 py-3 font-medium">Customer</th>
                                        <th className="px-6 py-3 font-medium">Description</th>
                                        <th className="px-6 py-3 font-medium">Amount</th>
                                        <th className="px-6 py-3 font-medium">Type</th>
                                        <th className="px-6 py-3 font-medium">Method</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((tx) => (
                                        <tr key={tx.id} className="border-b hover:bg-muted/50 transition-colors">
                                            <td className="px-6 py-4">{new Date(tx.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 font-medium">{tx.customer?.name}</td>
                                            <td className="px-6 py-4">{tx.description}</td>
                                            <td className={`px-6 py-4 font-bold ${tx.type === 'CREDIT' ? 'text-yellow-600' : 'text-green-600'}`}>
                                                PKR {Number(tx.amount).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    tx.type === 'CREDIT' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                                                }`}>
                                                    {tx.type === 'CREDIT' ? 'CREDIT (SALE)' : 'DEBIT (PAYMENT)'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-medium">{tx.paymentMethod}</td>
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
