'use client'

import * as React from "react"
import type { Product } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import { getAppSettings, getDatabase } from "@/lib/local-db"

export default function CetakPriceTagPage() {
  const [products, setProducts] = React.useState<Product[]>([])
  const [selectedProducts, setSelectedProducts] = React.useState<Set<string>>(new Set())
  const [storeName, setStoreName] = React.useState('ZIYYANMART')

  React.useEffect(() => {
    const loadData = async () => {
        const savedSettings = await getAppSettings();
        if (savedSettings) {
            setStoreName(savedSettings.namaPerusahaan || 'ZIYYANMART');
        }
        
        const db = await getDatabase();
        setProducts(db.products);
    }
    loadData();
  }, [])

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      const allProductIds = new Set(products.map(p => p.id))
      setSelectedProducts(allProductIds)
    } else {
      setSelectedProducts(new Set())
    }
  }

  const handleSelectProduct = (productId: string, checked: boolean) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(productId)
      } else {
        newSet.delete(productId)
      }
      return newSet
    })
  }

  const handlePrint = () => {
    const productsToPrint = products.filter(p => selectedProducts.has(p.id))
    if (productsToPrint.length === 0) {
      alert("Pilih setidaknya satu produk untuk dicetak.")
      return
    }

    const priceTagHtml = productsToPrint.map(product => {
      const baseUnit = product.units?.find(u => u.quantity === 1) || { name: 'PCS', price: product.price, barcode: product.id, quantity: 1 };
      const barcodeToDisplay = baseUnit.barcode || product.id;

      return `
      <div class="price-tag">
        <div class="product-name">${product.name.toUpperCase()}</div>
        <div class="barcode-section">
          <div class="barcode-visual">*${barcodeToDisplay}*</div>
          <div class="barcode-text">${barcodeToDisplay}</div>
        </div>
        <div class="banner">
          <div class="line-yellow"></div>
          <div class="line-green"></div>
          <span class="store-name">${storeName.toUpperCase()}</span>
        </div>
        <div class="price-line">
          <span class="price">${product.price.toLocaleString('id-ID', { minimumFractionDigits: 0 })}</span>
          <span class="unit">/ ${baseUnit.name.toUpperCase()}</span>
        </div>
        <div class="divider"></div>
        <div class="footer-info">
          <span>0 / Min. 0</span>
          <span>09-07-2025</span>
        </div>
      </div>
    `}).join('')

    const printContent = `
      <html>
        <head>
          <title>Cetak Price Tag</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Libre+Barcode+39&family=Roboto:wght@400;500;700;900&family=Oswald:wght@700&display=swap" rel="stylesheet">
          <style>
            @media print {
              body { -webkit-print-color-adjust: exact; }
              @page { size: A4; margin: 10mm; }
            }
            body { font-family: 'Roboto', sans-serif; }
            .container {
              display: flex;
              flex-wrap: wrap;
              justify-content: flex-start;
              align-content: flex-start;
              gap: 2mm;
            }
            .price-tag {
              width: 65mm;
              height: 40mm;
              border: 1.5px solid #0000FF;
              border-radius: 8px;
              padding: 4px 6px;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              background: white;
              color: black;
              page-break-inside: avoid;
              overflow: hidden;
            }
            .product-name {
                font-size: 9pt;
                font-weight: 700;
                text-align: left;
                margin-bottom: 2px;
                line-height: 1.1;
                height: 5.5mm;
                overflow: hidden;
            }
            .barcode-section {
                text-align: center;
                line-height: 1;
                margin-bottom: 2px;
            }
            .barcode-visual {
                font-family: 'Libre Barcode 39', system-ui;
                font-size: 28pt;
                height: 7mm;
                overflow: hidden;
            }
            .barcode-text {
                font-family: monospace;
                font-size: 8pt;
                letter-spacing: 1px;
                margin-top: -3px;
            }
            .banner {
                position: relative;
                height: 4mm;
                margin-bottom: 2px;
                display: flex;
                flex-direction: column;
            }
            .line-yellow, .line-green {
                height: 50%;
            }
            .line-yellow { background-color: #FFFF00; }
            .line-green { background-color: #00FF00; }
            .store-name {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-family: 'Oswald', sans-serif;
                font-weight: 700;
                font-size: 11pt;
                color: #0000FF;
                background-color: white;
                padding: 0 5px;
                letter-spacing: -0.5px;
            }
            .price-line {
              display: flex;
              justify-content: center;
              align-items: baseline;
              gap: 4px;
            }
            .price {
              font-size: 28pt;
              font-weight: 900;
              color: red;
              line-height: 1;
            }
            .unit {
              font-size: 9pt;
              font-weight: 500;
            }
            .divider {
              border-bottom: 1.5px dashed #0000FF;
              margin: 2px 0;
            }
            .footer-info {
              display: flex;
              justify-content: space-between;
              font-size: 8pt;
              color: #808080;
              font-family: monospace;
            }
          </style>
        </head>
        <body>
          <div class="container">
            ${priceTagHtml}
          </div>
        </body>
      </html>
    `

    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    }
  }

  const isAllSelected = products.length > 0 && selectedProducts.size === products.length;
  const isIndeterminate = selectedProducts.size > 0 && !isAllSelected;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Cetak Price Tag / Label Harga</h1>
        <Button onClick={handlePrint} disabled={selectedProducts.size === 0}>
          <Printer className="mr-2 h-4 w-4" />
          Cetak Label Terpilih ({selectedProducts.size})
        </Button>
      </div>
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Pilih Produk</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="select-all"
                      checked={isAllSelected || (products.length > 0 && isIndeterminate)}
                      onCheckedChange={handleSelectAll}
                      aria-label="Pilih Semua"
                    />
                  </div>
                </TableHead>
                <TableHead>PLU</TableHead>
                <TableHead>Nama Produk</TableHead>
                <TableHead className="text-right">Harga</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id} data-state={selectedProducts.has(product.id) ? "selected" : ""}>
                  <TableCell>
                    <Checkbox
                      id={`select-${product.id}`}
                      checked={selectedProducts.has(product.id)}
                      onCheckedChange={(checked) => handleSelectProduct(product.id, !!checked)}
                      aria-labelledby={`plu-${product.id}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium font-mono" id={`plu-${product.id}`}>{product.id}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell className="text-right">Rp{product.price.toLocaleString("id-ID")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
