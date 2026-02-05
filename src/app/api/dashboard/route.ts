import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/dashboard - Dashboard summary statistics
export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const userId = session.user.id

        // Get user's organizations
        const organizations = await prisma.organization.findMany({
            where: {
                ownerId: userId,
            },
            include: {
                businesses: {
                    include: {
                        branches: {
                            include: {
                                transactions: {
                                    where: {
                                        createdAt: {
                                            gte: new Date(new Date().setHours(0, 0, 0, 0)), // Today
                                        },
                                    },
                                },
                                _count: {
                                    select: {
                                        transactions: true,
                                    },
                                },
                            },
                        },
                        customers: true,
                        _count: {
                            select: {
                                customers: true,
                            },
                        },
                    },
                },
            },
        })

        // Calculate totals
        let totalSalesToday = 0
        let totalTransactionsToday = 0
        let totalCustomers = 0
        let totalPendingPayments = 0

        organizations.forEach((org) => {
            org.businesses.forEach((business) => {
                totalCustomers += business._count.customers

                business.branches.forEach((branch) => {
                    totalTransactionsToday += branch._count.transactions

                    branch.transactions.forEach((transaction) => {
                        if (transaction.type === "CREDIT") {
                            totalSalesToday += Number(transaction.amount)
                        }
                    })
                })

                // Calculate pending payments
                business.customers.forEach((customer) => {
                    totalPendingPayments += Number(customer.currentBalance)
                })
            })
        })

        return NextResponse.json({
            totalSalesToday,
            totalTransactionsToday,
            totalCustomers,
            totalPendingPayments,
            organizationsCount: organizations.length,
        })
    } catch (error) {
        console.error("Dashboard API error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
