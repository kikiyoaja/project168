
'use client'

import * as React from "react"
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { MoreHorizontal, PlusCircle, Pencil, Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Supplier, ProductGroup } from "@/lib/types"
import { getAppSettings, saveAppSettings, getDatabase, saveDatabase } from "@/lib/local-db"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const initialSupplierState: Omit<Supplier, 'id'> = {
  name: '',
  contactPerson: '',
  address: '',
  phone: ''
};

export default function SettingsPage() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialTab = searchParams.get('tab') || 'perusahaan'
  
  const [activeTab, setActiveTab] = React.useState(initialTab);
  const [isLoading, setIsLoading] = React.useState(true);
  
  const [settings, setSettings] = React.useState({
    namaPerusahaan: 'HIJRAH CELL',
    bidangUsaha: 'Konter',
    alamat: 'Jl. Bambang Utoyo Kel. Pasar III',
    kota: 'Muara Enim',
    kodePos: '',
    provinsi: 'Sumatera Selatan',
    noTelp: '082144108244',
    fax: '',
    email: '',
    website: '',
    posisiCabang: 'pusat',
    background: 'C:\\Program Files (x86)\\Software Kasir\\_imag...',
    logo: 'C:\\Program Files (x86)\\Software Kasir\\_imag...',
    metode: 'average',
    warnaKasir: 'biru',
    aktifBkp: false,
    persenBkp: '100 %',
    backupReminder: true,
    lokalDbPath: 'D:\\_data\\DATA.FDB',
    serverHost: 'localhost',
    serverPort: '3050',
    serverDbPath: 'D:\\_data\\DATA.FDB',
    backupPath: 'D:\\_backup',
    showBackupProcess: true,
    productImagePath: 'C:\\Program Files (x86)\\Software Kasir\\_imaç...',
  })

  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
  const [productGroups, setProductGroups] = React.useState<ProductGroup[]>([]);
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = React.useState(false)
  const [currentSupplier, setCurrentSupplier] = React.useState<Supplier | null>(null)
  const [supplierData, setSupplierData] = React.useState(initialSupplierState)
  const [isGroupDialogOpen, setIsGroupDialogOpen] = React.useState(false)
  const [currentGroup, setCurrentGroup] = React.useState<ProductGroup | null>(null)
  const [groupName, setGroupName] = React.useState('')
  const [isElectronContext, setIsElectronContext] = React.useState(false)
  
  React.useEffect(() => {
    setIsElectronContext(typeof window !== 'undefined' && !!(window as any).require);
    const loadData = async () => {
      setIsLoading(true);
      const savedSettings = await getAppSettings();
      if (savedSettings) {
        setSettings(prev => ({ ...prev, ...savedSettings }));
      }
      
      const dbData = await getDatabase();
      setSuppliers(dbData.suppliers);
      setProductGroups(dbData.productGroups);

      setIsLoading(false);
    }
    loadData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setSettings(prev => ({ ...prev, [id]: value }))
  }

  const handleCheckboxChange = (id: keyof typeof settings) => (checked: boolean | 'indeterminate') => {
    setSettings(prev => ({ ...prev, [id]: !!checked }))
  }

  const handleSelectChange = (id: keyof typeof settings) => (value: string) => {
     setSettings(prev => ({ ...prev, [id]: value }))
  }

  const handleSave = async () => {
    await saveAppSettings(settings)
    toast({
      title: "Pengaturan Disimpan",
      description: "Perubahan telah berhasil disimpan.",
    })
  }
  
  const handleSelectPath = async (key: keyof typeof settings, type: 'directory' | 'file', options?: any) => {
      if (!isElectronContext) {
        toast({
          variant: "destructive",
          title: "Fitur Khusus Electron",
          description: "Pemilihan path hanya berfungsi saat aplikasi dijalankan via Electron.",
        });
        return;
      }
      try {
        const { ipcRenderer } = (window as any).require('electron');
        const channel = type === 'directory' ? 'select-directory' : 'select-file';
        const path = await ipcRenderer.invoke(channel, options);
        if (path) {
          setSettings(prev => ({ ...prev, [key]: path }));
        }
      } catch (error) {
        console.error("Error selecting path:", error);
        toast({
          variant: "destructive",
          title: "Gagal Memilih Path",
          description: "Terjadi kesalahan saat membuka dialog.",
        });
      }
    };

  const handleBatal = async () => {
    const savedSettings = await getAppSettings()
    if (savedSettings) {
      setSettings(prev => ({ ...prev, ...savedSettings }))
    }
    toast({
      variant: "default",
      title: "Perubahan Dibatalkan",
      description: "Pengaturan telah dikembalikan ke kondisi terakhir disimpan.",
    })
  }

  // Supplier handlers
  const handleSupplierInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setSupplierData(prev => ({ ...prev, [id]: value }));
  }

  const handleOpenSupplierDialog = (supplier: Supplier | null = null) => {
    setCurrentSupplier(supplier)
    if (supplier) {
      setSupplierData({ name: supplier.name, contactPerson: supplier.contactPerson, address: supplier.address, phone: supplier.phone })
    } else {
      setSupplierData(initialSupplierState);
    }
    setIsSupplierDialogOpen(true)
  }

  const handleCloseSupplierDialog = () => {
    setIsSupplierDialogOpen(false)
    setCurrentSupplier(null)
    setSupplierData(initialSupplierState)
  }
  
  const handleSaveSupplier = async () => {
    if (!supplierData.name.trim()) {
      toast({ variant: "destructive", title: "Gagal", description: "Nama Pemasok tidak boleh kosong."})
      return
    }
    let updatedSuppliers;
    if (currentSupplier) {
      updatedSuppliers = suppliers.map(s => s.id === currentSupplier.id ? { ...s, ...supplierData } : s)
    } else {
      const newSupplier = { id: `sup-${Date.now()}`, ...supplierData }
      updatedSuppliers = [...suppliers, newSupplier]
    }
    const db = await getDatabase();
    await saveDatabase({ ...db, suppliers: updatedSuppliers });
    setSuppliers(updatedSuppliers);
    toast({ title: "Sukses", description: `Data pemasok "${supplierData.name}" telah disimpan.`})
    handleCloseSupplierDialog()
  }

  const handleDeleteSupplier = async (id: string) => {
    const updatedSuppliers = suppliers.filter(s => s.id !== id);
    const db = await getDatabase();
    await saveDatabase({ ...db, suppliers: updatedSuppliers });
    setSuppliers(updatedSuppliers)
    toast({ title: "Dihapus", description: "Pemasok telah dihapus."})
  }
  
  // Group Handlers
  const handleOpenGroupDialog = (group: ProductGroup | null = null) => {
    setCurrentGroup(group)
    setGroupName(group?.name || '')
    setIsGroupDialogOpen(true)
  }
  
  const handleCloseGroupDialog = () => {
    setIsGroupDialogOpen(false)
    setCurrentGroup(null)
    setGroupName('')
  }

  const handleSaveGroup = async () => {
    if (!groupName.trim()) {
      toast({ variant: "destructive", title: "Gagal", description: "Nama Kelompok tidak boleh kosong."})
      return
    }
    let updatedGroups;
    if (currentGroup) {
      updatedGroups = productGroups.map(g => g.id === currentGroup.id ? { ...g, name: groupName } : g)
    } else {
      const newGroup = { id: `${Date.now()}`, name: groupName }
      updatedGroups = [...productGroups, newGroup]
    }
    const db = await getDatabase();
    await saveDatabase({ ...db, productGroups: updatedGroups });
    setProductGroups(updatedGroups);
    toast({ title: "Sukses", description: `Data kelompok "${groupName}" telah disimpan.`})
    handleCloseGroupDialog()
  }

  const handleDeleteGroup = async (id: string) => {
    const updatedGroups = productGroups.filter(g => g.id !== id);
    const db = await getDatabase();
    await saveDatabase({ ...db, productGroups: updatedGroups });
    setProductGroups(updatedGroups)
    toast({ title: "Dihapus", description: "Kelompok telah dihapus."})
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.push(`/pengaturan?tab=${value}`, { scroll: false });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="ml-4 text-lg text-muted-foreground">Memuat Pengaturan...</span>
      </div>
    );
  }

  return (
    <>
    <div className="space-y-4">
      <h1 className="font-headline text-3xl font-bold tracking-tight">Setting Program</h1>
      
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="perusahaan">Perusahaan</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="pemasok">Pemasok</TabsTrigger>
          <TabsTrigger value="kelompok">Kelompok Barang</TabsTrigger>
          <TabsTrigger value="peraturan">Peraturan</TabsTrigger>
          <TabsTrigger value="lain-lain">Lain-lain</TabsTrigger>
          <TabsTrigger value="peralatan">Peralatan</TabsTrigger>
          <TabsTrigger value="voucher">Voucher</TabsTrigger>
        </TabsList>
        
        <TabsContent value="perusahaan">
          <Card className="shadow-md">
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-4">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                    <Label htmlFor="namaPerusahaan">Nama Perusahaan/Toko</Label>
                    <Input id="namaPerusahaan" value={settings.namaPerusahaan} onChange={handleChange} />
                  </div>
                  <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                    <Label htmlFor="bidangUsaha">Bidang Usaha</Label>
                    <Input id="bidangUsaha" value={settings.bidangUsaha} onChange={handleChange} />
                  </div>
                  <div className="grid grid-cols-[150px_1fr] items-start gap-4">
                    <Label htmlFor="alamat">Alamat</Label>
                    <Textarea id="alamat" value={settings.alamat} onChange={handleChange} rows={2} />
                  </div>
                  <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                    <Label htmlFor="kota">Kota</Label>
                    <div className="flex items-center gap-2">
                      <Input id="kota" value={settings.kota} onChange={handleChange} />
                      <Label htmlFor="kodePos" className="whitespace-nowrap">Kode Pos</Label>
                      <Input id="kodePos" value={settings.kodePos} onChange={handleChange} />
                    </div>
                  </div>
                   <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                    <Label htmlFor="provinsi">Provinsi</Label>
                    <Input id="provinsi" value={settings.provinsi} onChange={handleChange} />
                  </div>
                   <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                    <Label htmlFor="noTelp">No. Telp</Label>
                    <div className="flex items-center gap-2">
                       <Input id="noTelp" value={settings.noTelp} onChange={handleChange} />
                       <Label htmlFor="fax" className="whitespace-nowrap">Fax</Label>
                       <Input id="fax" value={settings.fax} onChange={handleChange} />
                    </div>
                  </div>
                   <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={settings.email} onChange={handleChange} />
                  </div>
                   <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" value={settings.website} onChange={handleChange} />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                    <Label htmlFor="posisiCabang">Posisi Cabang</Label>
                    <Select value={settings.posisiCabang} onValueChange={handleSelectChange('posisiCabang')}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pusat">Pusat</SelectItem>
                        <SelectItem value="cabang">Cabang</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                   <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                    <Label htmlFor="background">Background</Label>
                     <div className="flex items-center gap-1">
                        <Input id="background" value={settings.background} onChange={handleChange} />
                        <Button variant="outline" size="icon" className="h-9 w-9"><MoreHorizontal className="h-4 w-4"/></Button>
                     </div>
                  </div>
                   <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                    <Label htmlFor="logo">Logo</Label>
                     <div className="flex items-center gap-1">
                        <Input id="logo" value={settings.logo} onChange={handleChange} />
                        <Button variant="outline" size="icon" className="h-9 w-9"><MoreHorizontal className="h-4 w-4"/></Button>
                     </div>
                  </div>
                  <div className="grid grid-cols-[150px_1fr] items-start gap-4 pt-2">
                    <Label>Metode</Label>
                    <RadioGroup value={settings.metode} onValueChange={handleSelectChange('metode')}>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="average" id="metode-average" />
                            <Label htmlFor="metode-average" className="font-normal">Metode AVERAGE</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="fifo" id="metode-fifo" />
                            <Label htmlFor="metode-fifo" className="font-normal">Metode FIFO/LIFO</Label>
                        </div>
                    </RadioGroup>
                  </div>
                   <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                    <Label htmlFor="warnaKasir">Warna Kasir</Label>
                    <Select value={settings.warnaKasir} onValueChange={handleSelectChange('warnaKasir')}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hijau">Warna HIJAU</SelectItem>
                        <SelectItem value="biru">Warna BIRU</SelectItem>
                        <SelectItem value="merah">Warna MERAH</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="database">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Pengaturan Database & Penyimpanan</CardTitle>
              <CardDescription>
                Atur bagaimana dan di mana data aplikasi Anda disimpan. Untuk penggunaan di komputer, pilih mode "Lokal".
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Settings for Local Storage (Electron) */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="text-lg font-semibold text-primary">Penyimpanan Lokal (Direkomendasikan)</h3>
                <p className="text-sm text-muted-foreground">
                  Simpan data secara aman di komputer Anda. Opsi ini memerlukan aplikasi dijalankan via Electron.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                    <div className="space-y-4">
                        <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                            <Label htmlFor="lokalDbPath">File Database</Label>
                            <div className="flex items-center gap-1">
                                <Input id="lokalDbPath" value={settings.lokalDbPath} onChange={handleChange} />
                                <Button variant="outline" type="button" size="icon" className="h-9 w-9" onClick={() => handleSelectPath('lokalDbPath', 'file', { filters: [{ name: 'Database Files', extensions: ['fdb', 'db', 'json'] }] })} disabled={!isElectronContext}>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                         <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                            <Label htmlFor="backupPath">Folder Backup</Label>
                            <div className="flex items-center gap-1">
                                <Input id="backupPath" value={settings.backupPath} onChange={handleChange} />
                                <Button variant="outline" type="button" size="icon" className="h-9 w-9" onClick={() => handleSelectPath('backupPath', 'directory')} disabled={!isElectronContext}>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                         <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                            <Label htmlFor="productImagePath">Folder Gambar Produk</Label>
                            <div className="flex items-center gap-1">
                                <Input id="productImagePath" value={settings.productImagePath} onChange={handleChange} />
                                <Button variant="outline" type="button" size="icon" className="h-9 w-9" onClick={() => handleSelectPath('productImagePath', 'directory')} disabled={!isElectronContext}>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                         <div className="flex items-center gap-2 pt-5">
                            <Checkbox id="showBackupProcess" checked={settings.showBackupProcess} onCheckedChange={handleCheckboxChange('showBackupProcess')} />
                            <Label htmlFor="showBackupProcess" className="font-normal">Tampilkan Proses Backup Database</Label>
                        </div>
                    </div>
                </div>
              </div>
              
               {/* Settings for Network/Server */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="text-lg font-semibold text-primary">Pengaturan Server Jaringan (Lanjutan)</h3>
                <p className="text-sm text-muted-foreground">
                  Konfigurasi ini untuk menghubungkan aplikasi ke database server di jaringan.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                    <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                        <Label htmlFor="serverHost">Host Server</Label>
                        <Input id="serverHost" value={settings.serverHost} onChange={handleChange} />
                    </div>
                    <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                        <Label htmlFor="serverDbPath">Path Database di Server</Label>
                        <Input id="serverDbPath" value={settings.serverDbPath} onChange={handleChange}/>
                    </div>
                    <div className="grid grid-cols-[150px_1fr] items-center gap-4">
                        <Label htmlFor="serverPort">Port</Label>
                        <Input id="serverPort" value={settings.serverPort} onChange={handleChange} />
                    </div>
                    <div className="mt-4">
                        <Button variant="outline">Tes Koneksi</Button>
                    </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pemasok">
            <Card className="shadow-md">
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle>Daftar Pemasok</CardTitle>
                <Button onClick={() => handleOpenSupplierDialog(null)}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Tambah Pemasok
                </Button>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Pemasok</TableHead>
                      <TableHead>Nama Kontak</TableHead>
                      <TableHead>No. HP</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliers.map((supplier) => (
                      <TableRow key={supplier.id}>
                        <TableCell className="font-medium">{supplier.name}</TableCell>
                        <TableCell>{supplier.contactPerson}</TableCell>
                        <TableCell>{supplier.phone}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleOpenSupplierDialog(supplier)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteSupplier(supplier.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="kelompok">
            <Card className="shadow-md">
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle>Daftar Kelompok Barang</CardTitle>
                <Button onClick={() => handleOpenGroupDialog(null)}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Tambah Kelompok
                </Button>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-0">
                 <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Kelompok</TableHead>
                      <TableHead>Nama Kelompok</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productGroups.map((group) => (
                      <TableRow key={group.id}>
                        <TableCell className="font-mono">{group.id}</TableCell>
                        <TableCell className="font-medium">{group.name}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleOpenGroupDialog(group)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteGroup(group.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="peraturan"><Card className="shadow-md min-h-[400px] p-6"><p className="text-muted-foreground">Pengaturan peraturan akan tersedia di sini.</p></Card></TabsContent>
        <TabsContent value="lain-lain"><Card className="shadow-md min-h-[400px] p-6"><p className="text-muted-foreground">Pengaturan lain-lain akan tersedia di sini.</p></Card></TabsContent>
        <TabsContent value="peralatan"><Card className="shadow-md min-h-[400px] p-6"><p className="text-muted-foreground">Pengaturan peralatan akan tersedia di sini.</p></Card></TabsContent>
        <TabsContent value="voucher"><Card className="shadow-md min-h-[400px] p-6"><p className="text-muted-foreground">Pengaturan voucher akan tersedia di sini.</p></Card></TabsContent>
      </Tabs>

      <div className="bg-primary flex-shrink-0 p-1.5 rounded-md">
        <div className="flex items-center justify-between gap-1.5 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" className="bg-gray-700 text-white hover:bg-gray-600 h-8 px-3 text-xs font-sans" onClick={handleSave}>Simpan</Button>
            <Button variant="ghost" className="bg-gray-700 text-white hover:bg-gray-600 h-8 px-3 text-xs font-sans" onClick={handleBatal}>Batal</Button>
            <Button variant="ghost" className="bg-gray-700 text-white hover:bg-gray-600 h-8 px-3 text-xs font-sans" onClick={() => window.location.reload()}>Refresh</Button>
            <Button variant="ghost" className="bg-gray-700 text-white hover:bg-gray-600 h-8 px-3 text-xs font-sans">[ESC] Tutup</Button>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="aktifBkp" checked={settings.aktifBkp} onCheckedChange={handleCheckboxChange('aktifBkp')} className="border-white data-[state=checked]:bg-white data-[state=checked]:text-primary" />
            <Label htmlFor="aktifBkp" className="text-white">Aktif BKP</Label>
            <Input id="persenBkp" value={settings.persenBkp} onChange={handleChange} className="w-20 text-center h-7 text-xs bg-gray-700 text-white border-gray-500" />
          </div>
        </div>
      </div>
    </div>
    
    {/* Supplier Dialog */}
    <Dialog open={isSupplierDialogOpen} onOpenChange={handleCloseSupplierDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{currentSupplier ? 'Edit Pemasok' : 'Tambah Pemasok Baru'}</DialogTitle>
           <DialogDescription>
              Isi detail profil pemasok di bawah ini.
            </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Nama PT/Toko</Label>
            <Input id="name" value={supplierData.name} onChange={handleSupplierInputChange} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="contactPerson" className="text-right">Nama Kontak</Label>
            <Input id="contactPerson" value={supplierData.contactPerson} onChange={handleSupplierInputChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="address" className="text-right">Alamat</Label>
            <Textarea id="address" value={supplierData.address} onChange={handleSupplierInputChange} className="col-span-3" rows={3} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">No. HP</Label>
            <Input id="phone" value={supplierData.phone} onChange={handleSupplierInputChange} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCloseSupplierDialog}>Batal</Button>
          <Button onClick={handleSaveSupplier}>Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    
    {/* Group Dialog */}
    <Dialog open={isGroupDialogOpen} onOpenChange={handleCloseGroupDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{currentGroup ? 'Edit Kelompok' : 'Tambah Kelompok Baru'}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="groupName">Nama Kelompok</Label>
          <Input id="groupName" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCloseGroupDialog}>Batal</Button>
          <Button onClick={handleSaveGroup}>Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}
