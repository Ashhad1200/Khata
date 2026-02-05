import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Decimal } from "@prisma/client/runtime/library"

// POST /api/branches/transfer-stock - Transfer stock between branches
export async function POST(request: Request) {
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
            fromBranchId,
            toBranchId,
            fromDepartmentId,
            toDepartmentId,
            quantity,
            reason
        } = body

        if (!productId || !fromBranchId || !toBranchId || !quantity) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        if (fromBranchId === toBranchId && fromDepartmentId === toDepartmentId) {
            return NextResponse.json(
                { error: "Source and destination cannot be the same" },
                { status: 400 }
            )
        }

        // Check source inventory
        const sourceInventory = await prisma.branchInventory.findUnique({
            where: {
                productId_branchId_departmentId: {
                    productId,
                    branchId: fromBranchId,
                    departmentId: fromDepartmentId || null
                }
            }
        })

        if (!sourceInventory) {
            return NextResponse.json(
                { error: "Source inventory not found" },
                { status: 404 }
            )
        }

        if (new Decimal(sourceInventory.stock).lessThan(quantity)) {
            return NextResponse.json(
                { error: "Insufficient stock for transfer" },
                { status: 400 }
            )
        }

        // Perform transfer in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Deduct from source
            const updatedSource = await tx.branchInventory.update({
                where: {
                    productId_branchId_departmentId: {
                        productId,
                        branchId: fromBranchId,
                        departmentId: fromDepartmentId || null
                    }
                },
                data: {
                    stock: {
                        decrement: new Decimal(quantity)
                    }
                }
            })

            // Add to destination (upsert in case it doesn't exist)
            const updatedDest = await tx.branchInventory.upsert({
                where: {
                    productId_branchId_departmentId: {
                        productId,
                        branchId: toBranchId,
                        departmentId: toDepartmentId || null
                    }
                },
                create: {
                    productId,
                    branchId: toBranchId,
                    departmentId: toDepartmentId,
                    stock: new Decimal(quantity),
                    lastRestocked: new Date(),
                },
                update: {
                    stock: {
                        increment: new Decimal(quantity)
                    },
                    lastRestocked: new Date(),
                }
            })

            // Create stock movement records
            await tx.stockMovement.create({
                data: {
                    productId,
                    branchInventoryId: updatedSource.id,
                    type: 'TRANSFER',
                    quantity: new Decimal(quantity).negated(),
                    reason: reason || 'stock_transfer',
                    fromBranchId,
                    toBranchId,
                    createdById: session.user.id,
                }
            })

            await tx.stockMovement.create({
                data: {
                    productId,
                    branchInventoryId: updatedDest.id,
                    type: 'TRANSFER',
                    quantity: new Decimal(quantity),
                    reason: reason || 'stock_transfer',
                    fromBranchId,
                    toBranchId,
                    createdById: session.user.id,
                }
            })

            return { source: updatedSource, destination: updatedDest }
        })

        return NextResponse.json(
            {
                transfer: result,
                message: "Stock transferred successfully"
            },
            { status: 200 }
        )
    } catch (error) {
        console.error("[STOCK_TRANSFER]", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
