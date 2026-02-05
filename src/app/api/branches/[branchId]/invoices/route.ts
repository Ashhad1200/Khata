import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Decimal } from "@prisma/client/runtime/library"

// GET /api/branches/[branchId]/invoices - List invoices
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
        const customerId = searchParams.get('customerId')
        const status = searchParams.get('status')

        const invoices = await prisma.invoice.findMany({
            where: {
                branchId: params.branchId,
                ...(customerId && { customerId }),
                ...(status && { status }),
            },
            include: {
                customer: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                    }
                },
                transaction: {
                    select: {
                        id: true,
                        type: true,
                        createdAt: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 100
        })

        return NextResponse.json({ invoices })
    } catch (error) {
        console.error("[INVOICES_GET]", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

// POST /api/branches/[branchId]/invoices - Create invoice
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
            transactionId,
            customerId,
            totalAmount,
            taxAmount,
            paidAmount,
            dueDate,
            status
        } = body

        if (!transactionId || !customerId || !totalAmount) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        // Generate invoice number (format: INV-YYYYMMDD-XXXX)
        const date = new Date()
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
        const count = await prisma.invoice.count()
        const invoiceNumber = `INV-${dateStr}-${String(count + 1).padStart(4, '0')}`

        const balanceAmount = new Decimal(totalAmount).minus(paidAmount || 0)

        const invoice = await prisma.invoice.create({
            data: {
                invoiceNumber,
                transactionId,
                customerId,
                branchId: params.branchId,
                totalAmount: new Decimal(totalAmount),
                taxAmount: taxAmount ? new Decimal(taxAmount) : null,
                paidAmount: paidAmount ? new Decimal(paidAmount) : new Decimal(0),
                balanceAmount,
                status: status || "DRAFT",
                dueDate: dueDate ? new Date(dueDate) : null,
            },
            include: {
                customer: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                    }
                },
                transaction: {
                    select: {
                        id: true,
                        items: true,
                    }
                }
            }
        })

        return NextResponse.json(
            { invoice, message: "Invoice created successfully" },
            { status: 201 }
        )
    } catch (error) {
        console.error("[INVOICES_POST]", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
