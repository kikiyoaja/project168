'use client'

import * as React from "react"
import { DollarSign, ReceiptText, ShoppingBag } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Sale } from "@/lib/types"
import { getDatabase } from "@/lib/local-db"

const getStatusVariant = (status: Sale['status']): 'default' | 'secondary' | 'destructive' => {
  switch (status) {
    case 'Completed':
      return 'default'
    case 'Pending':
      return 'secondary'
    case 'Cancelled':
      return 'destructive'
    default:
      return 'default'
  }
}

export default function SalesPage() {
  const [isClient, setIsClient] = React.useState(false)
  const [sales, setSales] = React.useState<Sale[]>([])

  React.useEffect(() => {
    setIsClient(true)
    const loadData = async () => {
        const db = await getDatabase();
        // Sort sales by most recent date first
        const sortedSales = db.sales.sort(
            (a: Sale, b: Sale) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setSales(sortedSales);
    }
    loadData();
  }, [])

  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0)
  const totalTransactions = sales.length
  const averageSale = totalTransactions > 0 ? totalSales / totalTransactions : 0

  const formatCurrency = (value: number) => value.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">Laporan Penjualan</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp{formatCurrency(totalSales)}</div>
            <p className="text-xs text-muted-foreground">+20.1% dari bulan lalu</p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jumlah Transaksi</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalTransactions.toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground">+180.1% dari bulan lalu</p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata Transaksi</CardTitle>
            <ReceiptText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp{formatCurrency(averageSale)}</div>
            <p className="text-xs text-muted-foreground">+19% dari bulan lalu</p>
          </CardContent>
        </Card>
      </div>
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Riwayat Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Kasir</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => (
                <TableRow key={sale.invoiceId}>
                  <TableCell className="font-medium">{sale.invoiceId}</TableCell>
                  <TableCell>{sale.customer}</TableCell>
                  <TableCell>{sale.cashier}</TableCell>
                  <TableCell>
                    {isClient ? new Date(sale.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '...'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(sale.status)}>{sale.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">Rp{formatCurrency(sale.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
