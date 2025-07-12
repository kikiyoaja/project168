'use client'

import * as React from "react"
import { Search, RotateCcw, Save } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import type { Sale, SalesReturn, SaleItem, Product } from "@/lib/types"
import { getDatabase, saveDatabase } from "@/lib/local-db"

type ReturnableSaleItem = SaleItem & {
  returnQty: number
}

export default function ReturPenjualanPage() {
  const { toast } = useToast()
  
  const [invoiceIdSearch, setInvoiceIdSearch] = React.useState("")
  const [foundSale, setFoundSale] = React.useState<Sale | null>(null)
  const [returnItems, setReturnItems] = React.useState<ReturnableSaleItem[]>([])
  const [notes, setNotes] = React.useState("")
  const [allSales, setAllSales] = React.useState<Sale[]>([]);

  React.useEffect(() => {
    const loadData = async () => {
      const db = await getDatabase();
      setAllSales(db.sales);
    }
    loadData();
  }, [])


  const handleSearchInvoice = () => {
    if (!invoiceIdSearch.trim()) {
      toast({ variant: "destructive", title: "Nomor nota tidak boleh kosong." })
      return
    }
    const sale = allSales.find(s => s.invoiceId.toLowerCase() === invoiceIdSearch.trim().toLowerCase())
    if (sale) {
      setFoundSale(sale)
      setReturnItems(sale.items.map(item => ({ ...item, returnQty: 0 })))
      toast({ title: "Nota Ditemukan", description: `Menampilkan detail untuk nota ${sale.invoiceId}.` })
    } else {
      toast({ variant: "destructive", title: "Nota Tidak Ditemukan", description: `Nota dengan nomor ${invoiceIdSearch} tidak ada.` })
      setFoundSale(null)
      setReturnItems([])
    }
  }

  const handleReturnQtyChange = (productId: string, qty: string) => {
    const returnQty = parseInt(qty, 10) || 0
    setReturnItems(prev => 
      prev.map(item => {
        if (item.productId === productId) {
          if (returnQty < 0) return { ...item, returnQty: 0 }
          if (returnQty > item.quantity) return { ...item, returnQty: item.quantity }
          return { ...item, returnQty }
        }
        return item
      })
    )
  }
  
  const handleSaveReturn = async () => {
    if (!foundSale) return
    
    const itemsToReturn = returnItems.filter(item => item.returnQty > 0)
    
    if (itemsToReturn.length === 0) {
      toast({ variant: "destructive", title: "Tidak ada barang yang diretur", description: "Masukkan jumlah pada barang yang ingin diretur." })
      return
    }

    const totalReturnAmount = itemsToReturn.reduce((sum, item) => sum + (item.price * item.returnQty), 0);
    
    const now = new Date();
    const newReturn: SalesReturn = {
      id: `RTN-${format(now, 'yyyyMMdd')}-${now.getTime().toString().slice(-4)}`,
      date: now.toISOString(),
      originalInvoiceId: foundSale.invoiceId,
      user: 'Admin', // In a real app, this would be the logged-in user
      items: itemsToReturn.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.returnQty,
          price: item.price,
          total: item.returnQty * item.price
      })),
      totalReturnAmount,
      notes: notes,
    }

    const db = await getDatabase();
    
    // Save return transaction
    const updatedReturns = [...db.salesReturns, newReturn];

    // Update product stock
    let updatedProducts = [...db.products];
    itemsToReturn.forEach(returnedItem => {
        updatedProducts = updatedProducts.map(p => {
            if (p.id === returnedItem.productId) {
                const stockToAdd = returnedItem.returnQty * returnedItem.unitQuantity;
                return { ...p, stock: p.stock + stockToAdd };
            }
            return p;
        });
    });

    await saveDatabase({ ...db, salesReturns: updatedReturns, products: updatedProducts });

    toast({ title: "Retur Berhasil Disimpan", description: `Stok telah dikembalikan untuk ${itemsToReturn.length} barang.` })
    handleReset()
  }

  const handleReset = () => {
    setInvoiceIdSearch("")
    setFoundSale(null)
    setReturnItems([])
    setNotes("")
  }

  const totalReturnAmount = React.useMemo(() => {
    return returnItems.reduce((sum, item) => {
      const itemTotal = (item.price * item.returnQty)
      return sum + itemTotal
    }, 0)
  }, [returnItems])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Retur Penjualan</h1>
        <Button onClick={handleReset} variant="outline" disabled={!foundSale}>
          <RotateCcw className="mr-2 h-4 w-4" /> Batal / Retur Baru
        </Button>
      </div>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Cari Nota Penjualan</CardTitle>
          <CardDescription>Masukkan nomor nota penjualan yang akan diretur.</CardDescription>
          <div className="flex w-full max-w-sm items-center space-x-2 pt-4">
            <Input 
              type="text" 
              placeholder="Contoh: INV-20240721-001" 
              value={invoiceIdSearch}
              onChange={(e) => setInvoiceIdSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchInvoice()}
            />
            <Button onClick={handleSearchInvoice}><Search className="mr-2 h-4 w-4"/> Cari</Button>
          </div>
        </CardHeader>
        {foundSale && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-md border p-4">
              <div><span className="font-medium text-muted-foreground">No. Nota:</span> {foundSale.invoiceId}</div>
              <div><span className="font-medium text-muted-foreground">Tanggal:</span> {format(new Date(foundSale.date), 'dd MMMM yyyy', { locale: id })}</div>
              <div><span className="font-medium text-muted-foreground">Pelanggan:</span> {foundSale.customer}</div>
            </div>
            
            <h3 className="text-lg font-semibold">Barang yang Dibeli</h3>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Barang</TableHead>
                    <TableHead className="text-center">Jml Beli</TableHead>
                    <TableHead className="text-right">Harga Satuan</TableHead>
                    <TableHead className="w-[120px] text-right">Qty Retur</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {returnItems.map(item => (
                    <TableRow key={item.productId}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">Rp{item.price.toLocaleString('id-ID')}</TableCell>
                      <TableCell className="text-right">
                        <Input 
                          type="number"
                          value={item.returnQty}
                          onChange={(e) => handleReturnQtyChange(item.productId, e.target.value)}
                          className="h-8 text-right"
                          max={item.quantity}
                          min={0}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
               <div>
                  <Label htmlFor="notes">Alasan Retur / Catatan</Label>
                  <Textarea 
                    id="notes" 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Barang rusak, salah ukuran, dll."
                    className="mt-2"
                  />
               </div>
               <div className="bg-muted p-4 rounded-md flex justify-between items-center">
                  <span className="text-lg font-bold">Total Retur:</span>
                  <span className="text-2xl font-bold font-mono">Rp{totalReturnAmount.toLocaleString('id-ID')}</span>
               </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSaveReturn} size="lg" disabled={totalReturnAmount === 0}>
                <Save className="mr-2 h-4 w-4" /> Simpan Transaksi Retur
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
