'use client'

import * as React from "react"
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts"
import { format } from "date-fns"
import { id } from "date-fns/locale"

import type { Sale, Product, ProductGroup } from "@/lib/types"
import { getDatabase } from "@/lib/local-db"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DollarSign, ReceiptText, ShoppingCart } from "lucide-react"

type SalesByDay = {
  date: string
  totalSales: number
}

type TopProduct = {
  id: string
  name: string
  quantitySold: number
  totalRevenue: number
}

type SalesByCategory = {
  name: string;
  value: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919'];

export default function AnalisaPenjualanPage() {
  const [sales, setSales] = React.useState<Sale[]>([])
  const [products, setProducts] = React.useState<Product[]>([])
  const [productGroups, setProductGroups] = React.useState<ProductGroup[]>([])

  React.useEffect(() => {
    const loadData = async () => {
      const db = await getDatabase()
      setSales(db.sales)
      setProducts(db.products)
      setProductGroups(db.productGroups)
    }
    loadData()
  }, [])

  const {
    totalRevenue,
    totalTransactions,
    averageTransactionValue,
    totalCost,
    totalProfit,
    profitMargin,
    salesByDay,
    topProducts,
    salesByCategory,
  } = React.useMemo(() => {
    const revenue = sales.reduce((sum, sale) => sum + sale.total, 0)
    const transactions = sales.length

    const costResult = sales.reduce((acc, sale) => {
      sale.items.forEach(item => {
        if (item.productId === 'DISCOUNT-POINTS') return
        const product = products.find(p => p.id === item.productId)
        if (product && product.cost) {
          acc += product.cost * item.quantity * item.unitQuantity
        }
      })
      return acc
    }, 0)

    const profit = revenue - costResult
    
    // Group sales by day
    const dailySales = sales.reduce((acc, sale) => {
      const date = format(new Date(sale.date), 'yyyy-MM-dd')
      if (!acc[date]) {
        acc[date] = { date, totalSales: 0 }
      }
      acc[date].totalSales += sale.total
      return acc
    }, {} as Record<string, SalesByDay>)

    const sortedDailySales = Object.values(dailySales).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    // Calculate top selling products and sales by category
    const productSales = new Map<string, TopProduct>();
    const categorySales = new Map<string, number>();

    sales.flatMap(s => s.items).forEach(item => {
        if (item.productId === 'DISCOUNT-POINTS') return
        
        const product = products.find(p => p.id === item.productId);
        if (!product) return;

        // Top products calculation
        if (!productSales.has(item.productId)) {
            productSales.set(item.productId, { id: item.productId, name: item.productName, quantitySold: 0, totalRevenue: 0 });
        }
        const currentProduct = productSales.get(item.productId)!;
        currentProduct.quantitySold += item.quantity;
        currentProduct.totalRevenue += (item.price * item.quantity) - (item.discountAmount || 0);

        // Sales by category calculation
        const categoryId = product.groupId;
        const saleAmount = (item.price * item.quantity) - (item.discountAmount || 0);
        categorySales.set(categoryId, (categorySales.get(categoryId) || 0) + saleAmount);
    });

    const sortedTopProducts = Array.from(productSales.values())
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 5)

    const salesByCategoryData = Array.from(categorySales.entries()).map(([groupId, total]) => ({
        name: productGroups.find(g => g.id === groupId)?.name || 'Lainnya',
        value: total,
    })).sort((a,b) => b.value - a.value);

    return {
      totalRevenue: revenue,
      totalTransactions: transactions,
      averageTransactionValue: transactions > 0 ? revenue / transactions : 0,
      totalCost: costResult,
      totalProfit: profit,
      profitMargin: revenue > 0 ? (profit / revenue) * 100 : 0,
      salesByDay: sortedDailySales,
      topProducts: sortedTopProducts,
      salesByCategory: salesByCategoryData,
    }
  }, [sales, products, productGroups])
  
  const formatCurrency = (value: number) => `Rp${value.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">Grafik & Analisa Penjualan</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Penjualan</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Total pendapatan dari semua penjualan.</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Laba Kotor</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalProfit)}</div>
            <p className="text-xs text-muted-foreground">
                Margin Laba: {profitMargin.toFixed(2)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jumlah Transaksi</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
            <p className="text-xs text-muted-foreground">Total nota yang tercatat.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata per Transaksi</CardTitle>
            <ReceiptText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averageTransactionValue)}</div>
            <p className="text-xs text-muted-foreground">Nilai rata-rata per nota.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Tren Penjualan Harian</CardTitle>
            <CardDescription>Visualisasi total penjualan per hari.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesByDay} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(str) => format(new Date(str), "d MMM", { locale: id })}
                />
                <YAxis 
                  tickFormatter={(value) => `Rp${(value / 1000).toFixed(0)}k`} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '0.5rem', border: '1px solid hsl(var(--border))' }}
                  labelFormatter={(label) => format(new Date(label), "eeee, d MMMM yyyy", { locale: id })}
                  formatter={(value: number) => [formatCurrency(value), 'Total Penjualan']}
                />
                <Line type="monotone" dataKey="totalSales" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Penjualan per Kategori</CardTitle>
            <CardDescription>Distribusi pendapatan dari berbagai kategori produk.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={salesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {salesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [formatCurrency(value), name]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>5 Produk Terlaris</CardTitle>
          <CardDescription>Berdasarkan jumlah unit yang terjual.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
              <TableHeader>
                  <TableRow>
                      <TableHead>Nama Produk</TableHead>
                      <TableHead className="text-right">Unit Terjual</TableHead>
                      <TableHead className="text-right">Total Omzet</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {topProducts.map(product => (
                      <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell className="text-right">{product.quantitySold.toLocaleString('id-ID')}</TableCell>
                          <TableCell className="text-right">{formatCurrency(product.totalRevenue)}</TableCell>
                      </TableRow>
                  ))}
              </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
