
'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import { PRIMARY_NAV_ITEMS, SECONDARY_NAV_ITEMS } from './nav-items'
import { cn } from '../../lib/utils'
import type { NavItem } from './nav-items'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { ChevronDown, Cloud, CloudOff } from 'lucide-react'
import { performBackup } from '../../lib/backup'
import { Button } from '../ui/button'
import { useToast } from '../../hooks/use-toast'
import { getAppSettings, getDatabase } from '../../lib/local-db'
import LogOffModal from '../cashier/log-off-modal'
import { Sale } from '../../lib/types'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  
  const [settings, setSettings] = React.useState({
    namaPerusahaan: 'ZIYYANMART',
    warnaKasir: 'biru',
  });
  
  const [allSales, setAllSales] = React.useState<Sale[]>([])
  const [isOnline, setIsOnline] = React.useState(true)
  const [isLogOffModalOpen, setIsLogOffModalOpen] = React.useState(false);

  React.useEffect(() => {
    const loadData = async () => {
        const savedSettings = await getAppSettings();
        if (savedSettings) {
            setSettings(prev => ({...prev, ...savedSettings}));
        }
        const db = await getDatabase()
        setAllSales(db.sales)
    }
    loadData();

    // Set initial online status
    if (typeof window !== 'undefined' && typeof window.navigator !== 'undefined') {
      setIsOnline(window.navigator.onLine);
    }
    
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, []);

  const handleSync = () => {
    toast({
      title: "Memulai sinkronisasi...",
      description: "Fungsionalitas sinkronisasi penuh sedang dalam pengembangan."
    })
  }

  const handleLogOffClick = () => {
    setIsLogOffModalOpen(true);
  };

  const handleConfirmLogOff = () => {
      setIsLogOffModalOpen(false);
      // Since login is removed, we can redirect to master-data or another main page
      router.push('/master-data'); 
  };

  // Don't render the default layout for the cashier or login page
  if (pathname === '/' || pathname === '/login') {
    return <>{children}</>
  }

  return (
    <>
      <div className="flex min-h-screen w-full flex-col bg-background">
        <header className="sticky top-0 z-50 flex flex-col shadow-md bg-white">
          {/* Top small menu */}
          <div className="flex h-8 items-center justify-between bg-gray-100 px-4 md:px-6 border-b">
              <nav className="flex items-center gap-4 text-sm">
                   {SECONDARY_NAV_ITEMS.map((item: NavItem) => {
                      if (item.label === 'Aplikasi') {
                        return (
                          <DropdownMenu key={item.label}>
                            <DropdownMenuTrigger asChild>
                              <button className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors focus:outline-none">
                                <span>{item.label}</span>
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              <DropdownMenuItem asChild><Link href="/">Home</Link></DropdownMenuItem>
                              <DropdownMenuItem onClick={handleLogOffClick} className="cursor-pointer">Log Off</DropdownMenuItem>
                              <DropdownMenuItem onClick={performBackup} className="cursor-pointer">Backup Database</DropdownMenuItem>
                              <DropdownMenuItem onClick={async () => {
                                // In Tauri, we'd use the appWindow to close.
                                // This requires setup in main.rs and a preload script, 
                                // or just calling a command.
                                try {
                                  const { appWindow } = await import('@tauri-apps/api/window');
                                  appWindow.close();
                                } catch (e) {
                                  console.error("Keluar hanya berfungsi di aplikasi Tauri", e);
                                  toast({
                                    variant: "destructive",
                                    title: "Fungsi Tidak Tersedia",
                                    description: "Keluar dari aplikasi hanya berfungsi saat dijalankan sebagai aplikasi desktop.",
                                  });
                                }
                              }} className="cursor-pointer">Keluar</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )
                      }
                      if (item.label === 'Penjualan') {
                        return (
                          <DropdownMenu key={item.label}>
                            <DropdownMenuTrigger asChild>
                              <button className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors focus:outline-none">
                                <span>{item.label}</span>
                                <ChevronDown className="h-3 w-3" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              <DropdownMenuItem asChild>
                                <Link href="/penjualan">Transaksi Penjualan</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href="#">Pembayaran Piutang</Link></DropdownMenuItem>
                               <DropdownMenuItem asChild>
                                <Link href="/penjualan/retur">Retur Penjualan</Link>
                              </DropdownMenuItem>
                               <DropdownMenuItem asChild>
                                <Link href="/penjualan/transaksi-kas">Transaksi Kas</Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link href="/pembelian/setting-poin-voucher">Poin Pelanggan</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href="/">Penukaran Poin Pelanggan</Link>
                              </DropdownMenuItem>
                               <DropdownMenuItem asChild>
                                <Link href="#">Pemberian Hadiah</Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link href="/master-data/katalog">Katalog Barang</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href="/cetak-pricetag">Cetak Price Tag</Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )
                      }
                      if (item.label === 'Pembelian') {
                        return (
                          <DropdownMenu key={item.label}>
                             <DropdownMenuTrigger asChild>
                              <button className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors focus:outline-none">
                                <span>{item.label}</span>
                                <ChevronDown className="h-3 w-3" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              <DropdownMenuItem asChild><Link href="/pembelian/order">Order Pembelian</Link></DropdownMenuItem>
                              <DropdownMenuItem asChild><Link href="/pembelian">Penerimaan Barang</Link></DropdownMenuItem>
                              <DropdownMenuItem asChild><Link href="/pembelian/bayar-hutang">Bayar Hutang</Link></DropdownMenuItem>
                              <DropdownMenuItem asChild><Link href="/pembelian/daftar">Edit Transaksi Pembelian</Link></DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild><Link href="/pembelian/retur">Retur Pembelian</Link></DropdownMenuItem>
                              <DropdownMenuItem asChild><Link href="/pembelian/retur-per-barang">Retur Pembelian Per Barang</Link></DropdownMenuItem>
                              <DropdownMenuItem asChild><Link href="/pembelian/konsinyasi">Konsinyasi</Link></DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild><Link href="/pembelian/setting-poin-voucher">Setting Poin / Voucher</Link></DropdownMenuItem>
                              <DropdownMenuItem asChild><Link href="/pembelian/cetak-barcode">Cetak Barcode</Link></DropdownMenuItem>
                              <DropdownMenuItem asChild><Link href="/pembelian/cetak-promo">Cetak Promo Item Barang</Link></DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild><Link href="/pembelian/kirim-cabang">Kirim Cabang</Link></DropdownMenuItem>
                              <DropdownMenuItem asChild><Link href="/pembelian/penyesuaian-stok">Penyesuaian Stok</Link></DropdownMenuItem>
                              <DropdownMenuItem asChild><Link href="/pembelian/promo-tebus-murah">Promo dan Tebus Murah</Link></DropdownMenuItem>
                              <DropdownMenuItem asChild><Link href="#">Voucher</Link></DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )
                      }
                      if (item.label === 'Data-data') {
                        return (
                          <DropdownMenu key={item.label}>
                            <DropdownMenuTrigger asChild>
                              <button className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors focus:outline-none">
                                <span>{item.label}</span>
                                <ChevronDown className="h-3 w-3" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                  <span>Data Penjualan</span>
                                </DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                  <DropdownMenuSubContent>
                                    <DropdownMenuItem asChild><Link href="#">Data Pelanggan</Link></DropdownMenuItem>
                                    <DropdownMenuItem asChild><Link href="/master-data/salesman">Data Salesman</Link></DropdownMenuItem>
                                    <DropdownMenuItem asChild><Link href="#">Data Wilayah</Link></DropdownMenuItem>
                                  </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                              </DropdownMenuSub>
                               <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                  <span>Data Pembelian</span>
                                </DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                  <DropdownMenuSubContent>
                                    <DropdownMenuItem asChild><Link href="/pengaturan?tab=pemasok">Data Pemasok</Link></DropdownMenuItem>
                                  </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                              </DropdownMenuSub>
                               <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                  <span>Data Lain-lain</span>
                                </DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                  <DropdownMenuSubContent>
                                    <DropdownMenuItem asChild><Link href="/pengaturan/data-bank">Data Bank</Link></DropdownMenuItem>
                                     <DropdownMenuItem asChild><Link href="#">Data Jasa Ekspedisi</Link></DropdownMenuItem>
                                  </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                              </DropdownMenuSub>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )
                      }
                      if (item.label === 'Master Data') {
                        return (
                          <DropdownMenu key={item.label}>
                            <DropdownMenuTrigger asChild>
                              <button className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors focus:outline-none">
                                <span>{item.label}</span>
                                <ChevronDown className="h-3 w-3" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              <DropdownMenuItem asChild><Link href="/master-data">Barang</Link></DropdownMenuItem>
                              <DropdownMenuItem asChild><Link href="/pengaturan?tab=pemasok">Pemasok</Link></DropdownMenuItem>
                              <DropdownMenuItem asChild><Link href="#">Pelanggan</Link></DropdownMenuItem>
                              <DropdownMenuItem asChild><Link href="/master-data/salesman">Salesman</Link></DropdownMenuItem>
                              <DropdownMenuItem asChild><Link href="#">Karyawan</Link></DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild><Link href="#">Divisi</Link></DropdownMenuItem>
                              <DropdownMenuItem asChild><Link href="/pengaturan?tab=kelompok">Kelompok</Link></DropdownMenuItem>
                              <DropdownMenuItem asChild><Link href="/master-data/satuan">Satuan</Link></DropdownMenuItem>
                              <DropdownMenuItem asChild><Link href="#">Rak</Link></DropdownMenuItem>
                              <DropdownMenuItem asChild><Link href="/pengaturan/data-bank">Bank</Link></DropdownMenuItem>
                              <DropdownMenuItem asChild><Link href="#">Cabang</Link></DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )
                      }
                      if (item.label === 'Laporan') {
                        return (
                          <DropdownMenu key={item.label}>
                            <DropdownMenuTrigger asChild>
                              <button className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors focus:outline-none">
                                <span>{item.label}</span>
                                <ChevronDown className="h-3 w-3" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>Statistik dan Analisa Data</DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                  <DropdownMenuSubContent>
                                    <DropdownMenuItem asChild><Link href="/laporan/grafik-penjualan">Grafik Penjualan</Link></DropdownMenuItem>
                                  </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                              </DropdownMenuSub>
                               <DropdownMenuSub>
                                <DropdownMenuSubTrigger>Transaksi Penjualan</DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                  <DropdownMenuSubContent>
                                    <DropdownMenuItem asChild><Link href="#">Monitoring Penjualan</Link></DropdownMenuItem>
                                    <DropdownMenuItem asChild><Link href="/penjualan">Laporan Penjualan</Link></DropdownMenuItem>
                                    <DropdownMenuItem asChild><Link href="/penjualan/laporan-kasir">Laporan per Kasir</Link></DropdownMenuItem>
                                    <DropdownMenuItem asChild><Link href="#">Penjualan per Divisi</Link></DropdownMenuItem>
                                    <DropdownMenuItem asChild><Link href="#">Penjualan Per Jam</Link></DropdownMenuItem>
                                    <DropdownMenuItem asChild><Link href="#">Penjualan Harian</Link></DropdownMenuItem>
                                    <DropdownMenuItem asChild><Link href="#">Penjualan Mingguan</Link></DropdownMenuItem>
                                    <DropdownMenuItem asChild><Link href="#">Penjualan per Item Barang</Link></DropdownMenuItem>
                                    <DropdownMenuItem asChild><Link href="#">Penjualan per Cara Bayar</Link></DropdownMenuItem>
                                    <DropdownMenuItem asChild><Link href="#">Penjualan dgn Kartu Debet/Kredit</Link></DropdownMenuItem>
                                    <DropdownMenuItem asChild><Link href="#">Daftar Penjualan Per Pelanggan</Link></DropdownMenuItem>
                                    <DropdownMenuItem asChild><Link href="#">Daftar Penjualan Per Salesman</Link></DropdownMenuItem>
                                    <DropdownMenuItem asChild><Link href="#">Daftar Penjualan Total Harian</Link></DropdownMenuItem>
                                    <DropdownMenuItem asChild><Link href="/penjualan/laporan-retur">Daftar Retur Penjualan</Link></DropdownMenuItem>
                                    <DropdownMenuItem asChild><Link href="#">Piutang</Link></DropdownMenuItem>
                                    <DropdownMenuItem asChild><Link href="#">Komisi per Salesman</Link></DropdownMenuItem>
                                    <DropdownMenuItem asChild><Link href="#">Setoran Kasir</Link></DropdownMenuItem>
                                    <DropdownMenuItem asChild><Link href="#">Rekap Setoran Kasir</Link></DropdownMenuItem>
                                    <DropdownMenuItem asChild><Link href="#">Daftar Penukaran Poin</Link></DropdownMenuItem>
                                    <DropdownMenuItem asChild><Link href="#">Daftar Penukaran Voucher</Link></DropdownMenuItem>
                                  </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                              </DropdownMenuSub>
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>Transaksi Pembelian</DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                  <DropdownMenuSubContent>
                                    <DropdownMenuItem asChild><Link href="/pembelian/daftar">Laporan Pembelian</Link></DropdownMenuItem>
                                    <DropdownMenuItem asChild><Link href="#">Laporan per Pemasok</Link></DropdownMenuItem>
                                  </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                              </DropdownMenuSub>
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>Stok (Inventori)</DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                  <DropdownMenuSubContent>
                                    <DropdownMenuItem asChild><Link href="/master-data">Daftar Barang</Link></DropdownMenuItem>
                                    <DropdownMenuItem asChild><Link href="#">Daftar Barang Per Pemasok</Link></DropdownMenuItem>
                                    <DropdownMenuItem asChild><Link href="#">Daftar Barang di Atas Stok Maksimum</Link></DropdownMenuItem>
                                    <DropdownMenuItem asChild><Link href="#">Daftar Barang di Bawah Stok Minimum</Link></DropdownMenuItem>
                                    <DropdownMenuItem asChild><Link href="#">Daftar Barang Nol</Link></DropdownMenuItem>
                                    <DropdownMenuItem asChild><Link href="#">Daftar Barang Terlaris</Link></DropdownMenuItem>
                                    <DropdownMenuItem asChild><Link href="#">Daftar Barang tak Bergerak</Link></DropdownMenuItem>
                                    <DropdownMenuItem asChild><Link href="#">Histori Transaksi Barang</Link></DropdownMenuItem>
                                    <DropdownMenuItem asChild><Link href="#">Nilai Persediaan</Link></DropdownMenuItem>
                                    <DropdownMenuItem asChild><Link href="/laporan/stok/penyesuaian-stok">Daftar Penyesuaian Stok</Link></DropdownMenuItem>
                                    <DropdownMenuItem asChild><Link href="#">Daftar Penyesuaian Stok Total</Link></DropdownMenuItem>
                                    <DropdownMenuItem asChild><Link href="#">Mutasi Cabang</Link></DropdownMenuItem>
                                    <DropdownMenuItem asChild><Link href="/master-data/katalog">Katalog Barang</Link></DropdownMenuItem>
                                  </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                              </DropdownMenuSub>
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>Laba / Rugi Penjualan</DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                  <DropdownMenuSubContent>
                                    <DropdownMenuItem asChild><Link href="#">Laporan Laba per Item</Link></DropdownMenuItem>
                                    <DropdownMenuItem asChild><Link href="#">Laporan Laba Kotor</Link></DropdownMenuItem>
                                  </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                              </DropdownMenuSub>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )
                      }
                      if (item.label === 'Pengaturan') {
                        return (
                          <DropdownMenu key={item.label}>
                            <DropdownMenuTrigger asChild>
                              <button className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors focus:outline-none">
                                <span>{item.label}</span>
                                <ChevronDown className="h-3 w-3" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              <DropdownMenuItem asChild>
                                <Link href="/pengaturan/admin-user">Administrasi User</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href="/pengaturan">Pengaturan Program</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href="/pengaturan/utility-administrator">Utility Administrator</Link>
                              </DropdownMenuItem>
                               <DropdownMenuItem asChild>
                                <Link href="#">User Log</Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )
                      }
                      return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            {item.label}
                        </Link>
                      )
                   })}
              </nav>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className={cn("w-2.5 h-2.5 rounded-full", isOnline ? 'bg-green-500' : 'bg-gray-400 animate-pulse')} />
                  <span>{isOnline ? 'Online' : 'Offline'}</span>
                  <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-auto px-2 py-0.5" 
                      disabled={!isOnline}
                      onClick={handleSync}
                  >
                      Sinkronkan Sekarang
                  </Button>
              </div>
          </div>
  
          {/* Main button menu */}
          <div className="flex h-20 items-center gap-4 px-4 md:px-6">
            <nav className="flex flex-wrap items-center gap-3">
              {PRIMARY_NAV_ITEMS.map((item: NavItem) => {
                let buttonClass = '';
                const isLogOffButton = item.label === 'Log Off';
  
                if (isLogOffButton) {
                    buttonClass = 'bg-gradient-to-b from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 border-red-700 text-white';
                } else if (item.label === 'Daftar Barang') {
                    buttonClass = 'bg-gradient-to-b from-yellow-300 to-yellow-500 hover:from-yellow-400 hover:to-yellow-600 border-yellow-600 text-gray-800';
                } else {
                    buttonClass = cn({
                        'bg-gradient-to-b from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 border-green-800 text-white': settings.warnaKasir === 'hijau',
                        'bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 border-blue-800 text-white': settings.warnaKasir === 'biru',
                        'bg-gradient-to-b from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 border-red-800 text-white': settings.warnaKasir === 'merah',
                    });
                }
  
                const buttonProps = {
                  className: cn(
                    "inline-flex items-center justify-center rounded-lg px-6 py-2 text-lg font-bold transition-all border-2 shadow-sm hover:shadow-md",
                    buttonClass
                  ),
                  ...(isLogOffButton ? { onClick: handleLogOffClick } : { href: item.href }),
                };
                
                const { key, ...restOfProps } = buttonProps;
  
                return isLogOffButton ? (
                   <button key={item.label} {...restOfProps}>{item.label}</button>
                ) : (
                  <Link href={item.href} key={item.label} {...restOfProps}>
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>
        </header>
        <main className="flex-1 p-4 pb-14">
            {children}
        </main>
        <footer className={cn(
          "fixed bottom-0 left-0 right-0 z-40 h-10 flex items-center overflow-hidden text-white",
          {
            "bg-green-700": settings.warnaKasir === 'hijau',
            "bg-blue-700": settings.warnaKasir === 'biru',
            "bg-red-700": settings.warnaKasir === 'merah',
          },
          !['hijau', 'biru', 'merah'].includes(settings.warnaKasir) && 'bg-primary'
        )}>
          <div className="flex animate-marquee whitespace-nowrap">
            <span className="mx-8 text-sm font-medium">SELAMAT DATANG DI {settings.namaPerusahaan.toUpperCase()} - SOLUSI KASIR MODERN ANDA</span>
            <span className="mx-8 text-sm font-medium">PROMO SPESIAL: Diskon 10% untuk semua produk kopi!</span>
            <span className="mx-8 text-sm font-medium">JAM OPERASIONAL: 08:00 - 22:00 SETIAP HARI</span>
            <span className="mx-8 text-sm font-medium" aria-hidden="true">SELAMAT DATANG DI {settings.namaPerusahaan.toUpperCase()} - SOLUSI KASIR MODERN ANDA</span>
            <span className="mx-8 text-sm font-medium" aria-hidden="true">PROMO SPESIAL: Diskon 10% untuk semua produk kopi!</span>
            <span className="mx-8 text-sm font-medium" aria-hidden="true">JAM OPERASIONAL: 08:00 - 22:00 SETIAP HARI</span>
          </div>
        </footer>
      </div>
      <LogOffModal
        isOpen={isLogOffModalOpen}
        onClose={() => setIsLogOffModalOpen(false)}
        onConfirm={handleConfirmLogOff}
        sales={allSales}
      />
    </>
  )
}
