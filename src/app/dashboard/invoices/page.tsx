"use client"

import { useState } from "react"
import { Plus, FileText, Send, Download, Eye, Printer } from "lucide-react"
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
        resolver: zodResolver(invoiceSchema),
    })

    const addItem = () => {
        setItems([...items, { description: "", quantity: 1, unitPrice: 0 }])
    }

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index))
    }

    const onSubmit = async (data: InvoiceFormValues) => {
        setIsSubmitting(true)
        try {
            console.log("Invoice data:", { ...data, items })
            alert("Invoice generated (demo mode)")
            setIsDialogOpen(false)
            reset()
            setItems([{ description: "", quantity: 1, unitPrice: 0 }])
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
                                    <Label htmlFor="customerId">Customer</Label>
                                    <select
                                        id="customerId"
                                        {...register("customerId")}
                                        disabled={isSubmitting}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="">Select customer</option>
                                        <option value="demo-customer-1">Demo Customer 1</option>
                                        <option value="demo-customer-2">Demo Customer 2</option>
                                    </select>
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
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <FileText className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">0</div>
                        <p className="text-xs text-muted-foreground">Awaiting payment</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Paid</CardTitle>
                        <FileText className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">0</div>
                        <p className="text-xs text-muted-foreground">Completed</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                        <FileText className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">0</div>
                        <p className="text-xs text-muted-foreground">Past due date</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="pt-12 pb-12 text-center">
                    <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                    <h3 className="text-xl font-semibold mb-2">No invoices yet</h3>
                    <p className="text-muted-foreground mb-6">
                        Generate your first invoice to get started
                    </p>
                    <Button onClick={() => setIsDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Generate First Invoice
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
