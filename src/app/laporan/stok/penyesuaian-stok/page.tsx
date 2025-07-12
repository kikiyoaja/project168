'use client'

import * as React from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import type { StockAdjustment } from "@/lib/types"
import { cn } from "@/lib/utils"
import { getDatabase } from "@/lib/local-db"

export default function LaporanPenyesuaianStokPage() {
  const [adjustments, setAdjustments] = React.useState<StockAdjustment[]>([])
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    setIsClient(true)
    const loadData = async () => {
        const db = await getDatabase();
        // Sort by most recent date first
        const sortedAdjustments = db.stockAdjustments.sort(
            (a: StockAdjustment, b: StockAdjustment) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setAdjustments(sortedAdjustments);
    };
    loadData();
  }, [])

  if (!isClient) {
    return <div>Loading...</div>
  }
  
  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">Daftar Penyesuaian Stok</h1>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Riwayat Penyesuaian Stok</CardTitle>
          <CardDescription>Berikut adalah semua penyesuaian stok yang pernah dilakukan.</CardDescription>
        </CardHeader>
        <CardContent>
          {adjustments.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">
              <p>Belum ada riwayat penyesuaian stok.</p>
              <p className="text-sm">Anda dapat membuat penyesuaian baru di menu Pembelian &gt; Penyesuaian Stok.</p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {adjustments.map((adj) => (
                <AccordionItem value={adj.id} key={adj.id}>
                  <AccordionTrigger>
                    <div className="flex justify-between w-full pr-4">
                        <span>
                            <span className="font-mono">{adj.id}</span> - {format(new Date(adj.date), "d MMMM yyyy", { locale: id })}
                        </span>
                        <span className="text-sm text-muted-foreground">Oleh: {adj.user}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="px-4 pb-4">
                        {adj.notes && (
                            <p className="text-sm text-muted-foreground mb-4">
                                <strong>Catatan:</strong> {adj.notes}
                            </p>
                        )}
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nama Barang</TableHead>
                            <TableHead className="text-center">Stok Sistem</TableHead>
                            <TableHead className="text-center">Stok Fisik</TableHead>
                            <TableHead className="text-center">Selisih</TableHead>
                            <TableHead>Keterangan</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {adj.items.map((item) => (
                            <TableRow key={item.productId}>
                              <TableCell className="font-medium">{item.productName}</TableCell>
                              <TableCell className="text-center">{item.systemStock.toLocaleString('id-ID')}</TableCell>
                              <TableCell className="text-center">{item.physicalStock.toLocaleString('id-ID')}</TableCell>
                               <TableCell className={cn(
                                "text-center font-bold",
                                item.difference > 0 && "text-green-600",
                                item.difference < 0 && "text-red-600"
                              )}>
                                {item.difference > 0 ? `+${item.difference.toLocaleString('id-ID')}` : item.difference.toLocaleString('id-ID')}
                              </TableCell>
                              <TableCell>{item.notes || "-"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
