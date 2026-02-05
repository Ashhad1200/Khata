"use client"

import { useState } from "react"
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
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [operationType, setOperationType] = useState<"ADD" | "SUBTRACT" | "SET">("ADD")

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Inventory Management</h1>
                    <p className="text-muted-foreground mt-2">
                        Track stock levels across branches
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">In inventory</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">0</div>
                        <p className="text-xs text-muted-foreground">Need restock</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">PKR 0</div>
                        <p className="text-xs text-muted-foreground">Inventory value</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="pt-12 pb-12 text-center">
                    <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                    <h3 className="text-xl font-semibold mb-2">No inventory items</h3>
                    <p className="text-muted-foreground mb-6">
                        Add products to start tracking inventory
                    </p>
                    <Button onClick={() => setIsDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
