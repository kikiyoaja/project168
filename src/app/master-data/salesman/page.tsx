
'use client'

import * as React from "react"
import { PlusCircle, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import type { Salesman } from "@/lib/types"
import { getDatabase, saveDatabase } from "@/lib/local-db"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const initialSalesmanState: Omit<Salesman, 'id'> = {
  name: '',
  phone: '',
  address: '',
  status: 'Aktif'
};

export default function SalesmanPage() {
  const { toast } = useToast()
  
  const [salesmen, setSalesmen] = React.useState<Salesman[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [currentSalesman, setCurrentSalesman] = React.useState<Salesman | null>(null)
  const [salesmanData, setSalesmanData] = React.useState(initialSalesmanState)

  React.useEffect(() => {
    const loadData = async () => {
      const db = await getDatabase()
      setSalesmen(db.salesmen || [])
    }
    loadData()
  }, [])
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setSalesmanData(prev => ({ ...prev, [id]: value }));
  }
  
  const handleStatusChange = (status: 'Aktif' | 'Non-Aktif') => {
    setSalesmanData(prev => ({ ...prev, status }));
  }

  const handleOpenDialog = (salesman: Salesman | null = null) => {
    setCurrentSalesman(salesman)
    if (salesman) {
      setSalesmanData({ 
          name: salesman.name, 
          phone: salesman.phone, 
          address: salesman.address, 
          status: salesman.status 
        })
    } else {
      setSalesmanData(initialSalesmanState);
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setCurrentSalesman(null)
    setSalesmanData(initialSalesmanState)
  }
  
  const handleSaveSalesman = async () => {
    if (!salesmanData.name.trim()) {
      toast({ variant: "destructive", title: "Gagal", description: "Nama Salesman tidak boleh kosong."})
      return
    }
    
    let updatedSalesmen;
    if (currentSalesman) {
      updatedSalesmen = salesmen.map(s => s.id === currentSalesman.id ? { ...currentSalesman, ...salesmanData } : s)
    } else {
      const newId = `sls-${Date.now()}`;
      const newSalesman: Salesman = { id: newId, ...salesmanData }
      updatedSalesmen = [...salesmen, newSalesman]
    }
    
    const db = await getDatabase();
    await saveDatabase({ ...db, salesmen: updatedSalesmen });
    setSalesmen(updatedSalesmen);
    toast({ title: "Sukses", description: `Data salesman "${salesmanData.name}" telah disimpan.`})
    handleCloseDialog()
  }

  const handleDeleteSalesman = async (id: string) => {
    const updatedSalesmen = salesmen.filter(s => s.id !== id);
    const db = await getDatabase();
    await saveDatabase({ ...db, salesmen: updatedSalesmen });
    setSalesmen(updatedSalesmen)
    toast({ title: "Dihapus", description: "Salesman telah dihapus."})
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="font-headline text-3xl font-bold tracking-tight">Data Salesman</h1>
          <Button onClick={() => handleOpenDialog()}>
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Salesman
          </Button>
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Daftar Salesman</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Salesman</TableHead>
                  <TableHead>No. HP</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesmen.length > 0 ? salesmen.map((salesman) => (
                  <TableRow key={salesman.id}>
                    <TableCell className="font-medium">{salesman.name}</TableCell>
                    <TableCell>{salesman.phone}</TableCell>
                     <TableCell>
                        <Badge variant={salesman.status === 'Aktif' ? 'default' : 'secondary'}>
                            {salesman.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenDialog(salesman)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteSalesman(salesman.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center h-24">
                            Belum ada data salesman.
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
            <DialogTitle>{currentSalesman ? 'Edit Salesman' : 'Tambah Salesman Baru'}</DialogTitle>
            <DialogDescription>
              Isi detail profil salesman di bawah ini.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Nama</Label>
              <Input id="name" value={salesmanData.name} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">No. HP</Label>
              <Input id="phone" value={salesmanData.phone} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="address" className="text-right">Alamat</Label>
              <Textarea id="address" value={salesmanData.address} onChange={handleInputChange} className="col-span-3" rows={3} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Status</Label>
                 <RadioGroup value={salesmanData.status} onValueChange={(v) => handleStatusChange(v as any)} className="col-span-3 flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Aktif" id="status-aktif" />
                        <Label htmlFor="status-aktif" className="font-normal">Aktif</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Non-Aktif" id="status-nonaktif" />
                        <Label htmlFor="status-nonaktif" className="font-normal">Non-Aktif</Label>
                    </div>
                </RadioGroup>
              </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>Batal</Button>
            <Button onClick={handleSaveSalesman}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
