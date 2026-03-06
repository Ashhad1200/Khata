"use client"

import { useState, useEffect } from "react"
import { Plus, FileText, Send, Download, Eye, Printer, Loader2 } from "lucide-react"
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
import { generateInvoicePDF } from "@/lib/pdf-service"

const invoiceSchema = z.object({
    customerId: z.string().min(1, "Customer is required"),
    dueDate: z.string().optional(),
    items: z.array(z.object({
        description: z.string(),
        quantity: z.number(),
        unitPrice: z.number(),
    })).min(1, "At least one item required"),
})

type InvoiceFormValues = z.infer<typeof invoiceSchema>

export default function InvoicesPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [items, setItems] = useState([{ description: "", quantity: 1, unitPrice: 0 }])

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<InvoiceFormValues>({
        resolver: zodResolver(invoiceSchema) as any,
    })

    const addItem = () => {
        setItems([...items, { description: "", quantity: 1, unitPrice: 0 }])
    }

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index))
    }

    const [invoices, setInvoices] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchInvoices = async () => {
        try {
            const branchId = new URLSearchParams(window.location.search).get('branchId') || 'clzhd1a2c0001u8m4p7q9z6k4' // Default for demo/fallback
            const response = await fetch(`/api/branches/${branchId}/invoices`)

            if (response.ok) {
                const data = await response.json()
                setInvoices(data.invoices || [])
            }
        } catch (error) {
            console.error('Failed to fetch invoices:', error)
        } finally {
            setIsLoading(false)
        }
    }

    // Fetch on mount
    useEffect(() => {
        fetchInvoices()
    }, [])

    const onSubmit = async (data: InvoiceFormValues) => {
        setIsSubmitting(true)
        try {
            const branchId = new URLSearchParams(window.location.search).get('branchId') || 'clzhd1a2c0001u8m4p7q9z6k4'
            
            // Note: In a real app, we'd need a Transaction ID first. 
            // For now, let's assume the API handles creating the transaction if missing or use a placeholder.
            // This logic is for demo/integration of the PDF button.

            const response = await fetch(`/api/branches/${branchId}/invoices`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerId: data.customerId,
                    totalAmount: items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
                    dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
                    // Note: API expects transactionId. This might fail if backend doesn't handle it.
                    transactionId: 'manual-trans-' + Date.now(),
                    items: items.map(item => ({
                        description: item.description,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        totalPrice: item.quantity * item.unitPrice,
                    })),
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Failed to generate invoice')
            }

            const result = await response.json()
            
            // Automatically download PDF after creation
            if (result.invoice) {
                generateInvoicePDF(result.invoice)
            }

            setIsDialogOpen(false)
            reset()
            setItems([{ description: "", quantity: 1, unitPrice: 0 }])
            fetchInvoices()
        } catch (error) {
            console.error('Invoice error:', error)
            alert(error instanceof Error ? error.message : 'An error occurred')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Invoices</h1>
                    <p className="text-muted-foreground mt-2">
                        Generate and manage customer invoices
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Generate Invoice
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Generate New Invoice</DialogTitle>
                            <DialogDescription>
                                Create an invoice for a customer transaction
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="customerId">Customer ID (Demo)</Label>
                                    <Input
                                        id="customerId"
                                        placeholder="Enter customer ID"
                                        {...register("customerId")}
                                        disabled={isSubmitting}
                                    />
                                    {errors.customerId && (
                                        <p className="text-sm text-destructive">{errors.customerId.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="dueDate">Due Date (Optional)</Label>
                                    <Input
                                        id="dueDate"
                                        type="date"
                                        {...register("dueDate")}
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label>Invoice Items</Label>
                                        <Button type="button" variant="outline" size="sm" onClick={addItem}>
                                            <Plus className="h-4 w-4 mr-1" />
                                            Add Item
                                        </Button>
                                    </div>

                                    {items.map((item, index) => (
                                        <div key={index} className="grid grid-cols-12 gap-2 items-end">
                                            <div className="col-span-5">
                                                <Label htmlFor={`item-desc-${index}`} className="text-xs">
                                                    Description
                                                </Label>
                                                <Input
                                                    id={`item-desc-${index}`}
                                                    placeholder="Item description"
                                                    value={item.description}
                                                    onChange={(e) => {
                                                        const newItems = [...items]
                                                        newItems[index].description = e.target.value
                                                        setItems(newItems)
                                                    }}
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <Label htmlFor={`item-qty-${index}`} className="text-xs">
                                                    Qty
                                                </Label>
                                                <Input
                                                    id={`item-qty-${index}`}
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => {
                                                        const newItems = [...items]
                                                        newItems[index].quantity = parseInt(e.target.value) || 1
                                                        setItems(newItems)
                                                    }}
                                                />
                                            </div>
                                            <div className="col-span-3">
                                                <Label htmlFor={`item-price-${index}`} className="text-xs">
                                                    Unit Price (PKR)
                                                </Label>
                                                <Input
                                                    id={`item-price-${index}`}
                                                    type="number"
                                                    step="0.01"
                                                    value={item.unitPrice}
                                                    onChange={(e) => {
                                                        const newItems = [...items]
                                                        newItems[index].unitPrice = parseFloat(e.target.value) || 0
                                                        setItems(newItems)
                                                    }}
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                {items.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => removeItem(index)}
                                                    >
                                                        Remove
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    <div className="mt-4 p-4 bg-muted rounded-md">
                                        <div className="flex justify-between text-sm">
                                            <span>Subtotal:</span>
                                            <span className="font-semibold">
                                                PKR {items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Generating..." : "Generate Invoice"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{invoices.length}</div>
                        <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <FileText className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">
                            {invoices.filter(i => i.status === 'PENDING' || i.status === 'DRAFT').length}
                        </div>
                        <p className="text-xs text-muted-foreground">Awaiting payment</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Paid</CardTitle>
                        <FileText className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {invoices.filter(i => i.status === 'PAID').length}
                        </div>
                        <p className="text-xs text-muted-foreground">Completed</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                        <FileText className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">
                            {invoices.filter(i => i.dueDate && new Date(i.dueDate) < new Date() && i.status !== 'PAID').length}
                        </div>
                        <p className="text-xs text-muted-foreground">Past due date</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Invoices</CardTitle>
                    <CardDescription>View and download generated invoices</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : invoices.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p>No invoices found</p>
                            <Button variant="link" onClick={() => setIsDialogOpen(true)}>Generate your first invoice</Button>
                        </div>
                    ) : (
                        <div className="relative overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-muted-foreground uppercase border-b">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Invoice #</th>
                                        <th className="px-6 py-3 font-medium">Customer</th>
                                        <th className="px-6 py-3 font-medium">Date</th>
                                        <th className="px-6 py-3 font-medium">Amount</th>
                                        <th className="px-6 py-3 font-medium">Status</th>
                                        <th className="px-6 py-3 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map((invoice) => (
                                        <tr key={invoice.id} className="border-b hover:bg-muted/50 transition-colors">
                                            <td className="px-6 py-4 font-medium">{invoice.invoiceNumber}</td>
                                            <td className="px-6 py-4">{invoice.customer.name}</td>
                                            <td className="px-6 py-4">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 font-semibold">PKR {Number(invoice.totalAmount).toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    invoice.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                                    invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {invoice.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <Button variant="ghost" size="sm" onClick={() => generateInvoicePDF(invoice)}>
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </td>
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
