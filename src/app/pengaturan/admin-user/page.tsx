'use client'

import * as React from "react"
import { PlusCircle, Pencil, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { mockUsers } from "@/lib/mock-data"
import type { User } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export default function AdminUserPage() {
  const { toast } = useToast()
  const [users, setUsers] = React.useState<User[]>(mockUsers)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [currentUser, setCurrentUser] = React.useState<User | null>(null)

  const handleOpenDialog = (user: User | null = null) => {
    setCurrentUser(user)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setCurrentUser(null)
  }
  
  const getStatusVariant = (status: User['status']): 'default' | 'secondary' => {
    return status === 'Aktif' ? 'default' : 'secondary'
  }

  const handleSaveUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // In a real app, you would handle form data and API calls here
    toast({
        title: "Sukses!",
        description: `Data pengguna ${currentUser ? currentUser.username : "baru"} telah disimpan.`,
    })
    handleCloseDialog()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Administrasi User</h1>
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah User Baru
        </Button>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Daftar Pengguna</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Nama Lengkap</TableHead>
                <TableHead>Jabatan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(user.status)}>{user.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenDialog(user)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm">
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
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSaveUser}>
            <DialogHeader>
              <DialogTitle>{currentUser ? "Edit User" : "Tambah User Baru"}</DialogTitle>
              <DialogDescription>
                Isi detail pengguna di bawah ini. Klik simpan jika sudah selesai.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">Username</Label>
                <Input id="username" defaultValue={currentUser?.username} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="fullName" className="text-right">Nama Lengkap</Label>
                <Input id="fullName" defaultValue={currentUser?.fullName} className="col-span-3" required />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">Password</Label>
                <Input id="password" type="password" placeholder={currentUser ? "Kosongkan jika tidak diubah" : ""} className="col-span-3" required={!currentUser} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">Jabatan</Label>
                <Select defaultValue={currentUser?.role || "Kasir"}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Pilih jabatan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Kasir">Kasir</SelectItem>
                    <SelectItem value="Gudang">Staf Gudang</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Status</Label>
                 <RadioGroup defaultValue={currentUser?.status || 'Aktif'} className="col-span-3 flex items-center gap-4">
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
              <Button type="button" variant="outline" onClick={handleCloseDialog}>Batal</Button>
              <Button type="submit">Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
