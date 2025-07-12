'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { Product, ProductGroup } from '@/lib/types'
import { getDatabase } from '@/lib/local-db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

export default function KatalogPage() {
  const [products, setProducts] = React.useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = React.useState<Product[]>([])
  const [searchTerm, setSearchTerm] = React.useState('')
  const [productGroups, setProductGroups] = React.useState<ProductGroup[]>([])
  const [selectedGroup, setSelectedGroup] = React.useState('all')

  React.useEffect(() => {
    const loadData = async () => {
      const db = await getDatabase()
      setProducts(db.products)
      setFilteredProducts(db.products)
      setProductGroups(db.productGroups)
    }
    loadData()
  }, [])

  React.useEffect(() => {
    let result = products

    if (selectedGroup !== 'all') {
      result = result.filter(p => p.groupId === selectedGroup)
    }

    if (searchTerm.trim() !== '') {
      result = result.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    setFilteredProducts(result)
  }, [searchTerm, selectedGroup, products])
  
  const formatCurrency = (value: number) => `Rp${value.toLocaleString('id-ID')}`

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Katalog Produk</h1>
        <Button asChild variant="outline">
          <Link href="/master-data">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Daftar Barang
          </Link>
        </Button>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Telusuri Produk</CardTitle>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Cari nama produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64"
              />
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kelompok</SelectItem>
                  {productGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
                  <div className="relative w-full aspect-square">
                    <Image
                      src={product.imageUrl || 'https://placehold.co/300x300.png'}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                      data-ai-hint={product.aiHint}
                    />
                  </div>
                  <CardContent className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      {product.category && <Badge variant="secondary" className="mb-2">{product.category}</Badge>}
                      <h3 className="font-semibold text-lg leading-tight truncate">{product.name}</h3>
                      <p className="text-sm text-muted-foreground font-mono">{product.id}</p>
                    </div>
                    <div className="mt-4">
                        <p className="text-xl font-bold text-primary">{formatCurrency(product.price)}</p>
                        <p className="text-sm text-muted-foreground">Stok: {product.stock.toLocaleString('id-ID')}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
             <div className="text-center text-muted-foreground py-20">
              <p className="text-lg font-medium">Tidak ada produk ditemukan</p>
              <p>Coba sesuaikan filter pencarian Anda.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
