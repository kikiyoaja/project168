'use client'

import * as React from "react"
import Link from "next/link"
import { format } from "date-fns"
import { id as idLocale } from 'date-fns/locale'
import type { Product, Sale, MultiUnit, Member, Supplier, ProductGroup, PoinSettings, SuspendedTransaction } from "../lib/types"
import { useRouter } from "next/navigation"

import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog"
import { ScrollArea } from "../components/ui/scroll-area"
import { useToast } from "../hooks/use-toast"
import { Search, UserCircle, Gift, Star, DollarSign, LogOut, Archive, ArchiveRestore, Calculator, Printer, Undo2, CalendarIcon, X, ChevronRight, AlertTriangle } from "lucide-react"
import PaymentModal, { type PaymentMethod } from "../components/cashier/payment-modal"
import RecallModal from "../components/cashier/recall-modal"
import ReprintModal from "../components/cashier/reprint-modal"
import RedeemPointsModal from "../components/cashier/redeem-points-modal"
import { cn } from "../lib/utils"
import ProductSearchModal from "../components/cashier/product-search-modal"
import { getAppSettings, getDatabase, saveDatabase } from "../lib/local-db"
import { Checkbox } from "../components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover"
import { Calendar } from "../components/ui/calendar"
import { Textarea } from "../components/ui/textarea"
import { Card, CardContent } from "../components/ui/card"
import { Alert, AlertDescription as AlertDescUi, AlertTitle as AlertTitleUi } from "../components/ui/alert"
import CalculatorModal from "../components/cashier/calculator-modal"


type CartItem = Product & {
  quantity: number
  discountAmount: number
  selectedUnit: MultiUnit
  pointsRedeemed?: number
}

interface MemberRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onSaveMember: (member: Member) => void;
  onSelectMember: (member: Member) => void;
}

function MemberRegistrationModal({ isOpen, onClose, members, onSaveMember, onSelectMember }: MemberRegistrationModalProps) {
  const { toast } = useToast()
  const [formData, setFormData] = React.useState<Partial<Member>>({});

  React.useEffect(() => {
    if (isOpen) {
      const newId = `C${(members.length + 1).toString().padStart(4, '0')}`;
      setFormData({
        id: newId,
        name: '',
        phone: '',
        points: 0,
        isActive: true,
        registrationDate: new Date(),
        expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        address: '',
        city: '',
        level: 'Level 1',
        creditLimit: 0,
        deposit: 0,
        npwp: '',
      });
    }
  }, [isOpen, members.length]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  const handleNumericInputChange = (id: keyof Member, value: string) => {
    setFormData(prev => ({ ...prev, [id]: Number(value) || 0 }));
  };

  const handleCheckboxChange = (id: keyof Member, checked: boolean) => {
    setFormData(prev => ({ ...prev, [id]: checked }));
  };
  
  const handleDateChange = (id: keyof Member, date: Date | undefined) => {
    if (date) setFormData(prev => ({ ...prev, [id]: date }));
  };

  const handleSave = () => {
    if (!formData.name || !formData.phone) {
      toast({ variant: 'destructive', title: 'Data tidak lengkap', description: 'Nama dan No. HP wajib diisi.' });
      return;
    }

    const memberToSave: Member = {
        id: formData.id || `C${(members.length + 1).toString().padStart(4, '0')}`,
        name: formData.name,
        phone: formData.phone,
        points: formData.points || 0,
        isActive: formData.isActive !== false,
        registrationDate: (formData.registrationDate || new Date()).toISOString(),
        expiryDate: (formData.expiryDate || new Date()).toISOString(),
        address: formData.address || '',
        city: formData.city || '',
        level: formData.level || 'Level 1',
        creditLimit: formData.creditLimit || 0,
        npwp: formData.npwp || '',
        deposit: formData.deposit || 0,
    };
    
    onSaveMember(memberToSave);
    onSelectMember(memberToSave); // Automatically select the new member for the current transaction
    onClose(); // Close the modal after saving
  };
  
  const handleNew = () => {
    const newId = `C${(members.length + 1).toString().padStart(4, '0')}`;
    setFormData({
      id: newId,
      name: '',
      phone: '',
      points: 0,
      isActive: true,
      registrationDate: new Date(),
      expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      address: '',
      city: '',
      level: 'Level 1',
      creditLimit: 0,
      deposit: 0,
      npwp: '',
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <>
            <DialogHeader className="bg-gray-100 p-4 rounded-t-lg">
              <DialogTitle>Registrasi Pelanggan Baru</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
              <Card>
                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-x-6 gap-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="id" className="w-[100px]">Kode * [Auto]</Label>
                      <Input id="id" value={formData.id} readOnly className="bg-green-100 flex-1" />
                       <div className="flex items-center gap-2 ml-auto">
                        <Checkbox id="isActive" checked={formData.isActive} onCheckedChange={(c) => handleCheckboxChange('isActive', !!c)} />
                        <Label htmlFor="isActive">Aktif</Label>
                    </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="barcode" className="w-[100px]">Barcode</Label>
                      <Input id="barcode" value={formData.barcode || ''} onChange={handleInputChange} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="name" className="w-[100px]">Nama *</Label>
                      <Input id="name" value={formData.name || ''} onChange={handleInputChange} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="address" className="w-[100px]">Alamat</Label>
                      <Input id="address" value={formData.address || ''} onChange={handleInputChange} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="city" className="w-[100px]">Kota</Label>
                      <Input id="city" value={formData.city || ''} onChange={handleInputChange} />
                    </div>
                     <div className="flex items-center gap-2">
                      <Label htmlFor="phone" className="w-[100px]">No. HP *</Label>
                      <Input id="phone" value={formData.phone || ''} onChange={handleInputChange} />
                    </div>
                     <div className="flex items-center gap-2">
                      <Label htmlFor="npwp" className="w-[100px]">NPWP</Label>
                      <Input id="npwp" value={formData.npwp || ''} onChange={handleInputChange} />
                    </div>
                     <div className="flex items-center gap-2">
                      <Label htmlFor="registrationDate" className="w-[100px]">Tgl. Daftar</Label>
                      <Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !formData.registrationDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{formData.registrationDate ? format(new Date(formData.registrationDate), "dd/MM/yyyy", { locale: idLocale }) : <span>Pilih tanggal</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.registrationDate ? new Date(formData.registrationDate) : new Date()} onSelect={(d) => handleDateChange('registrationDate', d)} initialFocus /></PopoverContent></Popover>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="deposit" className="w-[100px]">Deposit</Label>
                      <Input id="deposit" type="number" value={formData.deposit || '0'} onChange={(e) => handleNumericInputChange('deposit', e.target.value)} className="text-right bg-red-100" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="creditLimit" className="w-[100px]">Batas Kredit</Label>
                      <Input id="creditLimit" type="number" value={formData.creditLimit || '0'} onChange={(e) => handleNumericInputChange('creditLimit', e.target.value)} className="text-right" />
                    </div>
                     <div className="flex items-center gap-2">
                      <Label htmlFor="level" className="w-[100px]">Level</Label>
                      <Select value={formData.level} onValueChange={(v) => setFormData(p => ({...p, level: v}))}>
                          <SelectTrigger><SelectValue/></SelectTrigger>
                          <SelectContent>
                              <SelectItem value="Level 1">Level 1</SelectItem>
                              <SelectItem value="Level 2">Level 2</SelectItem>
                              <SelectItem value="Grosir">Grosir</SelectItem>
                          </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="points" className="w-[100px]">Poin</Label>
                      <Input id="points" type="number" value={formData.points || '0'} onChange={(e) => handleNumericInputChange('points', e.target.value)} className="text-right" />
                    </div>
                     <div className="flex items-center gap-2">
                      <Label htmlFor="expiryDate" className="w-[100px]">Expired</Label>
                      <Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !formData.expiryDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{formData.expiryDate ? format(new Date(formData.expiryDate), "dd/MM/yyyy", { locale: idLocale }) : <span>Pilih tanggal</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.expiryDate ? new Date(formData.expiryDate) : new Date()} onSelect={(d) => handleDateChange('expiryDate', d)} initialFocus /></PopoverContent></Popover>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {/* Placeholder for image */}
                     <div className="w-full h-40 bg-muted rounded-md flex items-center justify-center">
                       <p className="text-muted-foreground">Gambar</p>
                     </div>
                     <div className="flex gap-2">
                       <Button variant="outline" className="w-full">Cari Gambar</Button>
                       <Button variant="outline" size="icon"><X className="h-4 w-4"/></Button>
                     </div>
                     <Button className="w-full bg-green-600 hover:bg-green-700">Non PKP</Button>
                  </div>
                </CardContent>
              </Card>
              <p className="text-xs text-muted-foreground pl-4">*) Item yang tidak boleh kosong</p>
            </div>
            <DialogFooter>
              <Button onClick={handleNew}>Baru</Button>
              <Button onClick={handleSave}>Simpan</Button>
              <Button variant="outline" onClick={onClose}>Keluar</Button>
            </DialogFooter>
          </>
      </DialogContent>
    </Dialog>
  );
}

const VISIBLE_ROWS = 19

export default function CashierPage() {
  const router = useRouter()
  const [products, setProducts] = React.useState<Product[]>([])
  const [allSales, setAllSales] = React.useState<Sale[]>([]);
  const [members, setMembers] = React.useState<Member[]>([]);
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
  const [productGroups, setProductGroups] = React.useState<ProductGroup[]>([]);
  const [cart, setCart] = React.useState<CartItem[]>([])
  const [suspendedTransactions, setSuspendedTransactions] = React.useState<SuspendedTransaction[]>([])
  const [inlineSearchTerm, setInlineSearchTerm] = React.useState("")
  const [currentDate, setCurrentDate] = React.useState<Date | null>(null)
  const [isPaymentModalOpen, setPaymentModalOpen] = React.useState(false)
  const [isRecallModalOpen, setRecallModalOpen] = React.useState(false)
  const [isMemberModalOpen, setMemberModalOpen] = React.useState(false);
  const [isRedeemModalOpen, setRedeemModalOpen] = React.useState(false);
  const [isProductSearchModalOpen, setProductSearchModalOpen] = React.useState(false);
  const [isReprintModalOpen, setReprintModalOpen] = React.useState(false);
  const [isCalculatorOpen, setCalculatorOpen] = React.useState(false);
  const [selectedMember, setSelectedMember] = React.useState<Member | null>(null);
  const [selectedRow, setSelectedRow] = React.useState<number | null>(null);
  const [selectedCol, setSelectedCol] = React.useState<'quantity' | 'discountAmount' | null>(null);
  const [poinSettings, setPoinSettings] = React.useState<PoinSettings>({
    enabled: true,
    rpToPoint: 10000,
    pointToRp: 1,
  });
  
  const inlineSearchInputRef = React.useRef<HTMLInputElement>(null)
  const quantityInputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  const discountInputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  const { toast } = useToast()

  const [settings, setSettings] = React.useState({
    namaPerusahaan: 'HIJRAH CELL',
    alamat: 'Jl. Bambang Utoyo Kel. Pasar III',
    kota: 'Muara Enim',
    provinsi: 'Sumatera Selatan',
    noTelp: '082144108244',
    warnaKasir: 'hijau',
    poinSettings: {
        enabled: true,
        rpToPoint: 10000,
        pointToRp: 1,
    }
  });

  const grandTotal = React.useMemo(() => {
    return cart.reduce((sum, item) => {
      const itemPrice = item.id === 'DISCOUNT-POINTS' ? item.price : item.selectedUnit.price;
      const itemTotal = itemPrice * item.quantity
      return sum + (itemTotal - item.discountAmount)
    }, 0)
  }, [cart])

  React.useEffect(() => {
    const loadData = async () => {
        const appSettings = await getAppSettings();
        if (appSettings) {
            setSettings(prev => ({...prev, ...appSettings}));
            if (appSettings.poinSettings) {
                setPoinSettings(appSettings.poinSettings);
            }
        }
        
        const db = await getDatabase();
        setProducts(db.products);
        setAllSales(db.sales);
        setMembers(db.members);
        setSuppliers(db.suppliers);
        setProductGroups(db.productGroups);
        setSuspendedTransactions(db.suspendedTransactions);
    }
    
    loadData();

    setCurrentDate(new Date());

    const timer = setInterval(() => setCurrentDate(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // Effect for focus management
  React.useEffect(() => {
    if (cart.length === 0) {
      inlineSearchInputRef.current?.focus()
    }
  }, [cart.length])

  // Effect to select search row after item is added
  React.useEffect(() => {
    if (cart.length > 0) {
      setSelectedRow(cart.length)
    }
  }, [cart.length])

  const handleAddToCart = (product: Product, quantityToAdd: number = 1, unitToAdd?: MultiUnit) => {
    if (grandTotal <= 0 && cart.some(item => item.id === 'DISCOUNT-POINTS')) {
      toast({
        variant: "destructive",
        title: "Total Belanja Nol atau Minus",
        description: "Tidak dapat menambah item karena total sudah lunas dengan poin.",
      })
      return;
    }

    const productUnits = product.units && product.units.length > 0
      ? product.units
      : [{ name: 'PCS', quantity: 1, price: product.price, barcode: product.id }];
    
    const productWithUnits = { ...product, units: productUnits };

    const selectedUnit = unitToAdd || productWithUnits.units.find(u => u.quantity === 1) || productWithUnits.units[0];

    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) => item.id === product.id && item.selectedUnit.name === selectedUnit.name
      );

      if (existingItemIndex !== -1) {
        const updatedCart = [...prevCart];
        const currentItem = updatedCart[existingItemIndex];
        updatedCart[existingItemIndex] = {
          ...currentItem,
          quantity: currentItem.quantity + quantityToAdd,
        };
        return updatedCart;
      } else {
        if (prevCart.length >= VISIBLE_ROWS) {
          toast({
            variant: "destructive",
            title: "Keranjang Penuh",
            description: `Maksimal ${VISIBLE_ROWS} item dalam satu transaksi.`,
          })
          return prevCart;
        }
        return [...prevCart, { 
          ...productWithUnits, 
          quantity: quantityToAdd, 
          discountAmount: 0,
          selectedUnit: selectedUnit
        }]
      }
    })
  }

  const handleInlineSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inlineSearchTerm.trim() !== '') {
      e.preventDefault();

      if (grandTotal <= 0 && cart.some(item => item.id === 'DISCOUNT-POINTS')) {
        toast({
          variant: "destructive",
          title: "Total Belanja Nol atau Minus",
          description: "Tidak dapat menambah item karena total sudah lunas dengan poin.",
        })
        return;
      }

      const searchTerm = inlineSearchTerm.trim();
      let quantity = 1;
      let productIdentifier = searchTerm;

      if (searchTerm.includes('*')) {
        const parts = searchTerm.split('*');
        const quantityString = parts[0].trim().replace(',', '.');
        const potentialQty = parseFloat(quantityString);
        
        if (!isNaN(potentialQty) && potentialQty > 0) {
          quantity = potentialQty;
          productIdentifier = parts.slice(1).join('*').trim();
        }
      }

      if (!productIdentifier) {
        return;
      }
      
      const lowercasedIdentifier = productIdentifier.toLowerCase();
      
      let foundProduct: Product | undefined;
      let matchedUnit: MultiUnit | undefined;

      for (const p of products) {
        if (p.units && Array.isArray(p.units)) {
            if (p.id.toLowerCase() === lowercasedIdentifier) {
                foundProduct = p;
                matchedUnit = p.units.find(u => u.quantity === 1) || p.units[0];
                break;
            }
            const unit = p.units.find(u => u.barcode && u.barcode.toLowerCase() === lowercasedIdentifier);
            if (unit) {
                foundProduct = p;
                matchedUnit = unit;
                break;
            }
        } else {
            if (p.id.toLowerCase() === lowercasedIdentifier) {
                foundProduct = p;
                matchedUnit = { name: 'PCS', quantity: 1, price: p.price, barcode: p.id };
                break;
            }
        }
      }

      if (!foundProduct) {
        const filtered = products.filter(p => p.name.toLowerCase().includes(lowercasedIdentifier));
        if (filtered.length > 0) {
            foundProduct = filtered[0];
            matchedUnit = foundProduct.units?.find(u => u.quantity === 1) || foundProduct.units?.[0];
        }
      }

      if (foundProduct) {
        handleAddToCart(foundProduct, quantity, matchedUnit);
        setInlineSearchTerm('');
      } else {
        toast({
            variant: "destructive",
            title: "Produk Tidak Ditemukan",
            description: `Tidak ada produk dengan kode, barcode, atau nama '${productIdentifier}'.`,
        });
      }
    }
  };


  const handleUpdateCartItem = (productId: string, field: 'quantity' | 'discountAmount', value: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, [field]: value >= 0 ? value : 0 } : item
      )
    )
  }

  const handleUnitChange = (productId: string, unitName: string) => {
    setCart(prevCart =>
      prevCart.map(item => {
        if (item.id === productId) {
          const newUnit = item.units.find(u => u.name === unitName);
          if (newUnit) {
            return { ...item, selectedUnit: newUnit };
          }
        }
        return item;
      })
    );
  };

  const resetTransactionState = () => {
    setCart([]);
    setInlineSearchTerm("");
    setSelectedMember(null);
  };

  const handleResetTransaction = React.useCallback(() => {
    if (cart.length > 0 || selectedMember) {
      resetTransactionState();
      toast({
        title: "Transaksi Dibatalkan",
        description: "Keranjang belanja dan member telah direset.",
      });
    }
  }, [cart.length, selectedMember, toast]);

  const handleSuspendTransaction = React.useCallback(async () => {
    if (cart.length === 0) {
      toast({
        variant: "destructive",
        title: "Keranjang Kosong",
        description: "Tidak ada transaksi untuk ditunda.",
      });
      return;
    }
    
    const db = await getDatabase();
    const newSuspendedTransactions = [...db.suspendedTransactions, { cart, member: selectedMember }];
    await saveDatabase({ ...db, suspendedTransactions: newSuspendedTransactions });
    
    setSuspendedTransactions(newSuspendedTransactions);
    toast({
        title: "Transaksi Ditunda",
        description: `Transaksi telah disimpan. Ada ${newSuspendedTransactions.length} transaksi yang ditunda.`,
    });
    resetTransactionState();
  }, [cart, toast, selectedMember]);

  const handleOpenRecallModal = React.useCallback(() => {
    if (cart.length > 0) {
      toast({
        variant: "destructive",
        title: "Keranjang Tidak Kosong",
        description: "Selesaikan atau batalkan transaksi saat ini sebelum memanggil transaksi yang ditunda.",
      });
      return;
    }

    if (suspendedTransactions.length === 0) {
      toast({
        title: "Tidak Ada Transaksi Ditunda",
        description: "Tidak ada transaksi yang dapat dipanggil kembali.",
      });
      return;
    }

    setRecallModalOpen(true);
  }, [cart.length, suspendedTransactions.length, toast]);

  const handleSelectSuspendedTransaction = async (transactionIndex: number) => {
    const selectedTx = suspendedTransactions[transactionIndex];
    
    const newSuspended = suspendedTransactions.filter((_, index) => index !== transactionIndex);
    
    const db = await getDatabase();
    await saveDatabase({ ...db, suspendedTransactions: newSuspended });
    
    setCart(selectedTx.cart);
    setSelectedMember(selectedTx.member);
    setSuspendedTransactions(newSuspended);
    
    setRecallModalOpen(false);
    
    toast({
      title: "Transaksi Dipanggil",
      description: `Transaksi #${transactionIndex + 1} telah dimuat. Sisa: ${newSuspended.length}.`,
    });
  };

  const handleMemberSelect = (member: Member) => {
    setSelectedMember(member);
    toast({
        title: "Member Dipilih",
        description: `${member.name} telah dilampirkan ke transaksi.`,
    });
  };

  const handleSaveMember = async (member: Member) => {
    const db = await getDatabase();
    const existingMemberIndex = db.members.findIndex(m => m.id === member.id);
    let updatedMembers;

    if (existingMemberIndex > -1) {
      updatedMembers = db.members.map(m => m.id === member.id ? member : m);
      toast({ title: "Member Diperbarui", description: `Data untuk ${member.name} telah disimpan.` });
    } else {
      updatedMembers = [...db.members, member];
      toast({ title: "Member Baru Disimpan", description: `${member.name} telah ditambahkan.` });
    }

    await saveDatabase({ ...db, members: updatedMembers });
    setMembers(updatedMembers);
  };
  
  const handleDeleteMember = async (memberId: string) => {
    // This is a placeholder for a confirmation dialog
    if (window.confirm("Apakah Anda yakin ingin menghapus member ini?")) {
        const db = await getDatabase();
        const updatedMembers = db.members.filter(m => m.id !== memberId);
        await saveDatabase({ ...db, members: updatedMembers });
        setMembers(updatedMembers);
        toast({ title: "Member Dihapus" });
    }
  };


  const handleOpenRedeemModal = () => {
    if (!selectedMember) {
      toast({
        variant: 'destructive',
        title: 'Member Belum Dipilih',
        description: 'Silakan pilih member terlebih dahulu.',
      });
      return;
    }
    if (cart.length === 0 || grandTotal <= 0) {
       toast({
        variant: 'destructive',
        title: 'Keranjang Kosong atau Lunas',
        description: 'Tidak ada item untuk diberi diskon.',
      });
      return;
    }
    setRedeemModalOpen(true);
  };

  const handleConfirmRedemption = (pointsToRedeem: number) => {
    const discountAmount = pointsToRedeem * (poinSettings?.pointToRp || 1);
    setCart(prevCart => {
      const cartWithoutRedemption = prevCart.filter(item => item.id !== 'DISCOUNT-POINTS');
      const redemptionItem: CartItem = {
        id: 'DISCOUNT-POINTS',
        name: `Tukar Poin (${pointsToRedeem} Poin)`,
        price: -discountAmount,
        quantity: 1,
        discountAmount: 0,
        category: 'Diskon',
        stock: Infinity,
        imageUrl: '',
        aiHint: 'discount',
        selectedUnit: { name: 'VOUCHER', quantity: 1, price: -discountAmount, barcode: '' },
        units: [{ name: 'VOUCHER', quantity: 1, price: -discountAmount, barcode: '' }],
        groupId: '',
        supplierId: '',
        pointsRedeemed: pointsToRedeem,
      };
      return [...cartWithoutRedemption, redemptionItem];
    });

    toast({
      title: 'Poin Diterapkan',
      description: `Diskon sebesar Rp${discountAmount.toLocaleString('id-ID')} telah ditambahkan.`,
    });
  };
  
  const printReceipt = (details: { cart: CartItem[]; grandTotal: number; amountPaid: number; change: number, paymentMethod: PaymentMethod, invoiceId: string, member: Member | null, paymentDetail?: string }) => {
    const { cart, grandTotal, amountPaid, change, paymentMethod, paymentDetail, invoiceId, member } = details
    const now = new Date();

    const paymentMethodText = {
      cash: 'Tunai',
      ewallet: `E-Wallet (${paymentDetail || ''})`.trim(),
      bank: `Kartu Bank (${paymentDetail || ''})`.trim(),
      qris: 'QRIS',
    }[paymentMethod];

    const formatCurrency = (value: number) => value.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

    let subtotal = 0;
    const itemsHtml = cart.map(item => {
      if (item.id === 'DISCOUNT-POINTS') return '' // Handled separately
      
      const itemTotal = item.quantity * item.selectedUnit.price;
      subtotal += itemTotal;

      let itemHtml = `
      <tr>
        <td colspan="4">${item.name}</td>
      </tr>
      <tr>
        <td>${item.quantity} ${item.selectedUnit.name} x ${formatCurrency(item.selectedUnit.price)}</td>
        <td></td>
        <td></td>
        <td class="text-right">${formatCurrency(itemTotal)}</td>
      </tr>`

      if (item.discountAmount > 0) {
        itemHtml += `
        <tr>
          <td colspan="3" style="padding-left: 10px;">Diskon Item</td>
          <td class="text-right">-${formatCurrency(item.discountAmount)}</td>
        </tr>`
      }
      return itemHtml
    }).join('')

    const redemptionItem = cart.find(item => item.id === 'DISCOUNT-POINTS')
    const pointDiscountHtml = redemptionItem ? `
      <tr>
        <td>Diskon Poin</td>
        <td colspan="3" class="text-right">-${formatCurrency(-redemptionItem.price)}</td>
      </tr>
    ` : ''

    const receiptContent = `
      <html>
        <head>
          <title>Struk Pembayaran - ${invoiceId}</title>
          <style>
            @media print {
              body { -webkit-print-color-adjust: exact; }
            }
            body { 
              font-family: 'monospace', monospace;
              width: 280px; 
              font-size: 12px;
              line-height: 1.4;
            }
            .header { text-align: center; margin-bottom: 10px; }
            .header h1 { margin: 0; font-size: 16px; }
            .header p { margin: 0; }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 1px 0; vertical-align: top; }
            .text-right { text-align: right; }
            .divider { border-top: 1px dashed black; margin: 5px 0; }
            .footer { text-align: center; margin-top: 10px; font-size: 11px;}
          </style>
        </head>
        <body onload="window.print(); setTimeout(window.close, 0);">
          <div class="header">
            <h1>${settings.namaPerusahaan.toUpperCase()}</h1>
            <p>${settings.alamat}</p>
            <p>${settings.kota}, ${settings.provinsi}</p>
            <p>Telp: ${settings.noTelp}</p>
          </div>
          <div class="divider"></div>
          <div>
            <span>No: ${invoiceId}</span><br/>
            <span>Tgl: ${format(now, 'dd/MM/yyyy HH:mm')}</span><br/>
            <span>Kasir: Admin</span><br/>
            <span>Pelanggan: ${member?.name || 'Umum'}</span>
          </div>
          <div class="divider"></div>
          <table>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div class="divider"></div>
          <table>
            <tbody>
              <tr><td>Subtotal</td><td class="text-right">Rp ${formatCurrency(subtotal)}</td></tr>
              ${pointDiscountHtml}
              <tr><td>Total</td><td class="text-right">Rp ${formatCurrency(grandTotal)}</td></tr>
              <tr><td>${paymentMethodText}</td><td class="text-right">Rp ${formatCurrency(amountPaid)}</td></tr>
              <tr><td>Kembali</td><td class="text-right">Rp ${formatCurrency(change)}</td></tr>
            </tbody>
          </table>
          <div class="divider"></div>
          <div class="footer">
            <p>Terima Kasih</p>
            <p>Telah Berbelanja</p>
          </div>
        </body>
      </html>
    `

    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(receiptContent);
        printWindow.document.close();
        printWindow.focus();
    }
  }
  
  const printHistoricalReceipt = (sale: Sale) => {
    const now = new Date(sale.date);
    const formatCurrency = (value: number) => value.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

    let subtotal = 0;
    const itemsHtml = sale.items.map(item => {
      if (item.productId === 'DISCOUNT-POINTS') return '';
      
      const itemTotal = item.quantity * item.price;
      subtotal += itemTotal;

      let itemHtml = `
      <tr>
        <td colspan="4">${item.productName}</td>
      </tr>
      <tr>
        <td>${item.quantity} ${item.unitName} x ${formatCurrency(item.price)}</td>
        <td></td>
        <td></td>
        <td class="text-right">${formatCurrency(itemTotal)}</td>
      </tr>`;

      if (item.discountAmount > 0) {
        itemHtml += `
        <tr>
          <td colspan="3" style="padding-left: 10px;">Diskon Item</td>
          <td class="text-right">-${formatCurrency(item.discountAmount)}</td>
        </tr>`;
      }
      return itemHtml;
    }).join('');

    const redemptionItem = sale.items.find(item => item.productId === 'DISCOUNT-POINTS');
    const pointDiscountHtml = redemptionItem ? `
      <tr>
        <td>Diskon Poin</td>
        <td colspan="3" class="text-right">-${formatCurrency(-redemptionItem.price)}</td>
      </tr>
    ` : '';

    const receiptContent = `
      <html>
        <head>
          <title>Struk Pembayaran - ${sale.invoiceId}</title>
          <style>
            @media print {
              body { -webkit-print-color-adjust: exact; }
            }
            body { 
              font-family: 'monospace', monospace;
              width: 280px; 
              font-size: 12px;
              line-height: 1.4;
            }
            .header { text-align: center; margin-bottom: 10px; }
            .header h1 { margin: 0; font-size: 16px; }
            .header p { margin: 0; }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 1px 0; vertical-align: top; }
            .text-right { text-align: right; }
            .divider { border-top: 1px dashed black; margin: 5px 0; }
            .footer { text-align: center; margin-top: 10px; font-size: 11px;}
          </style>
        </head>
        <body onload="window.print(); setTimeout(window.close, 0);">
          <div class="header">
            <h1>${settings.namaPerusahaan.toUpperCase()}</h1>
            <p>${settings.alamat}</p>
            <p>${settings.kota}, ${settings.provinsi}</p>
            <p>Telp: ${settings.noTelp}</p>
          </div>
          <div class="divider"></div>
          <div>
            <span>No: ${sale.invoiceId}</span><br/>
            <span>Tgl: ${format(now, 'dd/MM/yyyy HH:mm')}</span><br/>
            <span>Kasir: ${sale.cashier}</span><br/>
            <span>Pelanggan: ${sale.customer}</span>
          </div>
          <div class="divider"></div>
          <table>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div class="divider"></div>
          <table>
            <tbody>
              <tr><td>Subtotal</td><td class="text-right">Rp ${formatCurrency(subtotal)}</td></tr>
              ${pointDiscountHtml}
              <tr><td>Total</td><td class="text-right">Rp ${formatCurrency(sale.total)}</td></tr>
            </tbody>
          </table>
          <div class="divider"></div>
          <div class="footer">
            <p>--- CETAK ULANG ---</p>
            <p>Terima Kasih</p>
            <p>Telah Berbelanja</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(receiptContent);
        printWindow.document.close();
        printWindow.focus();
    }
  };

  const handleConfirmPayment = async (paymentDetails: { amountPaid: number; change: number; paymentMethod: PaymentMethod; paymentDetail?: string }) => {
    const now = new Date();
    const invoiceId = `INV-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${now.getTime().toString().slice(-4)}`

    const db = await getDatabase();
    let updatedDb = { ...db };

    // Handle point deduction
    const redemptionItem = cart.find(item => item.id === 'DISCOUNT-POINTS');
    if (redemptionItem && selectedMember && redemptionItem.pointsRedeemed) {
      const pointsRedeemed = redemptionItem.pointsRedeemed;
      const updatedMembers = db.members.map(m =>
        m.id === selectedMember.id ? { ...m, points: m.points - pointsRedeemed } : m
      );
      updatedDb.members = updatedMembers;
      setMembers(updatedMembers);
      setSelectedMember(prev => prev ? { ...prev, points: prev.points - pointsRedeemed } : null);
    }

    printReceipt({
      cart,
      grandTotal,
      invoiceId,
      member: selectedMember,
      ...paymentDetails,
    });

    const updatedProducts = db.products.map(p => {
        const cartItem = cart.find(item => item.id === p.id);
        if (cartItem) {
            const stockToReduce = cartItem.quantity * cartItem.selectedUnit.quantity;
            const newStock = p.stock - stockToReduce;
            return { ...p, stock: newStock >= 0 ? newStock : 0 };
        }
        return p;
    });
    updatedDb.products = updatedProducts;
    setProducts(updatedProducts);
    
    const newSale: Sale = {
        invoiceId: invoiceId,
        date: now.toISOString(),
        customer: selectedMember?.name || 'Umum',
        cashier: 'Admin',
        total: grandTotal,
        status: 'Completed',
        items: cart.map(item => ({
            productId: item.id,
            productName: item.name,
            quantity: item.quantity,
            price: item.id === 'DISCOUNT-POINTS' ? item.price : item.selectedUnit.price,
            discountAmount: item.discountAmount,
            unitName: item.selectedUnit.name,
            unitQuantity: item.selectedUnit.quantity,
            pointsRedeemed: item.pointsRedeemed,
        })),
    };

    const updatedSales = [...db.sales, newSale].sort(
        (a: Sale, b: Sale) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    updatedDb.sales = updatedSales;
    setAllSales(updatedSales);
    
    await saveDatabase(updatedDb);

    setPaymentModalOpen(false);

    toast({
      title: "Transaksi Berhasil",
      description: `Total pembayaran: Rp${grandTotal.toLocaleString("id-ID")}`,
    });

    resetTransactionState();
  }

  const handleOpenPaymentModal = React.useCallback(() => {
    if (cart.length === 0) {
      toast({
        variant: "destructive",
        title: "Keranjang Kosong",
        description: "Tidak ada barang untuk dibayar.",
      });
      return;
    }
    if (grandTotal < 0) {
      toast({
        variant: "destructive",
        title: "Total Minus",
        description: "Total belanja tidak boleh minus. Harap sesuaikan penukaran poin.",
      });
      return;
    }
    if (grandTotal === 0) {
      handleConfirmPayment({ amountPaid: 0, change: 0, paymentMethod: 'cash' });
      return;
    }
    setPaymentModalOpen(true);
  }, [cart, grandTotal, toast, handleConfirmPayment]);

  const handleClosePaymentModal = () => {
    setPaymentModalOpen(false);
  }

  const handleReprintSale = (sale: Sale) => {
    printHistoricalReceipt(sale);
    setReprintModalOpen(false);
  };
  
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isPaymentModalOpen || isRecallModalOpen || isRedeemModalOpen || isProductSearchModalOpen || isReprintModalOpen || isMemberModalOpen || isCalculatorOpen) return;
      
      const functionKeys = ['F1', 'F3', 'F4', 'F5', 'F10', 'F12'];
      if (functionKeys.includes(event.key)) {
        event.preventDefault();
        switch (event.key) {
          case 'F1':
            setCalculatorOpen(true);
            break;
          case 'F3':
            handleSuspendTransaction();
            break;
          case 'F4':
            handleOpenRecallModal();
            break;
          case 'F5':
            handleResetTransaction();
            break;
          case 'F10':
            setProductSearchModalOpen(true);
            break;
          case 'F12':
            handleOpenPaymentModal();
            break;
        }
      }

      const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
      if (arrowKeys.includes(event.key)) {
        const activeEl = document.activeElement;
        if (activeEl && activeEl.tagName === 'INPUT' && (activeEl as HTMLInputElement).type === 'number' && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
            return;
        }
        event.preventDefault();

        if (event.key === 'ArrowDown') {
          setSelectedRow(prev => {
            if (prev === null) return 0;
            if (prev < cart.length) return prev + 1;
            return prev;
          });
        }
        if (event.key === 'ArrowUp') {
          setSelectedRow(prev => {
            if (prev === null || prev === 0) {
              return null;
            }
            return prev - 1;
          });
        }
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
           if (selectedRow !== null && selectedRow < cart.length) {
               setSelectedCol(prev => prev === 'quantity' ? 'discountAmount' : 'quantity');
           }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    isPaymentModalOpen, 
    isRecallModalOpen,
    isRedeemModalOpen,
    isProductSearchModalOpen,
    isReprintModalOpen,
    isMemberModalOpen,
    isCalculatorOpen,
    handleResetTransaction, 
    handleSuspendTransaction,
    handleOpenRecallModal,
    handleOpenPaymentModal, 
    cart.length, 
    selectedRow
  ]);

  React.useEffect(() => {
    if (selectedRow === null) {
        if (document.activeElement !== inlineSearchInputRef.current) {
            inlineSearchInputRef.current?.focus();
        }
        return;
    }
    
    if (selectedRow === cart.length) {
        inlineSearchInputRef.current?.focus();
        inlineSearchInputRef.current?.select();
        setSelectedCol(null);
        return;
    }

    const colToFocus = selectedCol || 'quantity';
    const refArray = colToFocus === 'quantity' ? quantityInputRefs.current : discountInputRefs.current;
    const inputToFocus = refArray[selectedRow];

    if (inputToFocus) {
        inputToFocus.focus();
        inputToFocus.select();
    }
  }, [selectedRow, selectedCol, cart.length]);

  const ActionButton = ({ icon, children, ...props }: { icon: React.ElementType, children: React.ReactNode } & React.ComponentProps<typeof Button>) => (
    <Button 
      className={cn(
        "w-full justify-start text-base py-6 text-white border-2 shadow-md",
        settings.warnaKasir === 'hijau' && 'bg-gradient-to-b from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 border-green-800',
        settings.warnaKasir === 'biru' && 'bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 border-blue-800',
        settings.warnaKasir === 'merah' && 'bg-gradient-to-b from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 border-red-800',
      )}
      {...props}
    >
      {React.createElement(icon, { className: "mr-3 h-6 w-6"})}
      <span className="truncate">{children}</span>
    </Button>
  )

  const FarLeftButton = ({ children, shortcut, onClick, ...props }: { children: React.ReactNode, shortcut?: string, onClick?: () => void } & Omit<React.ComponentProps<typeof Button>, 'onClick'>) => {
      const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
          if (props.disabled) return;
          onClick?.();
      };

      return (
          <Button
              className={cn(
                  "w-full justify-center text-sm py-2 text-white border-b-4 shadow-md relative h-12 font-semibold rounded-xl flex flex-col gap-0.5",
                  {
                      "bg-green-600 hover:bg-green-700 border-green-800": settings.warnaKasir === 'hijau',
                      "bg-blue-600 hover:bg-blue-700 border-blue-800": settings.warnaKasir === 'biru',
                      "bg-red-600 hover:bg-red-700 border-red-800": settings.warnaKasir === 'merah',
                  },
                  !['hijau', 'biru', 'merah'].includes(settings.warnaKasir) && 'bg-primary/90'
              )}
              onClick={handleClick}
              {...props}
          >
              <span className="truncate text-xs font-mono">{shortcut}</span>
              <span className="truncate font-sans">{children}</span>
          </Button>
      );
  };

  const FarLeftIconButton = ({ children, shortcut, icon: Icon, onClick, badge, ...props }: { children: React.ReactNode, shortcut?: string, icon: React.ElementType, onClick?: () => void, badge?: string | number | null } & Omit<React.ComponentProps<typeof Button>, 'onClick'>) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (props.disabled) return;
        onClick?.();
    };

    return (
        <Button
            className={cn(
                "w-full justify-center text-sm py-2 text-white border-b-4 shadow-md relative h-16 font-semibold rounded-xl flex flex-col items-center justify-center gap-1",
                 {
                    "bg-green-600 hover:bg-green-700 border-green-800": settings.warnaKasir === 'hijau',
                    "bg-blue-600 hover:bg-blue-700 border-blue-800": settings.warnaKasir === 'biru',
                    "bg-red-600 hover:bg-red-700 border-red-800": settings.warnaKasir === 'merah',
                  },
                  !['hijau', 'biru', 'merah'].includes(settings.warnaKasir) && 'bg-primary/90'
            )}
            onClick={handleClick}
            {...props}
        >
            <Icon className="h-5 w-5" />
            <span className="truncate text-xs">{children}</span>
            {shortcut && (
                <Badge variant="secondary" className="absolute -top-1 -left-1 text-[9px] h-4 w-4 flex items-center justify-center p-1.5 font-mono rounded-full ring-1 ring-white bg-gray-800 text-white">
                    {shortcut}
                </Badge>
            )}
             {badge && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 text-[10px] h-5 w-5 flex items-center justify-center p-2 font-mono rounded-full ring-2 ring-white">
                    {badge}
                </Badge>
            )}
        </Button>
    );
};

  return (
    <div className="flex h-screen w-screen bg-gray-200 text-sm">
      <aside className="w-24 flex-shrink-0 bg-gray-200 p-2 flex flex-col gap-2">
         <FarLeftIconButton shortcut="F1" icon={Calculator} onClick={() => setCalculatorOpen(true)}>Kalkulator</FarLeftIconButton>
         <FarLeftIconButton shortcut="F3" icon={Archive} onClick={handleSuspendTransaction}>Tunda</FarLeftIconButton>
         <FarLeftIconButton shortcut="F4" icon={ArchiveRestore} onClick={handleOpenRecallModal} badge={suspendedTransactions.length > 0 ? suspendedTransactions.length : null}>Panggil</FarLeftIconButton>
         <FarLeftIconButton shortcut="P" icon={Printer} onClick={() => setReprintModalOpen(true)}>Print</FarLeftIconButton>
         <FarLeftIconButton shortcut="F10" icon={Search} onClick={() => setProductSearchModalOpen(true)}>Cari</FarLeftIconButton>
      </aside>

      <aside className="w-48 flex-shrink-0 bg-gray-200 p-2 flex flex-col gap-2">
        <div className="bg-white p-2 rounded-md border border-gray-300 space-y-1">
          <Label>Admin</Label>
          <Input value="Admin" readOnly className="h-8"/>
          <Label>Tanggal</Label>
          <Input value={currentDate ? format(currentDate, 'dd/MM/yyyy') : ''} readOnly className="h-8"/>
          <Label>Tipe</Label>
          <Select defaultValue="tunai">
            <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="tunai">Tunai</SelectItem></SelectContent>
          </Select>
           <Label>Pelanggan</Label>
           <div className="relative">
              <Input 
                value={selectedMember?.name || 'Pelanggan Umum'} 
                readOnly 
                className="h-8 bg-yellow-200 border-yellow-400 pr-8"
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-0 top-0 h-8 w-8"
                onClick={() => setMemberModalOpen(true)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
           </div>
        </div>
        <ActionButton icon={UserCircle} onClick={() => setMemberModalOpen(true)}>
          Member
        </ActionButton>
        <ActionButton icon={Star} onClick={handleOpenRedeemModal}>Tukar Poin</ActionButton>
        <ActionButton icon={DollarSign}>Buka Laci</ActionButton>
        <ActionButton icon={Gift}>Hadiah</ActionButton>
        <div className="mt-auto">
            <ActionButton icon={LogOut} onClick={() => router.push('/master-data')}>Keluar</ActionButton>
        </div>
      </aside>

      <main className="flex-1 flex flex-col bg-white">
        <header className={cn(
          "p-2 flex justify-between items-center shadow-md",
          {
            "bg-green-600 text-white": settings.warnaKasir === 'hijau',
            "bg-blue-600 text-white": settings.warnaKasir === 'biru',
            "bg-red-600 text-white": settings.warnaKasir === 'merah',
          },
          !['hijau', 'biru', 'merah'].includes(settings.warnaKasir) && 'bg-primary'
        )}>
          <div className="text-white">
            <div className="text-lg font-semibold">{selectedMember ? selectedMember.name : "Pelanggan Umum"}</div>
            <div className="text-xs">{selectedMember ? `Poin: ${selectedMember.points.toLocaleString('id-ID')}` : "Bukan Member"}</div>
          </div>
          <div className="flex items-baseline">
            <span className="text-white text-3xl mr-2">Total</span>
            <div className="bg-black text-yellow-400 font-mono text-5xl p-2 rounded-md border-2 border-gray-600 w-80 text-right">
              {grandTotal.toLocaleString('id-ID')}
            </div>
          </div>
        </header>
        
        <div className={cn(
          "text-white px-4 py-1 flex justify-between text-xs",
          {
            "bg-green-700": settings.warnaKasir === 'hijau',
            "bg-blue-700": settings.warnaKasir === 'biru',
            "bg-red-700": settings.warnaKasir === 'merah',
          },
          !['hijau', 'biru', 'merah'].includes(settings.warnaKasir) && 'bg-primary/90'
        )}>
          <span>Kasir: Admin</span>
          <span>Tipe: Tunai</span>
        </div>

        <div className="flex-1 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-accent hover:bg-accent/90">
                <TableHead className="w-[40px] text-accent-foreground">No</TableHead>
                <TableHead className="w-[120px] text-accent-foreground">PLU</TableHead>
                <TableHead className="text-accent-foreground">Nama Barang</TableHead>
                <TableHead className="w-[120px] text-accent-foreground">Satuan</TableHead>
                <TableHead className="w-[120px] text-right text-accent-foreground">Hrg Jual</TableHead>
                <TableHead className="w-[80px] text-center text-accent-foreground">Jml</TableHead>
                <TableHead className="w-[120px] text-right text-accent-foreground">Diskon (Rp)</TableHead>
                <TableHead className="w-[150px] text-right text-accent-foreground">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cart.map((item, index) => {
                const isDiscountItem = item.id === 'DISCOUNT-POINTS';
                const itemPrice = isDiscountItem ? item.price : item.selectedUnit.price;
                const itemSubtotal = itemPrice * item.quantity;
                const itemTotal = itemSubtotal - item.discountAmount;

                return (
                  <TableRow key={`${item.id}-${item.selectedUnit.name}`} className="h-9" data-state={selectedRow === index ? "selected" : ""}>
                    {isDiscountItem ? (
                      <>
                        <TableCell className="text-center p-1">{index + 1}</TableCell>
                        <TableCell className="p-1" colSpan={6}>
                          <div className="font-semibold text-base text-green-600 flex items-center gap-2">
                            <Gift className="h-4 w-4" />
                            {item.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-right p-1 font-bold text-green-600">{itemTotal.toLocaleString('id-ID')}</TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="text-center p-1">{index + 1}</TableCell>
                        <TableCell className="p-1">{item.id}</TableCell>
                        <TableCell className="p-1 font-semibold text-base">{item.name}</TableCell>
                        <TableCell className="p-1">
                          {item.units.length > 1 ? (
                            <Select
                              value={item.selectedUnit.name}
                              onValueChange={(unitName) => handleUnitChange(item.id, unitName)}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {item.units.map((unit) => (
                                  <SelectItem key={unit.name} value={unit.name}>
                                    {unit.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            item.selectedUnit.name
                          )}
                        </TableCell>
                        <TableCell className="text-right p-1">{item.selectedUnit.price.toLocaleString('id-ID')}</TableCell>
                        <TableCell className="p-1">
                          <Input 
                            ref={(el) => { quantityInputRefs.current[index] = el; }}
                            type="number"
                            step="any"
                            value={item.quantity} 
                            onChange={(e) => handleUpdateCartItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                            className="h-8 text-center"
                          />
                        </TableCell>
                        <TableCell className="p-1">
                          <Input 
                            ref={(el) => { discountInputRefs.current[index] = el; }}
                            type="number"
                            step="any"
                            value={item.discountAmount} 
                            onChange={(e) => handleUpdateCartItem(item.id, 'discountAmount', parseFloat(e.target.value) || 0)}
                            className="h-8 text-right"
                          />
                        </TableCell>
                        <TableCell className="text-right p-1 font-bold">{itemTotal.toLocaleString('id-ID')}</TableCell>
                      </>
                    )}
                  </TableRow>
                )
              })}

              {cart.length < VISIBLE_ROWS && (
                <TableRow key="search-row" className="h-9" data-state={selectedRow === cart.length ? "selected" : ""}>
                  <TableCell className="text-center p-1">{cart.length + 1}</TableCell>
                  <TableCell className="p-1" colSpan={2}>
                    <Input
                      ref={inlineSearchInputRef}
                      value={inlineSearchTerm}
                      onChange={(e) => setInlineSearchTerm(e.target.value)}
                      onKeyDown={handleInlineSearch}
                      placeholder="Scan atau ketik PLU/Nama & Enter..."
                      className="h-8 w-full text-base"
                    />
                  </TableCell>
                  <TableCell className="p-1"></TableCell>
                  <TableCell className="p-1"></TableCell>
                  <TableCell className="p-1"></TableCell>
                  <TableCell className="p-1"></TableCell>
                  <TableCell className="p-1"></TableCell>
                </TableRow>
              )}
              
              {Array.from({ length: Math.max(0, VISIBLE_ROWS - cart.length - 1) }).map((_, index) => (
                <TableRow key={`empty-${index}`} className="h-9">
                  <TableCell className="text-center p-1">{cart.length + index + 2}</TableCell>
                  <TableCell colSpan={7} className="p-1"></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <footer className={cn(
            "text-primary-foreground p-2 grid grid-cols-3 items-center border-t-4 border-yellow-400",
            {
                "bg-green-700": settings.warnaKasir === 'hijau',
                "bg-blue-700": settings.warnaKasir === 'biru',
                "bg-red-700": settings.warnaKasir === 'merah',
            },
            !['hijau', 'biru', 'merah'].includes(settings.warnaKasir) && 'bg-primary/90'
        )}>
            <div className="flex gap-2 justify-start">
                <Button 
                    className="bg-black text-white hover:bg-gray-800 border-b-4 border-gray-900 rounded-lg text-lg font-bold px-6 py-2 shadow-lg relative active:top-0.5 transition-all duration-100" 
                    onClick={handleResetTransaction}>
                    BATAL [F5]
                </Button>
                <Button 
                    className="bg-red-600 text-white hover:bg-red-700 border-b-4 border-red-800 rounded-lg text-lg font-bold px-6 py-2 shadow-lg relative active:top-0.5 transition-all duration-100" 
                    onClick={handleOpenPaymentModal}>
                    BAYAR [F12]
                </Button>
            </div>
            <div className="text-center font-bold text-xl text-yellow-300 tracking-widest">
                {settings.namaPerusahaan.toUpperCase()}
            </div>
            <div></div>
        </footer>
      </main>
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={handleClosePaymentModal}
        onConfirm={handleConfirmPayment}
        totalAmount={grandTotal}
      />
      <RecallModal
        isOpen={isRecallModalOpen}
        onClose={() => setRecallModalOpen(false)}
        suspendedTransactions={suspendedTransactions}
        onSelectTransaction={handleSelectSuspendedTransaction}
      />
       <MemberRegistrationModal
        isOpen={isMemberModalOpen}
        onClose={() => setMemberModalOpen(false)}
        members={members}
        onSaveMember={handleSaveMember}
        onSelectMember={handleMemberSelect}
      />
      <RedeemPointsModal
        isOpen={isRedeemModalOpen}
        onClose={() => setRedeemModalOpen(false)}
        onConfirm={handleConfirmRedemption}
        member={selectedMember}
        totalAmount={grandTotal}
        poinSettings={poinSettings}
      />
      <ProductSearchModal
        isOpen={isProductSearchModalOpen}
        onClose={() => setProductSearchModalOpen(false)}
        onSelectProduct={(product, unit) => {
          handleAddToCart(product, 1, unit);
          setProductSearchModalOpen(false);
        }}
        products={products}
        suppliers={suppliers}
        productGroups={productGroups}
      />
      <ReprintModal
        isOpen={isReprintModalOpen}
        onClose={() => setReprintModalOpen(false)}
        sales={allSales}
        onSelectSale={handleReprintSale}
      />
      <CalculatorModal 
        isOpen={isCalculatorOpen}
        onClose={() => setCalculatorOpen(false)}
      />
    </div>
  )
}

```
```xml
<changes>
  <change>
    <file>/home/studio-lab-user/SistemKasir/src/components/layout/client-layout.tsx</file>
    <description>Mengganti semua impor dengan alias path (`@/`) menjadi path relatif untuk memperbaiki error `Module not found` secara definitif, dan membersihkan file konfigurasi terkait.</description>
    <content><![CDATA['use client'

import dynamic from 'next/dynamic'
import type { ReactNode } from 'react'

const AppLayout = dynamic(
  () => import('./app-layout').then((mod) => mod.AppLayout),
  { ssr: false }
)

export function ClientLayout({ children }: { children: ReactNode }) {
  return <AppLayout>{children}</AppLayout>
}
