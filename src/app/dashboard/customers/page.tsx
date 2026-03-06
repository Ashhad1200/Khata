"use client"

import { useEffect, useState } from "react"
import { Plus, Users, Phone, Mail, MapPin, CreditCard, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { sendWhatsAppReminder } from "@/lib/whatsapp-service"
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

const customerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    phone: z.string().min(10, "Phone number is required"),
    email: z.string().email().optional().or(z.literal("")),
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
    creditLimit: number
    currentBalance: number
    createdAt: string
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [businesses, setBusinesses] = useState<any[]>([])
    const [selectedBusinessId, setSelectedBusinessId] = useState<string>("")
    const [isLoading, setIsLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Pagination & Search states
    const [searchQuery, setSearchQuery] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalCustomers, setTotalCustomers] = useState(0)
    const limit = 20

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CustomerFormValues>({
        resolver: zodResolver(customerSchema) as any,
    })

    // Fetch businesses first
    const fetchBusinesses = async () => {
        try {
            const orgResponse = await fetch("/api/organizations")
            if (!orgResponse.ok) throw new Error("Failed to fetch organizations")

            const orgs = await orgResponse.json()
            const allBusinesses: any[] = []

            for (const org of orgs) {
                const orgDetailResponse = await fetch(`/api/organizations/${org.id}`)
                if (orgDetailResponse.ok) {
                    const orgDetail = await orgDetailResponse.json()
                    if (orgDetail.organization && orgDetail.organization.businesses) {
                        allBusinesses.push(...orgDetail.organization.businesses)
                    }
                }
            }

            setBusinesses(allBusinesses)
            if (allBusinesses.length > 0) {
                setSelectedBusinessId(allBusinesses[0].id)
            }
        } catch (err) {
            console.error("Error fetching businesses:", err)
            setError("Failed to load businesses")
            setIsLoading(false)
        }
    }

    // Fetch customers for selected business with pagination and search
    const fetchCustomers = async (businessId: string, page: number = 1, search: string = "") => {
        try {
            setIsLoading(true)
            setError(null)

            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(search && { search })
            })

            const response = await fetch(`/api/businesses/${businessId}/customers?${params}`)

            if (!response.ok) {
                throw new Error("Failed to fetch customers")
            }

            const data = await response.json()
            setCustomers(data.customers || [])

            if (data.pagination) {
                setCurrentPage(data.pagination.page)
                setTotalPages(data.pagination.totalPages)
                setTotalCustomers(data.pagination.total)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
            console.error("Error fetching customers:", err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchBusinesses()
    }, [])

    useEffect(() => {
        if (selectedBusinessId) {
            setCurrentPage(1) // Reset to page 1 when business changes
            fetchCustomers(selectedBusinessId, 1, searchQuery)
        }
    }, [selectedBusinessId])

    // Debounced search
    useEffect(() => {
        if (!selectedBusinessId) return

        const timer = setTimeout(() => {
            setCurrentPage(1) // Reset to page 1 on search
            fetchCustomers(selectedBusinessId, 1, searchQuery)
        }, 300) // 300ms debounce

        return () => clearTimeout(timer)
    }, [searchQuery])

    // Handle page change
    const handlePageChange = (page: number) => {
        if (selectedBusinessId) {
            fetchCustomers(selectedBusinessId, page, searchQuery)
        }
    }

    const onSubmit = async (data: CustomerFormValues) => {
        if (!selectedBusinessId) {
            setError("Please select a business first")
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            const response = await fetch(`/api/businesses/${selectedBusinessId}/customers`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...data,
                    creditLimit: data.creditLimit ? parseFloat(data.creditLimit) : 0,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to create customer")
            }

            await fetchCustomers(selectedBusinessId, currentPage, searchQuery)
            setIsDialogOpen(false)
            reset()
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
            console.error("Error creating customer:", err)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Customers</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your customer accounts
                    </p>
                </div>
                <div className="flex gap-2">
                    {businesses.length > 0 && (
                        <select
                            value={selectedBusinessId}
                            onChange={(e) => setSelectedBusinessId(e.target.value)}
                            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            {businesses.map((business) => (
                                <option key={business.id} value={business.id}>
                                    {business.name}
                                </option>
                            ))}
                        </select>
                    )}
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button disabled={!selectedBusinessId}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Customer
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Customer</DialogTitle>
                                <DialogDescription>
                                    Create a new customer account
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Customer Name</Label>
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
                                            placeholder="ahmad@example.com"
                                            {...register("email")}
                                            disabled={isSubmitting}
                                        />
                                        {errors.email && (
                                            <p className="text-sm text-destructive">{errors.email.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
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
                                            step="0.01"
                                            placeholder="50000.00"
                                            {...register("creditLimit")}
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    {error && (
                                        <p className="text-sm text-destructive">{error}</p>
                                    )}
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? "Creating..." : "Add Customer"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {selectedBusinessId && (
                <div className="mb-6 flex items-center justify-between">
                    <SearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Search customers by name, phone, or email..."
                        className="max-w-md"
                    />
                    <div className="text-sm text-muted-foreground">
                        {totalCustomers} customer{totalCustomers !== 1 ? 's' : ''} found
                    </div>
                </div>
            )}

            {error && !isDialogOpen && (
                <div className="mb-6 p-4 bg-destructive/10 border border-destructive rounded-md">
                    <p className="text-sm text-destructive">{error}</p>
                </div>
            )}

            {!selectedBusinessId && businesses.length === 0 && (
                <Card>
                    <CardContent className="pt-12 pb-12 text-center">
                        <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                        <h3 className="text-xl font-semibold mb-2">No businesses found</h3>
                        <p className="text-muted-foreground mb-6">
                            Create a business first to add customers
                        </p>
                    </CardContent>
                </Card>
            )}

            {isLoading && selectedBusinessId ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader>
                                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-muted rounded w-1/2"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                                <div className="h-4 bg-muted rounded w-2/3"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : customers.length === 0 && selectedBusinessId ? (
                <Card>
                    <CardContent className="pt-12 pb-12 text-center">
                        <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                        <h3 className="text-xl font-semibold mb-2">No customers yet</h3>
                        <p className="text-muted-foreground mb-6">
                            Add your first customer to get started
                        </p>
                        <Button onClick={() => setIsDialogOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add First Customer
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {customers.map((customer) => (
                        <Card key={customer.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Users className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{customer.name}</CardTitle>
                                            <CardDescription className="text-xs mt-1">
                                                {customer.phone}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {customer.email && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Mail className="h-4 w-4" />
                                        <span className="truncate">{customer.email}</span>
                                    </div>
                                )}
                                {customer.address && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <MapPin className="h-4 w-4" />
                                        <span className="truncate">{customer.address}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                                        <span>
                                            Balance: <span className={customer.currentBalance > 0 ? "text-yellow-600 font-semibold" : "text-green-600"}>
                                                PKR {Number(customer.currentBalance).toFixed(2)}
                                            </span>
                                        </span>
                                    </div>
                                    {customer.currentBalance > 0 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                            onClick={() => sendWhatsAppReminder(customer.phone, customer.name, customer.currentBalance)}
                                            title="Send WhatsApp Reminder"
                                        >
                                            <MessageCircle className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>Limit: PKR {Number(customer.creditLimit).toFixed(2)}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-3">
                                    Added {new Date(customer.createdAt).toLocaleDateString()}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {selectedBusinessId && customers.length > 0 && totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    isLoading={isLoading}
                />
            )}
        </div>
    )
}
