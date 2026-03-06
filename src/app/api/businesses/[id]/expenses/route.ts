import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Decimal } from "@prisma/client/runtime/library"

// GET /api/businesses/[businessId]/expenses - List expenses
export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category')
        const branchId = searchParams.get('branchId')
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')

        const expenses = await prisma.expense.findMany({
            where: {
                businessId: params.id,
                ...(category && { category }),
                ...(branchId && { branchId }),
                ...(startDate && endDate && {
                    expenseDate: {
                        gte: new Date(startDate),
                        lte: new Date(endDate)
                    }
                }),
            },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            },
            orderBy: {
                expenseDate: 'desc'
            },
            take: 100
        })

        // Calculate total
        const total = expenses.reduce((sum, expense) =>
            sum + Number(expense.amount), 0
        )

        return NextResponse.json({ expenses, total })
    } catch (error) {
        console.error("[EXPENSES_GET]", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

// POST /api/businesses/[businessId]/expenses - Create expense
export async function POST(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
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
            branchId,
            category,
            amount,
            description,
            paymentMethod,
            receiptUrl,
            expenseDate
        } = body

        if (!category || !amount || !paymentMethod) {
            return NextResponse.json(
                { error: "Category, amount, and payment method are required" },
                { status: 400 }
            )
        }

        const expense = await prisma.expense.create({
            data: {
                businessId: params.id,
                branchId,
                category,
                amount: new Decimal(amount),
                description,
                paymentMethod,
                receiptUrl,
                expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
                createdById: session.user.id,
            },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        })

        return NextResponse.json(
            { expense, message: "Expense recorded successfully" },
            { status: 201 }
        )
    } catch (error) {
        console.error("[EXPENSES_POST]", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
