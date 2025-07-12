'use client'

import * as React from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table"
import type { SalesReturn } from "@/lib/types"
import { getDatabase } from "@/lib/local-db"

export default function LaporanReturPenjualanPage() {
  const [returns, setReturns] = React.useState<SalesReturn[]>([])
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    setIsClient(true)
    const loadData = async () => {
        const db = await getDatabase();
        const sortedReturns = db.salesReturns.sort(
            (a: SalesReturn, b: SalesReturn) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setReturns(sortedReturns);
    }
    loadData();
  }, [])
  
  const grandTotalReturns = returns.reduce((sum, current) => sum + current.totalReturnAmount, 0)
  const formatCurrency = (value: number) => `Rp${value.toLocaleString('id-ID')}`

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">Daftar Retur Penjualan</h1>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Riwayat Retur Penjualan</CardTitle>
          <CardDescription>Berikut adalah semua retur penjualan yang pernah dilakukan.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Retur</TableHead>
                <TableHead>No. Nota Asal</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Kasir</TableHead>
                <TableHead className="text-right">Total Retur</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {returns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                    Belum ada riwayat retur penjualan.
                  </TableCell>
                </TableRow>
              ) : (
                returns.map((retur) => (
                  <TableRow key={retur.id}>
                    <TableCell className="font-mono">{retur.id}</TableCell>
                    <TableCell className="font-mono">{retur.originalInvoiceId}</TableCell>
                    <TableCell>{isClient ? format(new Date(retur.date), "d MMMM yyyy", { locale: id }) : '...'}</TableCell>
                    <TableCell>{retur.user}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(retur.totalReturnAmount)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
             {returns.length > 0 && (
              <TableFooter>
                <TableRow className="font-bold bg-muted hover:bg-muted">
                    <TableCell colSpan={4}>Total Keseluruhan</TableCell>
                    <TableCell className="text-right">{formatCurrency(grandTotalReturns)}</TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
