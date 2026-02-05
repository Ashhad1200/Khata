import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Decimal } from "@prisma/client/runtime/library"

// GET /api/branches/[branchId]/inventory - Get branch inventory
export async function GET(
    request: Request,
    { params }: { params: { branchId: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const departmentId = searchParams.get('departmentId')
        const lowStock = searchParams.get('lowStock') === 'true'

        const inventory = await prisma.branchInventory.findMany({
            where: {
                branchId: params.branchId,
                ...(departmentId && { departmentId }),
                ...(lowStock && {
                    stock: {
                        lte: prisma.branchInventory.fields.lowStockThreshold
                    }
                }),
            },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        sku: true,
                        sellingPrice: true,
                        unit: true,
                        category: true,
                    }
                },
                branch: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                department: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        })

        return NextResponse.json({ inventory })
    } catch (error) {
        console.error("[INVENTORY_GET]", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

// POST /api/branches/[branchId]/inventory - Add/Update inventory
export async function POST(
    request: Request,
    { params }: { params: { branchId: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const body = await request.json()
        const {
            productId,
            departmentId,
            stock,
            lowStockThreshold,
            action // 'set', 'add', 'subtract'
        } = body

        if (!productId || stock === undefined) {
            return NextResponse.json(
                { error: "Product ID and stock are required" },
                { status: 400 }
            )
        }

        // Check if inventory exists
        const existing = await prisma.branchInventory.findUnique({
            where: {
                productId_branchId_departmentId: {
                    productId,
                    branchId: params.branchId,
                    departmentId: departmentId || null
                }
            }
        })

        let newStock = new Decimal(stock)

        if (existing && action) {
            if (action === 'add') {
                newStock = new Decimal(existing.stock).plus(stock)
            } else if (action === 'subtract') {
                newStock = new Decimal(existing.stock).minus(stock)
                if (newStock.isNegative()) {
                    return NextResponse.json(
                        { error: "Insufficient stock" },
                        { status: 400 }
                    )
                }
            }
        }

        const inventory = await prisma.branchInventory.upsert({
            where: {
                productId_branchId_departmentId: {
                    productId,
                    branchId: params.branchId,
                    departmentId: departmentId || null
                }
            },
            create: {
                productId,
                branchId: params.branchId,
                departmentId,
                stock: newStock,
                lowStockThreshold: lowStockThreshold ? new Decimal(lowStockThreshold) : null,
                lastRestocked: new Date(),
            },
            update: {
                stock: newStock,
                ...(lowStockThreshold !== undefined && {
                    lowStockThreshold: new Decimal(lowStockThreshold)
                }),
                lastRestocked: new Date(),
            },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        sku: true,
                    }
                }
            }
        })

        // Create stock movement record
        await prisma.stockMovement.create({
            data: {
                productId,
                branchInventoryId: inventory.id,
                type: action === 'subtract' ? 'OUT' : 'IN',
                quantity: new Decimal(stock),
                reason: action || 'manual_adjustment',
                createdById: session.user.id,
            }
        })

        return NextResponse.json(
            { inventory, message: "Inventory updated successfully" },
            { status: 200 }
        )
    } catch (error) {
        console.error("[INVENTORY_POST]", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
