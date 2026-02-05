"use client"

import { useState, useEffect } from "react"
import { Plus, Users as UsersIcon, Phone, Mail, CreditCard } from "lucide-react"
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

const customerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    phone: z.string().min(10, "Phone number is required"),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    address: z.string().optional(),
    creditLimit: z.string().optional(),
})

type CustomerFormValues = z.infer<typeof customerSchema>

interface Customer {
    id: string
    name: string
    phone: string
    email: string | null
    address: string | null
    creditLimit: number | null
    currentBalance: number
    status: string
    customerType: string
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedBusinessId, setSelectedBusinessId] = useState<string>("")

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CustomerFormValues>({
        resolver: zodResolver(customerSchema),
    })

    useEffect(() => {
        // For demo, we'll fetch from first business
        // In real app, user would select business/org first
        fetchCustomers()
    }, [])

    const fetchCustomers = async () => {
        try {
            // This is a placeholder - in real app you'd get businessId from context/state
            setIsLoading(false)
            setCustomers([])
        } catch (error) {
            console.error("Failed to fetch customers:", error)
            setIsLoading(false)
        }
    }

    const onSubmit = async (data: CustomerFormValues) => {
        if (!selectedBusinessId) {
            alert("Please select a business first")
            return
        }

        setIsSubmitting(true)
        try {
            const response = await fetch(`/api/businesses/${selectedBusinessId}/customers`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...data,
                    creditLimit: data.creditLimit ? parseFloat(data.creditLimit) : null,
                }),
            })

            if (response.ok) {
                const result = await response.json()
                setCustomers([result.customer, ...customers])
                setIsDialogOpen(false)
                reset()
            } else {
                const error = await response.json()
                alert(error.error || "Failed to create customer")
            }
        } catch (error) {
            alert("An error occurred. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-muted rounded w-48"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-40 bg-muted rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Customers</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage customer accounts and credit balances
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Customer
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Add New Customer</DialogTitle>
                            <DialogDescription>
                                Create a new customer account for credit transactions
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="grid grid-cols-2 gap-4 py-4">
                                <div className="col-span-2 space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="Ahmad Khan"
                                        {...register("name")}
                                        disabled={isSubmitting}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive">{errors.name.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        placeholder="+92 300 1234567"
                                        {...register("phone")}
                                        disabled={isSubmitting}
                                    />
                                    {errors.phone && (
                                        <p className="text-sm text-destructive">{errors.phone.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email (Optional)</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="customer@example.com"
                                        {...register("email")}
                                        disabled={isSubmitting}
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-destructive">{errors.email.message}</p>
                                    )}
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label htmlFor="address">Address (Optional)</Label>
                                    <Input
                                        id="address"
                                        placeholder="Shop address"
                                        {...register("address")}
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="creditLimit">Credit Limit (PKR)</Label>
                                    <Input
                                        id="creditLimit"
                                        type="number"
                                        placeholder="50000"
                                        {...register("creditLimit")}
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Adding..." : "Add Customer"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {customers.length === 0 ? (
                <Card>
                    <CardContent className="pt-12 pb-12 text-center">
                        <UsersIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                        <h3 className="text-xl font-semibold mb-2">No customers yet</h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            Add your first customer to start tracking credit transactions and managing accounts
                        </p>
                        <Button onClick={() => setIsDialogOpen(true)} size="lg">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Your First Customer
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {customers.map((customer) => (
                        <Card key={customer.id} className="hover:border-primary transition-colors cursor-pointer">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg">{customer.name}</CardTitle>
                                        <CardDescription className="mt-1">
                                            {customer.customerType}
                                        </CardDescription>
                                    </div>
                                    <div className={`text-sm font-semibold ${customer.currentBalance > 0 ? 'text-destructive' : 'text-green-600'}`}>
                                        PKR {customer.currentBalance.toLocaleString()}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Phone className="h-4 w-4" />
                                        <span>{customer.phone}</span>
                                    </div>
                                    {customer.email && (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Mail className="h-4 w-4" />
                                            <span>{customer.email}</span>
                                        </div>
                                    )}
                                    {customer.creditLimit && (
                                        <div className="flex items-center gap-2 text-muted-foreground pt-2 border-t">
                                            <CreditCard className="h-4 w-4" />
                                            <span>Limit: PKR {customer.creditLimit.toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
