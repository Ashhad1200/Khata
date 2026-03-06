"use client"

import { useState, useEffect } from "react"
import { Package, Plus, AlertTriangle, TrendingDown, TrendingUp } from "lucide-react"
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

export default function InventoryPage() {
    const [inventory, setInventory] = useState<any[]>([])
    const [branches, setBranches] = useState<any[]>([])
    const [selectedBranchId, setSelectedBranchId] = useState<string>("")
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
                        const allBranches = orgDetail.organization.businesses.flatMap((b: any) => b.branches) || []
                        setBranches(allBranches)
                        if (allBranches.length > 0) {
                            setSelectedBranchId(allBranches[0].id)
                            fetchInventory(allBranches[0].id)
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching branches:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchInventory = async (branchId: string) => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/branches/${branchId}/inventory`)
            if (response.ok) {
                const data = await response.json()
                setInventory(data.inventory || [])
            }
        } catch (error) {
            console.error('Failed to fetch inventory:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchInitialData()
    }, [])

    const metrics = {
        totalProducts: inventory.length,
        lowStockItems: inventory.filter(item => 
            item.lowStockThreshold && Number(item.stock) <= Number(item.lowStockThreshold)
        ).length,
        totalValue: inventory.reduce((sum, item) => 
            sum + (Number(item.stock) * Number(item.product.sellingPrice)), 0
        )
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Inventory Management</h1>
                    <p className="text-muted-foreground mt-2">
                        Track stock levels across branches
                    </p>
                </div>
                <div className="flex gap-2">
                    {branches.length > 0 && (
                        <select
                            value={selectedBranchId}
                            onChange={(e) => {
                                setSelectedBranchId(e.target.value)
                                fetchInventory(e.target.value)
                            }}
                            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            {branches.map((branch) => (
                                <option key={branch.id} value={branch.id}>{branch.name}</option>
                            ))}
                        </select>
                    )}
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button disabled={!selectedBranchId}>
                                <Plus className="h-4 w-4 mr-2" />
                                Update Stock
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Update Stock Level</DialogTitle>
                                <DialogDescription>
                                    Add, subtract, or set stock quantity for a product
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Operation Type</Label>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant={operationType === "ADD" ? "default" : "outline"}
                                            onClick={() => setOperationType("ADD")}
                                            className="flex-1"
                                        >
                                            <TrendingUp className="h-4 w-4 mr-2" />
                                            Add Stock
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={operationType === "SUBTRACT" ? "default" : "outline"}
                                            onClick={() => setOperationType("SUBTRACT")}
                                            className="flex-1"
                                        >
                                            <TrendingDown className="h-4 w-4 mr-2" />
                                            Remove Stock
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="productId">Product ID (Demo)</Label>
                                    <Input id="productId" placeholder="Enter product ID" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="quantity">Quantity</Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        placeholder="100"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes (Optional)</Label>
                                    <Input
                                        id="notes"
                                        placeholder="Reason for stock change"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Update Stock</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.totalProducts}</div>
                        <p className="text-xs text-muted-foreground">In inventory</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${metrics.lowStockItems > 0 ? "text-destructive" : ""}`}>
                            {metrics.lowStockItems}
                        </div>
                        <p className="text-xs text-muted-foreground">Need restock</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">PKR {metrics.totalValue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Inventory value</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Inventory List</CardTitle>
                    <CardDescription>Current stock levels across products</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">Loading inventory...</p>
                        </div>
                    ) : inventory.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-30" />
                            <h3 className="text-xl font-semibold mb-2">No inventory items</h3>
                            <p className="text-muted-foreground mb-6">Add products to start tracking inventory</p>
                        </div>
                    ) : (
                        <div className="relative overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-muted-foreground uppercase border-b">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Product Name</th>
                                        <th className="px-6 py-3 font-medium">SKU</th>
                                        <th className="px-6 py-3 font-medium">Price</th>
                                        <th className="px-6 py-3 font-medium">Stock</th>
                                        <th className="px-6 py-3 font-medium">Unit</th>
                                        <th className="px-6 py-3 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inventory.map((item) => {
                                        const isLowStock = item.lowStockThreshold && Number(item.stock) <= Number(item.lowStockThreshold)
                                        return (
                                            <tr key={item.id} className="border-b hover:bg-muted/50 transition-colors">
                                                <td className="px-6 py-4 font-medium">{item.product?.name}</td>
                                                <td className="px-6 py-4 text-xs font-mono">{item.product?.sku}</td>
                                                <td className="px-6 py-4">PKR {Number(item.product?.sellingPrice).toLocaleString()}</td>
                                                <td className={`px-6 py-4 font-bold ${isLowStock ? "text-destructive" : ""}`}>
                                                    {Number(item.stock).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4">{item.product?.unit}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        isLowStock ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                                                    }`}>
                                                        {isLowStock ? "Low Stock" : "In Stock"}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
