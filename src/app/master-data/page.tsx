
'use client'

import * as React from "react"
import Image from "next/image"
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CalendarIcon, MoreHorizontal, Pencil, PlusCircle, Trash2 } from "lucide-react"
import { format } from "date-fns"

import { Button } from "../../components/ui/button"
import { Calendar } from "../../components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Checkbox } from "../../components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../components/ui/alert-dialog"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { getDatabase, saveDatabase, getAppSettings } from "../../lib/local-db"
import { cn } from "../../lib/utils"
import { useToast } from "../../hooks/use-toast"
import type { Product, Supplier, ProductGroup, MultiUnit as CanonicalMultiUnit } from "../../lib/types"
import { Badge } from "../../components/ui/badge"
import ProductSearchModal from "../../components/cashier/product-search-modal"

type TieredPrice = {
  id: string
  minQty: number
  price: number
}

type MultiUnit = {
  id: string
  name: string
  quantity: number
  price: number
  barcode: string
}

export default function MasterDataPage() {
  const { toast } = useToast()
  const router = useRouter()
  
  // Component States
  const [settings, setSettings] = React.useState({ warnaKasir: 'biru' });
  const [products, setProducts] = React.useState<Product[]>([]);
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
  const [productGroups, setProductGroups] = React.useState<ProductGroup[]>([]);

  // Dialog and Modal States
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null)
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)
  const [searchMode, setSearchMode] = React.useState<'edit' | 'delete' | 'view'>('view')
  const [productToDelete, setProductToDelete] = React.useState<Product | null>(null)
  
  // Form States
  const [expendedDate, setExpendedDate] = React.useState<Date | undefined>(new Date("2025-07-07"))
  const [tglBeliTerakhir, setTglBeliTerakhir] = React.useState<Date | undefined>(new Date("2025-07-07"))
  const [divisi, setDivisi] = React.useState('01')
  const [kelompok, setKelompok] = React.useState('')
  const [pemasok, setPemasok] = React.useState('')
  const [plu, setPlu] = React.useState('')
  const [barcode, setBarcode] = React.useState('')
  const [namaBarang, setNamaBarang] = React.useState('')
  
  const [hargaJual, setHargaJual] = React.useState(0);
  const [hargaBeli, setHargaBeli] = React.useState(0);
  const [margin, setMargin] = React.useState(0);
  const [laba, setLaba] = React.useState(0);
  const [lastChangedField, setLastChangedField] = React.useState<'hargaJual' | 'margin' | 'laba' | null>(null);

  const [tieredPrices, setTieredPrices] = React.useState<TieredPrice[]>([
    { id: 'tier-1', minQty: 12, price: 0 },
    { id: 'tier-2', minQty: 50, price: 0 },
  ])

  const [multiUnits, setMultiUnits] = React.useState<MultiUnit[]>([
    { id: 'unit-1', name: 'LUSIN', quantity: 12, price: 0, barcode: '' },
    { id: 'unit-2', name: 'BOX', quantity: 24, price: 0, barcode: '' },
  ])
  
  React.useEffect(() => {
    const loadData = async () => {
      const savedSettings = await getAppSettings();
      if (savedSettings) {
        setSettings(prev => ({...prev, ...savedSettings}));
      }

      const db = await getDatabase();
      setProducts(db.products);
      setSuppliers(db.suppliers);
      setProductGroups(db.productGroups);

      if (db.suppliers.length > 0) setPemasok(db.suppliers[0].id);
      if (db.productGroups.length > 0) setKelompok(db.productGroups[0].id);
    }
    loadData();
  }, []);

  React.useEffect(() => {
    if (hargaBeli > 0) {
      if (lastChangedField === 'hargaJual') {
        const newLaba = hargaJual - hargaBeli;
        const newMargin = (newLaba / hargaBeli) * 100;
        setLaba(newLaba);
        setMargin(newMargin);
      } else if (lastChangedField === 'margin') {
        const newLaba = hargaBeli * (margin / 100);
        setLaba(newLaba);
        setHargaJual(hargaBeli + newLaba);
      } else if (lastChangedField === 'laba') {
        const newMargin = (laba / hargaBeli) * 100;
        setMargin(newMargin);
        setHargaJual(hargaBeli + laba);
      }
    } else {
        setLaba(hargaJual);
        setMargin(0);
    }
  }, [hargaBeli, hargaJual, margin, laba, lastChangedField]);
  
  const handleAddTier = () => setTieredPrices([...tieredPrices, { id: `tier-${Date.now()}`, minQty: 0, price: 0 }])
  const handleRemoveTier = (id: string) => setTieredPrices(tieredPrices.filter(tier => tier.id !== id))
  const handleTierChange = (id: string, field: 'minQty' | 'price', value: number) => setTieredPrices(tieredPrices.map(tier => tier.id === id ? { ...tier, [field]: value >= 0 ? value : 0 } : tier))
  const handleAddMultiUnit = () => setMultiUnits([...multiUnits, { id: `unit-${Date.now()}`, name: '', quantity: 0, price: 0, barcode: '' }])
  const handleRemoveMultiUnit = (id: string) => setMultiUnits(multiUnits.filter(unit => unit.id !== id))
  const handleMultiUnitChange = (id: string, field: keyof Omit<MultiUnit, 'id'>, value: string | number) => {
    setMultiUnits(multiUnits.map(unit => {
      if (unit.id === id) {
        const parsedValue = (field === 'quantity' || field === 'price') && typeof value === 'string' ? (field === 'price' ? parseFloat(value) || 0 : parseInt(value, 10) || 0) : value;
        return { ...unit, [field]: parsedValue };
      }
      return unit;
    }));
  }
  const handleCopyPluToBarcode = () => setBarcode(plu)
  
  const handleOpenDialog = (product: Product | null = null) => {
    setSelectedProduct(product)
    if (product) {
      const baseUnit = product.units?.find(u => u.quantity === 1);
      setPlu(product.id)
      setBarcode(baseUnit?.barcode || '')
      setNamaBarang(product.name)
      setKelompok(product.groupId)
      setPemasok(product.supplierId)
      
      const productPrice = product.price || 0;
      const productCost = product.cost || 0;
      const productLaba = productPrice - productCost;
      const productMargin = productCost > 0 ? (productLaba / productCost) * 100 : 0;
      
      setHargaJual(productPrice);
      setHargaBeli(productCost);
      setLaba(productLaba);
      setMargin(productMargin);

      const productMultiUnits = (product.units || [])
        .filter(u => u.quantity > 1)
        .map((u, i) => ({ ...u, id: `unit-${Date.now()}-${i}` }));
      setMultiUnits(productMultiUnits.length > 0 ? productMultiUnits : [
        { id: 'unit-1', name: 'LUSIN', quantity: 12, price: 0, barcode: '' },
        { id: 'unit-2', name: 'BOX', quantity: 24, price: 0, barcode: '' },
      ]);
    } else {
      setPlu('')
      setBarcode('');
      setNamaBarang('');
      setKelompok(productGroups[0]?.id || '001');
      setPemasok(suppliers[0]?.id || 'sup-001');
      setHargaJual(0);
      setHargaBeli(0);
      setLaba(0);
      setMargin(0);
      setMultiUnits([
        { id: 'unit-1', name: 'LUSIN', quantity: 12, price: 0, barcode: '' },
        { id: 'unit-2', name: 'BOX', quantity: 24, price: 0, barcode: '' },
      ]);
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = React.useCallback(() => {
    setIsDialogOpen(false)
    setSelectedProduct(null)
  }, [])

  const handleSaveProduct = React.useCallback(async () => {
    if (!namaBarang || !plu) {
        toast({ variant: 'destructive', title: 'Data tidak lengkap', description: 'PLU dan Nama Barang wajib diisi.' });
        return;
    }

    const finalBarcode = barcode.trim() === '' ? plu : barcode.trim();
    const baseUnit: CanonicalMultiUnit = { name: 'PCS', quantity: 1, price: hargaJual, barcode: finalBarcode }
    const productUnits: CanonicalMultiUnit[] = [ baseUnit, ...multiUnits.filter(u => u.name && u.quantity > 1 && u.price > 0).map(({ id, ...rest }) => rest) ];
    const productData: Omit<Product, 'id'> = { 
        name: namaBarang, 
        category: productGroups.find(g => g.id === kelompok)?.name || 'Umum', 
        price: hargaJual, 
        cost: hargaBeli,
        stock: selectedProduct?.stock || 0, 
        imageUrl: selectedProduct?.imageUrl || 'https://placehold.co/300x200.png', 
        aiHint: selectedProduct?.aiHint || 'product', 
        groupId: kelompok, 
        supplierId: pemasok, 
        units: productUnits 
    };

    const db = await getDatabase();
    let updatedProducts;

    if (selectedProduct) {
        if (plu !== selectedProduct.id && db.products.some(p => p.id === plu)) {
            toast({ variant: 'destructive', title: 'PLU Duplikat', description: 'PLU ini sudah digunakan. Harap gunakan PLU yang unik.' });
            return;
        }
        updatedProducts = db.products.map(p => p.id === selectedProduct.id ? { ...productData, id: plu } : p);
    } else {
        if (db.products.some(p => p.id === plu)) {
            toast({ variant: 'destructive', title: 'PLU Duplikat', description: 'PLU ini sudah digunakan. Harap gunakan PLU yang unik.' });
            return;
        }
        updatedProducts = [...db.products, { ...productData, id: plu }];
    }
    
    await saveDatabase({ ...db, products: updatedProducts });
    setProducts(updatedProducts);

    toast({ title: "Sukses!", description: `Data barang "${namaBarang}" telah berhasil disimpan.` })
    handleCloseDialog();
  }, [selectedProduct, namaBarang, plu, kelompok, pemasok, productGroups, suppliers, toast, hargaJual, hargaBeli, barcode, multiUnits, handleCloseDialog]);

  React.useEffect(() => {
    if (isDialogOpen && !selectedProduct) {
      const sequentialNumber = Math.floor(10000 + Math.random() * 90000).toString();
      const newPlu = `${divisi}${kelompok}${sequentialNumber}`;
      setPlu(newPlu);
    }
  }, [isDialogOpen, selectedProduct, divisi, kelompok]);
  
  // Shortcut Handlers
  const handleSearchClick = () => { setSearchMode('view'); setIsSearchOpen(true); };
  const handleEditClick = () => { setSearchMode('edit'); setIsSearchOpen(true); };
  const handleDeleteClick = () => { setSearchMode('delete'); setIsSearchOpen(true); };
  const handleUnsupportedFeature = (key: string) => { toast({ title: "Fitur Dalam Pengembangan", description: `Fungsi untuk tombol ${key} akan segera hadir.`}); };

  // Modal & Dialog Callbacks
  const handleProductSelect = (product: Product, unit: CanonicalMultiUnit) => {
    setIsSearchOpen(false);
    if (searchMode === 'edit') {
      handleOpenDialog(product);
    } else if (searchMode === 'delete') {
      setProductToDelete(product);
    }
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    
    const db = await getDatabase();
    const updatedProducts = db.products.filter(p => p.id !== productToDelete.id);
    await saveDatabase({ ...db, products: updatedProducts });

    setProducts(updatedProducts);
    toast({ title: "Produk Dihapus", description: `Produk "${productToDelete.name}" telah berhasil dihapus.` });
    setProductToDelete(null);
  };
  
  // Keyboard Shortcut Effect
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isAnyDialogOpen = isDialogOpen || isSearchOpen || !!productToDelete;
      if (isAnyDialogOpen) {
        if (event.key === 'Escape') {
          event.preventDefault();
          setIsDialogOpen(false);
          setIsSearchOpen(false);
          setProductToDelete(null);
        }
        return;
      }

      switch (event.key) {
        case 'F2': event.preventDefault(); handleOpenDialog(null); break;
        case 'F3': event.preventDefault(); handleEditClick(); break;
        case 'F4': event.preventDefault(); handleUnsupportedFeature(event.key); break;
        case 'F5': event.preventDefault(); window.location.reload(); break;
        case 'F6': event.preventDefault(); handleSearchClick(); break;
        case 'F7': event.preventDefault(); handleSearchClick(); break;
        case 'Escape': event.preventDefault(); router.push('/'); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDialogOpen, isSearchOpen, productToDelete, router]);
  
  React.useEffect(() => {
    const handleSaveShortcut = (event: KeyboardEvent) => {
        if (isDialogOpen && event.key === 'F12') {
            event.preventDefault();
            handleSaveProduct();
        }
    };
    window.addEventListener('keydown', handleSaveShortcut);
    return () => window.removeEventListener('keydown', handleSaveShortcut);
  }, [isDialogOpen, handleSaveProduct]);

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-12.5rem)] space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="font-headline text-3xl font-bold tracking-tight">Daftar Barang</h1>
        </div>
        
        <Card className="shadow-md flex-1 overflow-hidden flex flex-col">
          <CardHeader>
            <CardTitle>Daftar Produk</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center p-6 bg-muted/20">
            <div className="text-center text-muted-foreground">
              <p className="text-lg font-medium">Daftar barang tidak ditampilkan secara langsung.</p>
              <p className="mt-1">Silakan gunakan tombol fungsi di bawah untuk mengelola data barang.</p>
              <p className="text-sm mt-4 font-mono">[F2] Tambah / [F3] Edit / [F7] Cari Barang</p>
            </div>
          </CardContent>
        </Card>

        <div className="bg-primary flex-shrink-0 p-1.5 rounded-md mt-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Button onClick={() => handleOpenDialog(null)} variant="ghost" className="bg-gray-700 text-white hover:bg-gray-600 h-8 px-3 text-xs font-sans">[F2] Tambah</Button>
            <Button onClick={handleEditClick} variant="ghost" className="bg-gray-700 text-white hover:bg-gray-600 h-8 px-3 text-xs font-sans">[F3] Edit</Button>
            <Button onClick={() => handleUnsupportedFeature('F4')} variant="ghost" className="bg-gray-700 text-white hover:bg-gray-600 h-8 px-3 text-xs font-sans">[F4] Cetak</Button>
            <Button asChild variant="ghost" className="bg-gray-700 text-white hover:bg-gray-600 h-8 px-3 text-xs font-sans">
              <Link href="/master-data/katalog">Katalog</Link>
            </Button>
            <Button onClick={() => window.location.reload()} variant="ghost" className="bg-gray-700 text-white hover:bg-gray-600 h-8 px-3 text-xs font-sans">[F5] Refresh</Button>
            <Button onClick={handleSearchClick} variant="ghost" className="bg-gray-700 text-white hover:bg-gray-600 h-8 px-3 text-xs font-sans">[F6] Filter Kategori</Button>
            <Button onClick={handleSearchClick} variant="ghost" className="bg-gray-700 text-white hover:bg-gray-600 h-8 px-3 text-xs font-sans">[F7] Cari Barang</Button>
            <Button onClick={handleDeleteClick} variant="ghost" className="bg-gray-700 text-white hover:bg-gray-600 h-8 px-3 text-xs font-sans">Hapus</Button>
            <Button onClick={() => router.push('/')} variant="ghost" className="bg-gray-700 text-white hover:bg-gray-600 h-8 px-3 text-xs font-sans">[ESC] Tutup</Button>
          </div>
        </div>
      </div>

      <ProductSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={handleProductSelect}
        products={products}
        suppliers={suppliers}
        productGroups={productGroups}
      />

      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Konfirmasi Penghapusan</AlertDialogTitle>
                <AlertDialogDescription>
                    Apakah Anda yakin ingin menghapus produk "{productToDelete?.name}"? Tindakan ini tidak dapat diurungkan.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setProductToDelete(null)}>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDeleteProduct} className="bg-destructive hover:bg-destructive/90">Hapus</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader className={cn(
            "p-2 rounded-t-lg",
            {
              "bg-green-700 text-white": settings.warnaKasir === 'hijau',
              "bg-blue-700 text-white": settings.warnaKasir === 'biru',
              "bg-red-700 text-white": settings.warnaKasir === 'merah',
            },
            !['hijau', 'biru', 'merah'].includes(settings.warnaKasir) && 'bg-primary text-primary-foreground'
          )}>
            <DialogTitle className="text-xl">{selectedProduct ? "Edit Barang" : "MASTER DATA BARANG"}</DialogTitle>
            <DialogDescription className="text-white/90">Input Data Barang, BHP, Barang Gabungan, dan Jasa</DialogDescription>
          </DialogHeader>
          <div className="max-h-[80vh] overflow-y-auto p-1 pr-3">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 p-3">
              <div className="xl:col-span-2">
                <Card>
                  <CardHeader className="p-4"><CardTitle className="text-base">Informasi Umum</CardTitle></CardHeader>
                  <CardContent className="p-4 pt-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2">
                      <div className="flex items-center gap-2"><Checkbox id="cek-fisik" /><Label htmlFor="cek-fisik">Cek Fisik</Label></div>
                      <div className="flex items-center gap-2"><Checkbox id="aktif" defaultChecked /><Label htmlFor="aktif">Aktif</Label></div>
                      <div className="flex items-center gap-2"><Checkbox id="poin-member" /><Label htmlFor="poin-member">Poin Member</Label></div>
                      <div className="flex items-center gap-2"><Checkbox id="voucher" /><Label htmlFor="voucher">Voucher</Label></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5">
                      <div className="grid grid-cols-[110px_1fr] items-center gap-x-3">
                        <Label htmlFor="divisi">Divisi *</Label>
                        <Select value={divisi} onValueChange={setDivisi}><SelectTrigger className="h-8"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="01">01-TOKO</SelectItem><SelectItem value="02">02-GUDANG</SelectItem></SelectContent></Select>
                      </div>
                      <div className="grid grid-cols-[110px_1fr] items-center gap-x-3">
                        <Label htmlFor="kelompok">Kelompok *</Label>
                        <Select value={kelompok} onValueChange={setKelompok}>
                          <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {productGroups.map((group) => (
                              <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-[110px_1fr] items-center gap-x-3 md:col-span-2">
                        <Label htmlFor="plu">PLU</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            value={selectedProduct ? selectedProduct.id : "PLU Baru"}
                            readOnly
                            className="h-8 bg-muted"
                          />
                          <Input
                            id="plu"
                            value={plu}
                            onChange={(e) => setPlu(e.target.value)}
                            placeholder="PLU akan terisi otomatis"
                            className="h-8 bg-yellow-100 border-yellow-300"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-[110px_1fr] items-center gap-x-3 md:col-span-2">
                        <Label htmlFor="barcode">Barcode *</Label>
                        <div className="flex items-center gap-2">
                          <Input 
                            id="barcode" 
                            value={barcode} 
                            onChange={(e) => setBarcode(e.target.value)} 
                            className="h-8 bg-red-100 border-red-300"
                          />
                          <Button variant="outline" type="button" onClick={handleCopyPluToBarcode} className="text-xs px-2 whitespace-nowrap h-8">Sama dg PLU</Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-[110px_1fr] items-center gap-x-3 md:col-span-2">
                        <Label htmlFor="nama-barang">Nama Barang *</Label>
                        <Input 
                          id="nama-barang" 
                          value={namaBarang} 
                          onChange={(e) => setNamaBarang(e.target.value)} 
                          className="h-8 bg-green-100 border-green-300"
                        />
                      </div>
                      <div className="grid grid-cols-[110px_1fr] items-center gap-x-3">
                        <Label htmlFor="jenis">Jenis</Label>
                        <Select defaultValue="barang"><SelectTrigger className="h-8"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="barang">Barang</SelectItem></SelectContent></Select>
                      </div>
                      <div className="grid grid-cols-[110px_1fr] items-center gap-x-3"><Label htmlFor="rak">Rak</Label><Input id="rak" className="h-8"/></div>
                      <div className="grid grid-cols-[110px_1fr] items-center gap-x-3">
                        <Label htmlFor="satuan">Satuan *</Label>
                        <Select defaultValue="pcs"><SelectTrigger className="h-8"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pcs">PCS</SelectItem></SelectContent></Select>
                      </div>
                      <div className="grid grid-cols-[110px_1fr] items-center gap-x-3">
                        <Label htmlFor="pemasok">Pemasok</Label>
                        <Select value={pemasok} onValueChange={setPemasok}>
                          <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>
                             {suppliers.map((supplier) => (
                              <SelectItem key={supplier.id} value={supplier.id}>{supplier.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-[110px_1fr] items-center gap-x-3">
                        <Label htmlFor="thn-produksi">Thn. Produksi</Label>
                        <Select defaultValue="2025"><SelectTrigger className="h-8"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="2025">2025</SelectItem><SelectItem value="2024">2024</SelectItem><SelectItem value="2023">2023</SelectItem></SelectContent></Select>
                      </div>
                      <div className="grid grid-cols-[110px_1fr] items-center gap-x-3">
                        <Label></Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2"><Label htmlFor="poin">Poin</Label><Input id="poin" type="number" defaultValue="0" step="any" className="h-8"/></div>
                          <div className="flex items-center gap-2"><Label htmlFor="tukar-poin">Tukar Poin</Label><Input id="tukar-poin" type="number" defaultValue="0" step="any" className="h-8"/></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="xl:col-span-1 space-y-2">
                <Card className="flex flex-col items-center justify-center p-4 h-full">
                  <Image src="https://placehold.co/200x200.png" data-ai-hint="logo semar" alt="Logo Placeholder" width={200} height={200} className="rounded-md" />
                </Card>
                <div className="flex gap-2">
                  <Button variant="outline" className="w-full h-8">Buka Gambar</Button>
                  <Button variant="outline" className="w-full h-8">Cari Gambar</Button>
                </div>
              </div>
            </div>
            <Tabs defaultValue="stock" className="w-full p-3 pt-0">
              <TabsList>
                <TabsTrigger value="stock">[1] Informasi Stock</TabsTrigger>
                <TabsTrigger value="price">[2] Level Harga</TabsTrigger>
                <TabsTrigger value="unit">[3] Multi Satuan</TabsTrigger>
                <TabsTrigger value="tiered">[4] Harga Bertingkat</TabsTrigger>
              </TabsList>
              <TabsContent value="stock">
                <Card><CardContent className="p-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1.5">
                    <div className="space-y-1.5">
                      <div className="grid grid-cols-2 items-center"><Label htmlFor="stok-minimal">Stok Minimal</Label><Input className="text-right h-8" id="stok-minimal" type="number" defaultValue="0" step="any" /></div>
                      <div className="grid grid-cols-2 items-center"><Label htmlFor="stok-maksimal">Stok Maksimal</Label><Input className="text-right h-8" id="stok-maksimal" type="number" defaultValue="0" step="any" /></div>
                      <div className="grid grid-cols-2 items-center"><Label htmlFor="jml-reorder">Jml Reorder</Label><Input className="text-right h-8" id="jml-reorder" type="number" defaultValue="1" step="any" /></div>
                      <div className="grid grid-cols-2 items-center"><Label htmlFor="stok-awal">Stok Awal</Label><Input className="text-right h-8" id="stok-awal" type="number" defaultValue="0" step="any" /></div>
                      <div className="grid grid-cols-2 items-center"><Label htmlFor="stok-akhir">Stok Akhir</Label><Input className="text-right h-8" id="stok-akhir" type="number" defaultValue="0" step="any" /></div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="grid grid-cols-2 items-center"><Label htmlFor="hrg-beli">Hrg Beli</Label><Input className="text-right h-8" id="hrg-beli" type="number" value={hargaBeli} onChange={(e) => setHargaBeli(parseFloat(e.target.value) || 0)} step="any" /></div>
                      <div className="grid grid-cols-2 items-center"><Label htmlFor="margin">Margin (%)</Label><Input className="text-right h-8" id="margin" type="number" value={margin.toFixed(2)} onChange={(e) => {setMargin(parseFloat(e.target.value) || 0); setLastChangedField('margin');}} step="any" /></div>
                      <div className="grid grid-cols-2 items-center"><Label htmlFor="laba">Laba (Rp)</Label><Input className="text-right h-8" id="laba" type="number" value={laba} onChange={(e) => {setLaba(parseFloat(e.target.value) || 0); setLastChangedField('laba');}} step="any" /></div>
                      <div className="grid grid-cols-2 items-center"><Label htmlFor="harga-jual">Harga Jual</Label><Input className="text-right h-8" id="harga-jual" type="number" value={hargaJual} onChange={(e) => {setHargaJual(parseFloat(e.target.value) || 0); setLastChangedField('hargaJual');}} step="any" /></div>
                      <div className="grid grid-cols-2 items-center">
                        <div className="flex items-center gap-2"><Checkbox id="expended" /><Label htmlFor="expended">Expended</Label></div>
                        <Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("justify-start text-left font-normal h-8", !expendedDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{expendedDate ? format(expendedDate, "dd/MM/yyyy") : <span>Pilih tanggal</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={expendedDate} onSelect={setExpendedDate} initialFocus /></PopoverContent></Popover>
                      </div>
                      <div className="grid grid-cols-2 items-center">
                        <Label>Tgl Beli Terakhir</Label>
                        <Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("justify-start text-left font-normal h-8", !tglBeliTerakhir && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{tglBeliTerakhir ? format(tglBeliTerakhir, "dd/MM/yyyy") : <span>Pilih tanggal</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={tglBeliTerakhir} onSelect={setTglBeliTerakhir} initialFocus /></PopoverContent></Popover>
                      </div>
                      <div className="grid grid-cols-2 items-center"><Label htmlFor="hrg-beli-terakhir">Hrg Beli Terakhir</Label><Input className="text-right h-8" id="hrg-beli-terakhir" type="number" defaultValue="0" step="any" /></div>
                    </div>
                  </div>
                  <p className="text-xs text-destructive mt-4">* Stok Awal tidak boleh di edit</p><p className="text-xs text-muted-foreground mt-1">* Item yang tidak boleh kosong</p>
                </CardContent></Card>
              </TabsContent>
              <TabsContent value="price">
                <Card><CardHeader className="p-3 pb-2"><CardTitle className="text-base">Pengaturan Level Harga</CardTitle><CardDescription>Atur hingga 5 level harga jual yang berbeda. Harga Jual 1 (standar) diatur pada tab Informasi Stok.</CardDescription></CardHeader><CardContent className="p-3 space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    <div className="space-y-2">
                      <div className="p-2 border rounded-md space-y-1.5 bg-muted/20"><Label className="text-base font-semibold text-primary">Harga Jual 2</Label><div className="grid grid-cols-2 items-center"><Label htmlFor="hj2">Harga Jual</Label><Input className="text-right h-8" id="hj2" type="number" defaultValue="0" step="any" /></div><div className="grid grid-cols-2 items-center"><Label htmlFor="margin2">Margin (%)</Label><Input className="text-right h-8" id="margin2" type="number" defaultValue="0" step="any" /></div><div className="grid grid-cols-2 items-center"><Label htmlFor="laba2">Laba (Rp)</Label><Input className="text-right h-8" id="laba2" type="number" defaultValue="0" step="any" /></div></div>
                      <div className="p-2 border rounded-md space-y-1.5 bg-muted/20"><Label className="text-base font-semibold text-primary">Harga Jual 3</Label><div className="grid grid-cols-2 items-center"><Label htmlFor="hj3">Harga Jual</Label><Input className="text-right h-8" id="hj3" type="number" defaultValue="0" step="any" /></div><div className="grid grid-cols-2 items-center"><Label htmlFor="margin3">Margin (%)</Label><Input className="text-right h-8" id="margin3" type="number" defaultValue="0" step="any" /></div><div className="grid grid-cols-2 items-center"><Label htmlFor="laba3">Laba (Rp)</Label><Input className="text-right h-8" id="laba3" type="number" defaultValue="0" step="any" /></div></div>
                    </div>
                    <div className="space-y-2">
                      <div className="p-2 border rounded-md space-y-1.5 bg-muted/20"><Label className="text-base font-semibold text-primary">Harga Jual 4</Label><div className="grid grid-cols-2 items-center"><Label htmlFor="hj4">Harga Jual</Label><Input className="text-right h-8" id="hj4" type="number" defaultValue="0" step="any" /></div><div className="grid grid-cols-2 items-center"><Label htmlFor="margin4">Margin (%)</Label><Input className="text-right h-8" id="margin4" type="number" defaultValue="0" step="any" /></div><div className="grid grid-cols-2 items-center"><Label htmlFor="laba4">Laba (Rp)</Label><Input className="text-right h-8" id="laba4" type="number" defaultValue="0" step="any" /></div></div>
                      <div className="p-2 border rounded-md space-y-1.5 bg-muted/20"><Label className="text-base font-semibold text-primary">Harga Jual 5</Label><div className="grid grid-cols-2 items-center"><Label htmlFor="hj5">Harga Jual</Label><Input className="text-right h-8" id="hj5" type="number" defaultValue="0" step="any" /></div><div className="grid grid-cols-2 items-center"><Label htmlFor="margin5">Margin (%)</Label><Input className="text-right h-8" id="margin5" type="number" defaultValue="0" step="any" /></div><div className="grid grid-cols-2 items-center"><Label htmlFor="laba5">Laba (Rp)</Label><Input className="text-right h-8" id="laba5" type="number" defaultValue="0" step="any" /></div></div>
                    </div>
                  </div>
                </CardContent></Card>
              </TabsContent>
              <TabsContent value="unit">
                <Card><CardHeader className="p-3 pb-2"><CardTitle className="text-base">Pengaturan Multi Satuan</CardTitle><CardDescription>Atur berbagai satuan jual untuk barang ini, misalnya LUSIN, BOX, atau KARTON. Satuan dasar diambil dari tab Informasi Stok.</CardDescription></CardHeader><CardContent className="p-3 space-y-3">
                  <Table><TableHeader><TableRow><TableHead>Satuan</TableHead><TableHead className="w-[120px]">Isi</TableHead><TableHead className="text-right">Harga Jual</TableHead><TableHead>Barcode</TableHead><TableHead className="w-[50px] text-center">Aksi</TableHead></TableRow></TableHeader><TableBody>
                    {multiUnits.map((unit) => (<TableRow key={unit.id}><TableCell className="p-1"><Input value={unit.name} onChange={(e) => handleMultiUnitChange(unit.id, 'name', e.target.value)} className="h-8" /></TableCell><TableCell className="p-1"><Input type="number" value={unit.quantity} onChange={(e) => handleMultiUnitChange(unit.id, 'quantity', e.target.value)} className="h-8 text-right" min="1" /></TableCell><TableCell className="p-1"><Input type="number" step="any" value={unit.price} onChange={(e) => handleMultiUnitChange(unit.id, 'price', e.target.value)} className="h-8 text-right" min="0" /></TableCell><TableCell className="p-1"><Input value={unit.barcode} onChange={(e) => handleMultiUnitChange(unit.id, 'barcode', e.target.value)} className="h-8" /></TableCell><TableCell className="text-center p-1"><Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleRemoveMultiUnit(unit.id)}><Trash2 className="h-4 w-4" /></Button></TableCell></TableRow>))}
                  </TableBody></Table>
                  <div><Button variant="ghost" onClick={handleAddMultiUnit}><PlusCircle className="mr-2 h-4 w-4" /> Tambah Satuan</Button></div>
                </CardContent></Card>
              </TabsContent>
              <TabsContent value="tiered">
                <Card><CardHeader className="p-3 pb-2"><CardTitle className="text-base">Pengaturan Harga Bertingkat (Grosir)</CardTitle><CardDescription>Atur harga jual yang berbeda berdasarkan jumlah pembelian. Harga jual standar (Level 1) diambil dari tab Informasi Stok.</CardDescription></CardHeader><CardContent className="p-3 space-y-3">
                  <Table><TableHeader><TableRow><TableHead className="w-[80px]">Level</TableHead><TableHead>Min. Qty</TableHead><TableHead className="text-right">Harga Jual</TableHead><TableHead className="w-[50px] text-center">Aksi</TableHead></TableRow></TableHeader><TableBody>
                    {tieredPrices.map((tier, index) => (<TableRow key={tier.id}><TableCell className="font-medium align-middle p-1">Level {index + 2}</TableCell><TableCell className="p-1"><Input type="number" value={tier.minQty} onChange={(e) => handleTierChange(tier.id, 'minQty', parseInt(e.target.value, 10) || 0)} className="h-8 text-right" min="1" /></TableCell><TableCell className="p-1"><Input type="number" step="any" value={tier.price} onChange={(e) => handleTierChange(tier.id, 'price', parseFloat(e.target.value) || 0)} className="h-8 text-right" min="0" /></TableCell><TableCell className="text-center p-1"><Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleRemoveTier(tier.id)}><Trash2 className="h-4 w-4" /></Button></TableCell></TableRow>))}
                  </TableBody></Table>
                  <div><Button variant="ghost" onClick={handleAddTier}><PlusCircle className="mr-2 h-4 w-4" /> Tambah Level Harga</Button></div>
                </CardContent></Card>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter className="pt-4 p-4 border-t">
            <Button onClick={handleSaveProduct}>Simpan [F12]</Button>
            <Button variant="outline" onClick={handleCloseDialog}>Batal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

    
