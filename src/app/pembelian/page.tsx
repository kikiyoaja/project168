
'use client'

import * as React from "react"
import { useSearchParams, useRouter } from 'next/navigation'
import { CalendarIcon, PlusCircle, Search, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { id as idLocale } from 'date-fns/locale'

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { Purchase, PurchaseItem, Supplier, Product, Database } from "@/lib/types"
import { getDatabase, saveDatabase } from "@/lib/local-db"
import { useToast } from "@/hooks/use-toast"
import ProductSearchModal from "@/components/cashier/product-search-modal"

type ItemRow = {
  id: string
  productId: string
  productName: string
  quantity: number
  unit: string
  purchasePrice: number
  hpp: number
  margin: number
  sellingPrice: number
  discount: number
  total: number
}

const createEmptyRow = (): ItemRow => ({
  id: `row-${Date.now()}`,
  productId: '',
  productName: '',
  quantity: 1,
  unit: 'PCS',
  purchasePrice: 0,
  hpp: 0,
  margin: 0,
  sellingPrice: 0,
  discount: 0,
  total: 0
});

export default function PenerimaanBarangPage() {
    const { toast } = useToast()
    const router = useRouter()
    const searchParams = useSearchParams()
    const editId = searchParams.get('id')

    const [allProducts, setAllProducts] = React.useState<Product[]>([])
    const [suppliers, setSuppliers] = React.useState<Supplier[]>([])
    const [db, setDb] = React.useState<Database | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)

    // Form state
    const [poNumber, setPoNumber] = React.useState(`PB-${format(new Date(), 'yyyyMMdd')}-${Math.floor(100 + Math.random() * 900)}`)
    const [transactionDate, setTransactionDate] = React.useState<Date | undefined>(new Date())
    const [paymentMethod, setPaymentMethod] = React.useState("kredit")
    const [supplierId, setSupplierId] = React.useState("")
    const [notes, setNotes] = React.useState("")
    const [ppn, setPpn] = React.useState("non-ppn")
    const [items, setItems] = React.useState<ItemRow[]>([createEmptyRow()])
    const [isSearchOpen, setIsSearchOpen] = React.useState(false)
    const [searchTargetRowId, setSearchTargetRowId] = React.useState<string | null>(null)

    React.useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true)
            const database = await getDatabase()
            setDb(database)
            setAllProducts(database.products)
            setSuppliers(database.suppliers)

            if (database.suppliers.length > 0) {
                setSupplierId(database.suppliers[0].id)
            }

            if (editId) {
                const purchaseToEdit = database.purchases.find(p => p.poNumber === editId)
                if (purchaseToEdit) {
                    setPoNumber(purchaseToEdit.poNumber)
                    setTransactionDate(new Date(purchaseToEdit.date))
                    setPaymentMethod(purchaseToEdit.paymentMethod || 'kredit')
                    setSupplierId(purchaseToEdit.supplierId || '')
                    setNotes(purchaseToEdit.notes || '')
                    setPpn(purchaseToEdit.ppn || 'non-ppn')
                    setItems(purchaseToEdit.items.map((item, index) => ({
                        id: `row-${index}`,
                        productId: item.productId,
                        productName: item.productName,
                        quantity: item.quantity,
                        unit: item.unit,
                        purchasePrice: item.purchasePrice,
                        discount: item.discount,
                        hpp: item.hpp,
                        margin: item.margin,
                        sellingPrice: item.sellingPrice,
                        total: item.total
                    })))
                } else {
                    toast({ variant: 'destructive', title: 'Error', description: `Transaksi pembelian dengan ID ${editId} tidak ditemukan.` })
                    router.push('/pembelian/daftar')
                }
            }
            setIsLoading(false)
        }
        loadInitialData()
    }, [editId, router, toast])

    const handleItemChange = (id: string, field: keyof Omit<ItemRow, 'id' | 'total' | 'hpp'>, value: any) => {
        setItems(currentItems =>
            currentItems.map(item => {
                if (item.id !== id) return item

                const updatedItem = { ...item, [field]: value }

                const purchasePrice = parseFloat(String(updatedItem.purchasePrice)) || 0
                const discount = parseFloat(String(updatedItem.discount)) || 0
                const qty = parseFloat(String(updatedItem.quantity)) || 0
                
                const hpp = purchasePrice * (1 - discount / 100)
                updatedItem.hpp = hpp

                if (field === 'margin') {
                    const margin = parseFloat(String(value)) || 0
                    updatedItem.sellingPrice = Math.round(hpp * (1 + margin / 100))
                } else if (field === 'sellingPrice') {
                    const sellingPrice = parseFloat(String(value)) || 0
                    updatedItem.margin = hpp > 0 ? ((sellingPrice / hpp) - 1) * 100 : 0
                } else {
                    const margin = parseFloat(String(updatedItem.margin)) || 0
                    updatedItem.sellingPrice = Math.round(hpp * (1 + margin / 100))
                }
                
                updatedItem.total = hpp * qty

                return updatedItem
            })
        )
    }

    const handleProductSelect = (product: Product) => {
      if (!searchTargetRowId) return;
      
      setItems(currentItems =>
        currentItems.map(item => {
          if (item.id !== searchTargetRowId) return item;
          
          const newItem = {
            ...item,
            productId: product.id,
            productName: product.name,
            purchasePrice: product.cost || 0,
            sellingPrice: product.price,
            unit: product.units.find(u => u.quantity === 1)?.name || 'PCS',
          };

          const purchasePrice = newItem.purchasePrice;
          const sellingPrice = newItem.sellingPrice;
          const hpp = purchasePrice * (1 - item.discount / 100);
          newItem.hpp = hpp;
          newItem.margin = hpp > 0 ? ((sellingPrice / hpp) - 1) * 100 : 0;
          newItem.total = hpp * item.quantity;
          
          return newItem;
        })
      );
      setIsSearchOpen(false);
      setSearchTargetRowId(null);
    };

    const handleAddItem = () => setItems([...items, createEmptyRow()])
    const handleRemoveItem = (id: string) => setItems(items.filter(item => item.id !== id && items.length > 1))

    const handleSave = async () => {
        if (!db) return;

        const purchaseItems: PurchaseItem[] = items.filter(i => i.productId && i.productName).map(item => ({
            productId: item.productId,
            productName: item.productName,
            quantity: Number(item.quantity),
            unit: item.unit,
            purchasePrice: Number(item.purchasePrice),
            discount: Number(item.discount),
            hpp: item.hpp,
            margin: item.margin,
            sellingPrice: Number(item.sellingPrice),
            total: item.total
        }))

        if (purchaseItems.length === 0) {
            toast({ variant: "destructive", title: "Item Kosong", description: "Harap tambahkan setidaknya satu barang." })
            return
        }
        
        const grandTotal = purchaseItems.reduce((sum, item) => sum + item.total, 0)
        
        const newPurchase: Purchase = {
            poNumber: poNumber,
            date: (transactionDate || new Date()).toISOString(),
            supplierId: supplierId,
            paymentMethod: paymentMethod,
            status: paymentMethod === 'kredit' ? 'Pending' : 'Received',
            total: grandTotal,
            ppn: ppn,
            notes: notes,
            items: purchaseItems
        }

        let updatedPurchases
        let updatedProducts = [...db.products]
        
        if (editId) {
            updatedPurchases = db.purchases.map(p => p.poNumber === editId ? newPurchase : p)
        } else {
            if (db.purchases.some(p => p.poNumber === poNumber)) {
                toast({ variant: "destructive", title: "ID Duplikat", description: "Nomor Transaksi/PO sudah ada. Silakan gunakan nomor lain."})
                return
            }
            updatedPurchases = [...db.purchases, newPurchase]
        }
        
        // Update stock and cost for products
        purchaseItems.forEach(item => {
            const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
            if (productIndex > -1) {
                updatedProducts[productIndex] = {
                    ...updatedProducts[productIndex],
                    stock: (updatedProducts[productIndex].stock || 0) + item.quantity,
                    cost: item.hpp, // Update cost to latest HPP
                    price: item.sellingPrice, // Update selling price
                };
            }
        });

        await saveDatabase({ ...db, purchases: updatedPurchases, products: updatedProducts })
        toast({ title: "Sukses!", description: `Transaksi pembelian ${poNumber} telah ${editId ? 'diperbarui' : 'disimpan'}.` })
        router.push('/pembelian/daftar')
    }
    
    const grandTotal = items.reduce((sum, item) => sum + item.total, 0)
    const formatCurrency = (value: number) => value.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    if (isLoading) {
        return <div>Memuat data...</div>
    }

    return (
        <>
            <div className="flex flex-col h-[calc(100vh-12.5rem)] space-y-4">
                <h1 className="font-headline text-3xl font-bold tracking-tight">{editId ? `Edit Penerimaan Barang` : 'Penerimaan Barang'}</h1>
                <Card className="shadow-md flex-1 overflow-hidden flex flex-col">
                    <CardHeader className="pb-4 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-3">
                            <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                                <Label htmlFor="no-transaksi">No. Transaksi</Label>
                                <Input id="no-transaksi" value={poNumber} onChange={e => setPoNumber(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                                <Label htmlFor="tanggal">Tanggal</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant={"outline"} className={cn("justify-start text-left font-normal", !transactionDate && "text-muted-foreground")}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {transactionDate ? format(transactionDate, "dd MMMM yyyy", { locale: idLocale }) : <span>Pilih tanggal</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={transactionDate} onSelect={setTransactionDate} initialFocus /></PopoverContent>
                                </Popover>
                            </div>
                            <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                                <Label htmlFor="cara-bayar">Cara Bayar</Label>
                                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="tunai">Tunai</SelectItem>
                                        <SelectItem value="kredit">Kredit</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                                <Label htmlFor="pemasok">Pemasok</Label>
                                <Select value={supplierId} onValueChange={setSupplierId}>
                                    <SelectTrigger><SelectValue placeholder="Pilih Pemasok" /></SelectTrigger>
                                    <SelectContent>
                                        {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                                <Label htmlFor="ppn">PPN</Label>
                                <Select value={ppn} onValueChange={setPpn}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="non-ppn">Non PPN</SelectItem>
                                        <SelectItem value="ppn">PPN</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-[100px_1fr] items-start gap-2">
                                <Label htmlFor="keterangan" className="pt-2">Keterangan</Label>
                                <Textarea id="keterangan" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Catatan untuk transaksi ini..." rows={1}/>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-0">
                        <Table>
                            <TableHeader className="bg-primary text-primary-foreground sticky top-0 z-10">
                                <TableRow>
                                    <TableHead className="w-[50px] text-primary-foreground">No</TableHead>
                                    <TableHead className="text-primary-foreground">PLU</TableHead>
                                    <TableHead className="text-primary-foreground">Nama Barang</TableHead>
                                    <TableHead className="w-[100px] text-primary-foreground">Qty</TableHead>
                                    <TableHead className="text-primary-foreground">Satuan</TableHead>
                                    <TableHead className="text-right text-primary-foreground">Hrg Beli</TableHead>
                                    <TableHead className="text-right text-primary-foreground">Diskon(%)</TableHead>
                                    <TableHead className="text-right text-primary-foreground">HPP</TableHead>
                                    <TableHead className="text-right text-primary-foreground">Margin(%)</TableHead>
                                    <TableHead className="text-right text-primary-foreground">Hrg Jual</TableHead>
                                    <TableHead className="text-right text-primary-foreground">Total</TableHead>
                                    <TableHead className="w-[50px] text-center text-primary-foreground">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((item, index) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="text-center">{index + 1}</TableCell>
                                        <TableCell>
                                          <div className="flex items-center gap-1">
                                            <Input className="h-8" value={item.productId} onChange={(e) => handleItemChange(item.id, 'productId', e.target.value)} />
                                            <Button variant="outline" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => { setSearchTargetRowId(item.id); setIsSearchOpen(true); }}><Search className="h-4 w-4" /></Button>
                                          </div>
                                        </TableCell>
                                        <TableCell><Input className="h-8 bg-muted" readOnly value={item.productName} /></TableCell>
                                        <TableCell><Input type="number" step="any" className="h-8 text-right" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)} /></TableCell>
                                        <TableCell><Input className="h-8" value={item.unit} onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)} /></TableCell>
                                        <TableCell><Input type="number" step="any" className="h-8 text-right" value={item.purchasePrice} onChange={(e) => handleItemChange(item.id, 'purchasePrice', e.target.value)} /></TableCell>
                                        <TableCell><Input type="number" step="any" className="h-8 text-right" value={item.discount} onChange={(e) => handleItemChange(item.id, 'discount', e.target.value)} /></TableCell>
                                        <TableCell><Input type="text" className="h-8 text-right bg-muted" readOnly value={formatCurrency(item.hpp)} /></TableCell>
                                        <TableCell><Input type="number" step="any" className="h-8 text-right" value={item.margin.toFixed(2)} onChange={(e) => handleItemChange(item.id, 'margin', e.target.value)} /></TableCell>
                                        <TableCell><Input type="number" step="any" className="h-8 text-right" value={item.sellingPrice} onChange={(e) => handleItemChange(item.id, 'sellingPrice', e.target.value)} /></TableCell>
                                        <TableCell className="text-right font-medium">Rp{formatCurrency(item.total)}</TableCell>
                                        <TableCell className="text-center">
                                            <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleRemoveItem(item.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <div className="p-2 flex justify-start border-t">
                            <Button variant="ghost" onClick={handleAddItem}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Tambah Baris
                            </Button>
                        </div>
                    </CardContent>
                    <div className="bg-muted p-4 flex justify-end items-center gap-6 border-t">
                        <div className="text-right">
                            <p className="text-sm">GRAND TOTAL</p>
                            <p className="text-4xl font-bold text-slate-800">Rp {formatCurrency(grandTotal)}</p>
                        </div>
                    </div>
                </Card>

                <div className="bg-primary flex-shrink-0 p-1.5 rounded-md">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <Button variant="ghost" className="bg-gray-700 text-white hover:bg-gray-600 h-8 px-3 text-xs font-sans" onClick={handleSave}>[F2] Simpan</Button>
                        <Button variant="ghost" className="bg-gray-700 text-white hover:bg-gray-600 h-8 px-3 text-xs font-sans" onClick={() => router.back()}>[ESC] Tutup</Button>
                    </div>
                </div>
            </div>
             <ProductSearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                onSelectProduct={(product, unit) => handleProductSelect(product)}
                products={allProducts}
                suppliers={suppliers}
                productGroups={db?.productGroups || []}
            />
        </>
    )
}
