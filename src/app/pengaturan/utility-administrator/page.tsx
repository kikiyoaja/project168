'use client'

import * as React from "react"
import { AlertTriangle, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { getDatabase, saveDatabase } from "@/lib/local-db"
import { Alert, AlertDescription as AlertDescUi, AlertTitle as AlertTitleUi } from "@/components/ui/alert"

type DeletionKey = 
  | 'sales' 
  | 'salesReturns' 
  | 'suspendedTransactions' 
  | 'purchases' 
  | 'stockAdjustments'
  | 'products'
  | 'members'
  | 'suppliers'
  | 'productGroups'
  | 'resetStock';

const DELETION_OPTIONS: { id: DeletionKey; label: string; description: string }[] = [
    { id: 'sales', label: 'Transaksi Penjualan', description: 'Menghapus semua riwayat transaksi penjualan.' },
    { id: 'salesReturns', label: 'Transaksi Retur Penjualan', description: 'Menghapus semua riwayat retur penjualan.' },
    { id: 'suspendedTransactions', label: 'Transaksi Pending (Tunda)', description: 'Menghapus semua transaksi yang sedang ditunda.' },
    { id: 'purchases', label: 'Transaksi Pembelian', description: 'Menghapus semua riwayat transaksi pembelian.' },
    { id: 'stockAdjustments', label: 'Penyesuaian Stok', description: 'Menghapus semua riwayat penyesuaian stok (SO).' },
    { id: 'resetStock', label: 'Data Stok Barang (Reset ke 0)', description: 'Mengatur ulang jumlah stok semua barang menjadi 0, tetapi tidak menghapus data barang.' },
    { id: 'products', label: 'Master Data Barang', description: 'PERINGATAN: Menghapus SEMUA produk dari database.' },
    { id: 'members', label: 'Master Data Pelanggan', description: 'Menghapus SEMUA data pelanggan/member.' },
    { id: 'suppliers', label: 'Master Data Pemasok', description: 'Menghapus SEMUA data pemasok.' },
    { id: 'productGroups', label: 'Master Data Kelompok', description: 'Menghapus SEMUA data kelompok barang.' },
];

export default function UtilityAdministratorPage() {
    const { toast } = useToast()
    const [selectedItems, setSelectedItems] = React.useState<Set<DeletionKey>>(new Set())
    const [isProcessing, setIsProcessing] = React.useState(false)

    const handleSelectAll = (checked: boolean | 'indeterminate') => {
        if (checked === true) {
            const allIds = new Set(DELETION_OPTIONS.map(opt => opt.id))
            setSelectedItems(allIds)
        } else {
            setSelectedItems(new Set())
        }
    }

    const handleSelect = (itemId: DeletionKey, checked: boolean) => {
        setSelectedItems(prev => {
            const newSet = new Set(prev)
            if (checked) {
                newSet.add(itemId)
            } else {
                newSet.delete(itemId)
            }
            return newSet
        })
    }

    const handleProcessDeletion = async () => {
        setIsProcessing(true)
        try {
            const db = await getDatabase()
            const newDb = { ...db }

            selectedItems.forEach(key => {
                switch(key) {
                    case 'sales': newDb.sales = []; break;
                    case 'salesReturns': newDb.salesReturns = []; break;
                    case 'suspendedTransactions': newDb.suspendedTransactions = []; break;
                    case 'purchases': newDb.purchases = []; break;
                    case 'stockAdjustments': newDb.stockAdjustments = []; break;
                    case 'products': newDb.products = []; break;
                    case 'members': newDb.members = []; break;
                    case 'suppliers': newDb.suppliers = []; break;
                    case 'productGroups': newDb.productGroups = []; break;
                    case 'resetStock': 
                        newDb.products = newDb.products.map(p => ({ ...p, stock: 0 }));
                        break;
                }
            })

            await saveDatabase(newDb)
            
            toast({
                title: "Proses Selesai",
                description: "Data yang dipilih telah berhasil dihapus.",
            })

            setSelectedItems(new Set())
        } catch (error) {
            console.error("Deletion error:", error)
            toast({
                variant: "destructive",
                title: "Terjadi Kesalahan",
                description: "Gagal memproses penghapusan data. Lihat konsol untuk detail.",
            })
        } finally {
            setIsProcessing(false)
        }
    }
    
    const isAllSelected = selectedItems.size > 0 && selectedItems.size === DELETION_OPTIONS.length;
    const isIndeterminate = selectedItems.size > 0 && !isAllSelected;

    return (
        <div className="space-y-6">
            <h1 className="font-headline text-3xl font-bold tracking-tight">Utility Administrator</h1>
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle>Utilitas Data</CardTitle>
                    <CardDescription>
                        Lakukan tugas administratif tingkat lanjut seperti menghapus data transaksi massal atau membuat database baru.
                        Harap berhati-hati saat menggunakan fitur ini.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="hapus-data">
                        <TabsList>
                            <TabsTrigger value="buat-data-baru">Buat Data Baru</TabsTrigger>
                            <TabsTrigger value="backup-data">Backup Data</TabsTrigger>
                            <TabsTrigger value="restore-data">Restore Data</TabsTrigger>
                            <TabsTrigger value="hapus-data">Hapus Data</TabsTrigger>
                            <TabsTrigger value="inventori">Inventori</TabsTrigger>
                            <TabsTrigger value="import-data">Import Data</TabsTrigger>
                        </TabsList>
                        <TabsContent value="hapus-data" className="pt-4">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                               <div>
                                   <h3 className="text-lg font-semibold mb-2">Pilih Data untuk Dihapus</h3>
                                   <p className="text-sm text-muted-foreground mb-4">
                                       Pilih satu atau lebih jenis data di bawah ini yang ingin Anda hapus secara permanen.
                                       Tindakan ini tidak dapat diurungkan.
                                   </p>
                                    <div className="border rounded-md">
                                        <div className="p-4 border-b">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                  id="select-all"
                                                  checked={isAllSelected || isIndeterminate}
                                                  onCheckedChange={(checked) => handleSelectAll(checked)}
                                                />
                                                <Label htmlFor="select-all" className="text-base font-semibold">Pilih Semua</Label>
                                            </div>
                                        </div>
                                        <ScrollArea className="h-72">
                                            <div className="p-4 space-y-4">
                                                {DELETION_OPTIONS.map(option => (
                                                    <div key={option.id} className="flex items-start space-x-3">
                                                        <Checkbox
                                                            id={option.id}
                                                            checked={selectedItems.has(option.id)}
                                                            onCheckedChange={(checked) => handleSelect(option.id, !!checked)}
                                                            className="mt-1"
                                                        />
                                                        <div className="grid gap-1.5 leading-none">
                                                          <label
                                                            htmlFor={option.id}
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                          >
                                                            {option.label}
                                                          </label>
                                                          <p className="text-xs text-muted-foreground">
                                                            {option.description}
                                                          </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </div>
                               </div>
                               <div>
                                    <h3 className="text-lg font-semibold mb-2">Konfirmasi & Proses</h3>
                                    <Alert variant="destructive">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertTitleUi>Peringatan Keras!</AlertTitleUi>
                                        <AlertDescUi>
                                            Menghapus data adalah tindakan permanen dan tidak dapat dibatalkan.
                                            Pastikan Anda telah melakukan backup data sebelum melanjutkan.
                                        </AlertDescUi>
                                    </Alert>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button className="w-full mt-4" size="lg" disabled={selectedItems.size === 0 || isProcessing}>
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                {isProcessing ? 'Memproses...' : `Proses Penghapusan (${selectedItems.size})`}
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Apakah Anda Benar-Benar Yakin?</AlertDialogTitle>
                                                <AlertDialogDescription asChild>
                                                    <div>
                                                        Anda akan menghapus data berikut secara permanen:
                                                        <ul className="list-disc list-inside mt-2 text-sm text-foreground">
                                                            {Array.from(selectedItems).map(key => (
                                                                <li key={key}>{DELETION_OPTIONS.find(opt => opt.id === key)?.label}</li>
                                                            ))}
                                                        </ul>
                                                        Tindakan ini tidak dapat diurungkan.
                                                    </div>
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                                <AlertDialogAction
                                                  onClick={handleProcessDeletion}
                                                  className="bg-destructive hover:bg-destructive/90"
                                                >
                                                  Ya, Hapus Data
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                               </div>
                           </div>
                        </TabsContent>
                        <TabsContent value="buat-data-baru" className="pt-4 text-center text-muted-foreground">
                            <p>Fitur untuk membuat database baru yang bersih akan tersedia di sini.</p>
                        </TabsContent>
                        <TabsContent value="backup-data" className="pt-4 text-center text-muted-foreground">
                            <p>Fitur untuk backup data akan tersedia di sini.</p>
                        </TabsContent>
                        <TabsContent value="restore-data" className="pt-4 text-center text-muted-foreground">
                            <p>Fitur untuk restore data dari backup akan tersedia di sini.</p>
                        </TabsContent>
                        <TabsContent value="inventori" className="pt-4 text-center text-muted-foreground">
                            <p>Fitur untuk utilitas inventori akan tersedia di sini.</p>
                        </TabsContent>
                        <TabsContent value="import-data" className="pt-4 text-center text-muted-foreground">
                            <p>Fitur untuk mengimpor data dari sumber eksternal akan tersedia di sini.</p>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}
