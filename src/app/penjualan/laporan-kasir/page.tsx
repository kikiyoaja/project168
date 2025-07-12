'use client'

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table"
import type { Sale, User } from '@/lib/types'
import { getDatabase } from "@/lib/local-db"

type CashierReportData = {
  cashierName: string
  transactionCount: number
  totalSales: number
}

export default function LaporanKasirPage() {
  const [reportData, setReportData] = React.useState<CashierReportData[]>([])
  const [sales, setSales] = React.useState<Sale[]>([])
  const [users, setUsers] = React.useState<User[]>([])

  React.useEffect(() => {
    const loadData = async () => {
      const db = await getDatabase();
      setSales(db.sales);
      setUsers(db.users);
    }
    loadData();
  }, []);

  React.useEffect(() => {
    // Consider both Admins and Cashiers as potential cashiers
    const cashiers = users.filter(user => user.role === 'Kasir' || user.role === 'Admin');
    
    const data = cashiers.map(cashier => {
      const salesByCashier = sales.filter(sale => sale.cashier === cashier.fullName);
      const totalSales = salesByCashier.reduce((sum, sale) => sum + sale.total, 0);
      
      return {
        cashierName: cashier.fullName,
        transactionCount: salesByCashier.length,
        totalSales: totalSales,
      };
    }).filter(d => d.transactionCount > 0); // Only show cashiers with actual sales

    setReportData(data);
  }, [sales, users]);

  const grandTotalSales = reportData.reduce((sum, data) => sum + data.totalSales, 0);
  const grandTotalTransactions = reportData.reduce((sum, data) => sum + data.transactionCount, 0);
  const formatCurrency = (value: number) => value.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 });


  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">Laporan Penjualan per Kasir</h1>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Ringkasan Penjualan per Kasir</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Kasir</TableHead>
                <TableHead className="text-center">Jumlah Transaksi</TableHead>
                <TableHead className="text-right">Total Penjualan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.length > 0 ? (
                reportData.map((data) => (
                  <TableRow key={data.cashierName}>
                    <TableCell className="font-medium">{data.cashierName}</TableCell>
                    <TableCell className="text-center">{data.transactionCount}</TableCell>
                    <TableCell className="text-right">Rp{formatCurrency(data.totalSales)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-10">
                    Tidak ada data penjualan untuk ditampilkan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            {reportData.length > 0 && (
              <TableFooter>
                <TableRow className="font-bold bg-muted hover:bg-muted">
                    <TableCell>Total Keseluruhan</TableCell>
                    <TableCell className="text-center">{grandTotalTransactions}</TableCell>
                    <TableCell className="text-right">Rp{formatCurrency(grandTotalSales)}</TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
