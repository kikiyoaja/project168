'use client'

import * as React from "react"
import { format } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import type { CashTransaction } from "@/lib/types"
import { getDatabase, saveDatabase } from "@/lib/local-db"
import { cn } from "@/lib/utils"

export default function TransaksiKasPage() {
  const { toast } = useToast()

  const [transactions, setTransactions] = React.useState<CashTransaction[]>([])
  const [type, setType] = React.useState<'in' | 'out'>('in')
  const [amount, setAmount] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [isSaving, setIsSaving] = React.useState(false)

  React.useEffect(() => {
    const loadData = async () => {
      const db = await getDatabase()
      const sortedTransactions = (db.cashTransactions || []).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      setTransactions(sortedTransactions)
    }
    loadData()
  }, [])

  const handleSave = async () => {
    if (!amount || !description) {
      toast({
        variant: 'destructive',
        title: 'Data Tidak Lengkap',
        description: 'Harap isi jumlah dan keterangan.',
      })
      return
    }

    setIsSaving(true)
    const now = new Date()
    const newTransaction: CashTransaction = {
      id: `CASH-${now.getTime()}`,
      date: now.toISOString(),
      type,
      amount: parseFloat(amount.replace(/\./g, '')),
      description,
      user: 'Admin', // Placeholder
    }

    try {
      const db = await getDatabase()
      const updatedTransactions = [...(db.cashTransactions || []), newTransaction]
      await saveDatabase({ ...db, cashTransactions: updatedTransactions })
      
      const sorted = updatedTransactions.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      setTransactions(sorted)
      toast({
        title: 'Transaksi Berhasil Disimpan',
        description: `Kas ${type === 'in' ? 'Masuk' : 'Keluar'} senilai Rp${newTransaction.amount.toLocaleString('id-ID')} telah dicatat.`,
      })
      // Reset form
      setAmount('')
      setDescription('')
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Gagal Menyimpan',
        description: 'Terjadi kesalahan saat menyimpan data.',
      })
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }
  
  const formatNumber = (value: string) => {
    return value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(formatNumber(e.target.value));
  };

  const formatCurrency = (value: number) => `Rp${value.toLocaleString('id-ID')}`

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">Transaksi Kas</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Catat Transaksi Baru</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Jenis Transaksi</Label>
                <RadioGroup value={type} onValueChange={(v) => setType(v as 'in' | 'out')} className="flex gap-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="in" id="type-in" />
                    <Label htmlFor="type-in" className="font-normal">Kas Masuk</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="out" id="type-out" />
                    <Label htmlFor="type-out" className="font-normal">Kas Keluar</Label>
                  </div>
                </RadioGroup>
              </div>
              <div>
                <Label htmlFor="amount">Jumlah (Rp)</Label>
                <Input 
                  id="amount" 
                  value={amount} 
                  onChange={handleAmountChange} 
                  placeholder="0"
                  className="font-mono text-lg"
                />
              </div>
              <div>
                <Label htmlFor="description">Keterangan</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contoh: Biaya listrik bulan Juli, setoran modal awal, dll."
                />
              </div>
              <Button onClick={handleSave} disabled={isSaving} className="w-full">
                {isSaving ? 'Menyimpan...' : 'Simpan Transaksi'}
              </Button>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Riwayat Transaksi Kas</CardTitle>
              <CardDescription>Daftar semua transaksi kas yang pernah dicatat.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length > 0 ? (
                    transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>{format(new Date(tx.date), 'd MMM yyyy, HH:mm', { locale: idLocale })}</TableCell>
                        <TableCell>
                          <span className={cn(
                            "flex items-center gap-1 font-medium",
                            tx.type === 'in' ? 'text-green-600' : 'text-red-600'
                          )}>
                            {tx.type === 'in' ? <ArrowDownCircle className="h-4 w-4" /> : <ArrowUpCircle className="h-4 w-4" />}
                            {tx.type === 'in' ? 'Masuk' : 'Keluar'}
                          </span>
                        </TableCell>
                        <TableCell>{tx.description}</TableCell>
                        <TableCell className="text-right font-mono">{formatCurrency(tx.amount)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        Belum ada transaksi kas yang dicatat.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
