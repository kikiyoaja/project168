
'use client'

import * as React from "react"
import { PlusCircle, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import type { Bank } from "@/lib/types"
import { getDatabase, saveDatabase } from "@/lib/local-db"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"

const initialBankState: Omit<Bank, 'id'> = {
  name: '',
  type: 'Bank',
  accountNumber: '',
  accountName: ''
};

export default function DataBankPage() {
  const { toast } = useToast()
  
  const [banks, setBanks] = React.useState<Bank[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [currentBank, setCurrentBank] = React.useState<Bank | null>(null)
  const [bankData, setBankData] = React.useState(initialBankState)

  React.useEffect(() => {
    const loadData = async () => {
      const db = await getDatabase()
      setBanks(db.banks || [])
    }
    loadData()
  }, [])
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setBankData(prev => ({ ...prev, [id]: value }));
  }
  
  const handleTypeChange = (type: 'Bank' | 'E-Wallet') => {
    setBankData(prev => ({ ...prev, type }));
  }

  const handleOpenDialog = (bank: Bank | null = null) => {
    setCurrentBank(bank)
    if (bank) {
      setBankData({
        name: bank.name,
        type: bank.type,
        accountNumber: bank.accountNumber || '',
        accountName: bank.accountName || ''
      })
    } else {
      setBankData(initialBankState);
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setCurrentBank(null)
    setBankData(initialBankState)
  }
  
  const handleSaveBank = async () => {
    if (!bankData.name.trim()) {
      toast({ variant: "destructive", title: "Gagal", description: "Nama Bank/E-wallet tidak boleh kosong."})
      return
    }
    
    let updatedBanks;
    if (currentBank) {
      updatedBanks = banks.map(b => b.id === currentBank.id ? { ...currentBank, ...bankData } : b)
    } else {
      const newId = `${bankData.type.toLowerCase()}-${Date.now()}`;
      const newBank: Bank = { id: newId, ...bankData }
      updatedBanks = [...banks, newBank]
    }
    
    const db = await getDatabase();
    await saveDatabase({ ...db, banks: updatedBanks });
    setBanks(updatedBanks);
    toast({ title: "Sukses", description: `Data "${bankData.name}" telah disimpan.`})
    handleCloseDialog()
  }

  const handleDeleteBank = async (id: string) => {
    const updatedBanks = banks.filter(b => b.id !== id);
    const db = await getDatabase();
    await saveDatabase({ ...db, banks: updatedBanks });
    setBanks(updatedBanks)
    toast({ title: "Dihapus", description: "Data Bank/E-wallet telah dihapus."})
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">Data Bank & E-Wallet</h1>
            <p className="text-muted-foreground">Kelola daftar bank dan e-wallet untuk metode pembayaran.</p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Data
          </Button>
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Daftar Bank & E-Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>No. Rekening</TableHead>
                  <TableHead>Atas Nama</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banks.length > 0 ? banks.map((bank) => (
                  <TableRow key={bank.id}>
                    <TableCell className="font-medium">{bank.name}</TableCell>
                    <TableCell>
                        <Badge variant={bank.type === 'Bank' ? 'secondary' : 'default'}>
                            {bank.type}
                        </Badge>
                    </TableCell>
                    <TableCell>{bank.accountNumber || "-"}</TableCell>
                    <TableCell>{bank.accountName || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenDialog(bank)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteBank(bank.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center h-24">
                            Belum ada data bank atau e-wallet.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{currentBank ? 'Edit Data' : 'Tambah Data Baru'}</DialogTitle>
            <DialogDescription>
              Isi detail untuk bank atau e-wallet di bawah ini.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Jenis</Label>
              <RadioGroup value={bankData.type} onValueChange={(v) => handleTypeChange(v as any)} className="col-span-3 flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Bank" id="type-bank" />
                      <Label htmlFor="type-bank" className="font-normal">Bank</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                      <RadioGroupItem value="E-Wallet" id="type-ewallet" />
                      <Label htmlFor="type-ewallet" className="font-normal">E-Wallet</Label>
                  </div>
              </RadioGroup>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Nama</Label>
              <Input id="name" value={bankData.name} onChange={handleInputChange} className="col-span-3" required placeholder={bankData.type === 'Bank' ? 'Contoh: BCA' : 'Contoh: GoPay'} />
            </div>
            {bankData.type === 'Bank' && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="accountNumber" className="text-right">No. Rekening</Label>
                  <Input id="accountNumber" value={bankData.accountNumber} onChange={handleInputChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="accountName" className="text-right">Atas Nama</Label>
                  <Input id="accountName" value={bankData.accountName} onChange={handleInputChange} className="col-span-3" />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>Batal</Button>
            <Button onClick={handleSaveBank}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
