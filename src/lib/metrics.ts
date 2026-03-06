import prisma from "@/lib/prisma"

export async function getDashboardMetrics(userId: string) {
    // Get user's organizations and aggregate data
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
        })
    })

    // Get pending payments (unpaid CREDIT transactions)
    const pendingPaymentsResult = await prisma.transaction.aggregate({
        where: {
            status: "PENDING",
            type: "CREDIT",
            branch: {
                business: {
                    organization: {
                        ownerId: userId
                    }
                }
            }
        },
        _sum: {
            amount: true
        }
    })

    const totalPendingPayments = Number(pendingPaymentsResult._sum.amount) || 0

    return {
        totalSalesToday,
        totalTransactionsToday,
        totalCustomers,
        totalPendingPayments,
        organizationsCount: organizations.length,
    }
}

export async function getReportMetrics(userId: string) {
    // Fetch all organizations owned by the user
    const organizations = await prisma.organization.findMany({
        where: { ownerId: userId },
        include: {
            businesses: {
                include: {
                    expenses: true,
                    branches: {
                        include: {
                            transactions: true,
                        }
                    }
                }
            }
        }
    })

    let totalRevenue = 0
    let totalExpenses = 0
    let outstandingPayments = 0

    organizations.forEach(org => {
        org.businesses.forEach(biz => {
            // Calculate Expenses from Business level
            biz.expenses.forEach(exp => {
                totalExpenses += Number(exp.amount)
            })

            biz.branches.forEach(branch => {
                // Calculate Revenue (Credit transactions) & Outstanding
                branch.transactions.forEach(tx => {
                    if (tx.type === 'CREDIT') {
                        totalRevenue += Number(tx.amount)
                        if (tx.status === 'PENDING') {
                            outstandingPayments += Number(tx.amount)
                        }
                    }
                })
            })
        })
    })

    const netProfit = totalRevenue - totalExpenses

    return {
        totalRevenue,
        totalExpenses,
        netProfit,
        outstandingPayments
    }
}
