
import type { Product, Sale, Purchase, User, Supplier, ProductGroup, MultiUnit, Member, Salesman, Bank } from './types'

export const mockSuppliers: Supplier[] = [
  { id: 'sup-001', name: 'UMUM', contactPerson: '-', address: '-', phone: '-' },
  { id: 'sup-002', name: 'PT Sinar Jaya Abadi', contactPerson: 'Bapak Rudi', address: 'Jl. Industri No. 123, Jakarta', phone: '021-555-1234' },
  { id: 'sup-003', name: 'CV Makmur Pangan', contactPerson: 'Ibu Siti', address: 'Jl. Pahlawan No. 45, Surabaya', phone: '031-555-5678' },
  { id: 'sup-004', name: 'Toko Bahan Kue Sejahtera', contactPerson: 'Bapak Hartono', address: 'Jl. Merdeka No. 78, Bandung', phone: '022-555-8765' },
];

export const mockProductGroups: ProductGroup[] = [
  { id: '001', name: 'UMUM' },
  { id: '002', name: 'MAKANAN & MINUMAN' },
  { id: '003', name: 'ROTI & KUE' },
  { id: '004', name: 'MAKANAN UTAMA' },
];

export const mockProducts: Product[] = [
  {
    id: 'prod-001',
    name: 'Kopi Susu Gula Aren',
    category: 'Minuman Kopi',
    price: 18000,
    cost: 10000,
    stock: 150,
    imageUrl: 'https://placehold.co/300x200.png',
    aiHint: 'iced coffee',
    groupId: '002',
    supplierId: 'sup-002',
    units: [
      { name: 'PCS', quantity: 1, price: 18000, barcode: 'prod-001' }
    ]
  },
  {
    id: 'prod-002',
    name: 'Croissant Cokelat',
    category: 'Pastry',
    price: 22000,
    cost: 15000,
    stock: 80,
    imageUrl: 'https://placehold.co/300x200.png',
    aiHint: 'chocolate croissant',
    groupId: '003',
    supplierId: 'sup-004',
    units: [
      { name: 'PCS', quantity: 1, price: 22000, barcode: 'prod-002' },
      { name: 'LUSIN', quantity: 12, price: 240000, barcode: 'prod-002-L' },
    ]
  },
  {
    id: 'prod-003',
    name: 'Matcha Latte',
    category: 'Minuman Teh',
    price: 25000,
    cost: 16000,
    stock: 95,
    imageUrl: 'https://placehold.co/300x200.png',
    aiHint: 'matcha latte',
    groupId: '002',
    supplierId: 'sup-002',
    units: [
      { name: 'PCS', quantity: 1, price: 25000, barcode: 'prod-003' }
    ]
  },
  {
    id: 'prod-004',
    name: 'Roti Bakar Keju',
    category: 'Roti',
    price: 15000,
    cost: 8000,
    stock: 120,
    imageUrl: 'https://placehold.co/300x200.png',
    aiHint: 'cheese toast',
    groupId: '003',
    supplierId: 'sup-004',
    units: [
      { name: 'PCS', quantity: 1, price: 15000, barcode: 'prod-004' }
    ]
  },
  {
    id: 'prod-005',
    name: 'Americano',
    category: 'Minuman Kopi',
    price: 15000,
    cost: 8000,
    stock: 200,
    imageUrl: 'https://placehold.co/300x200.png',
    aiHint: 'americano coffee',
    groupId: '002',
    supplierId: 'sup-002',
    units: [
      { name: 'PCS', quantity: 1, price: 15000, barcode: 'prod-005' }
    ]
  },
  {
    id: 'prod-006',
    name: 'Red Velvet Cake',
    category: 'Kue',
    price: 35000,
    cost: 20000,
    stock: 40,
    imageUrl: 'https://placehold.co/300x200.png',
    aiHint: 'red velvet',
    groupId: '003',
    supplierId: 'sup-004',
    units: [
      { name: 'PCS', quantity: 1, price: 35000, barcode: 'prod-006' }
    ]
  },
  {
    id: 'prod-007',
    name: 'Teh Lemon Madu',
    category: 'Minuman Teh',
    price: 16000,
    cost: 9000,
    stock: 110,
    imageUrl: 'https://placehold.co/300x200.png',
    aiHint: 'lemon tea',
    groupId: '002',
    supplierId: 'sup-003',
    units: [
      { name: 'PCS', quantity: 1, price: 16000, barcode: 'prod-007' }
    ]
  },
  {
    id: 'prod-008',
    name: 'Nasi Goreng Spesial',
    category: 'Makanan Utama',
    price: 28000,
    cost: 18000,
    stock: 75,
    imageUrl: 'https://placehold.co/300x200.png',
    aiHint: 'fried rice',
    groupId: '004',
    supplierId: 'sup-003',
    units: [
      { name: 'PCS', quantity: 1, price: 28000, barcode: 'prod-008' }
    ]
  },
]

export const mockSales: Sale[] = [
  { 
    invoiceId: 'INV-20240721-001', 
    date: '2024-07-21T10:30:00Z',
    customer: 'Budi Hartono', 
    cashier: 'Siti Sarah', 
    total: 58000, 
    status: 'Completed',
    items: [
      { productId: 'prod-001', productName: 'Kopi Susu Gula Aren', quantity: 2, price: 18000, discountAmount: 0, unitName: 'PCS', unitQuantity: 1 },
      { productId: 'prod-002', productName: 'Croissant Cokelat', quantity: 1, price: 22000, discountAmount: 0, unitName: 'PCS', unitQuantity: 1 },
    ]
  },
  { 
    invoiceId: 'INV-20240721-002', 
    date: '2024-07-21T11:45:00Z',
    customer: 'Siti Aminah', 
    cashier: 'Siti Sarah', 
    total: 40000, 
    status: 'Completed',
    items: [
      { productId: 'prod-003', productName: 'Matcha Latte', quantity: 1, price: 25000, discountAmount: 0, unitName: 'PCS', unitQuantity: 1 },
      { productId: 'prod-004', productName: 'Roti Bakar Keju', quantity: 1, price: 15000, discountAmount: 0, unitName: 'PCS', unitQuantity: 1 }
    ]
  },
  { 
    invoiceId: 'INV-20240720-003', 
    date: '2024-07-20T14:00:00Z', 
    customer: 'Rahmat Hidayat', 
    cashier: 'Budi Santoso', 
    total: 110000, 
    status: 'Completed',
    items: [
      { productId: 'prod-006', productName: 'Red Velvet Cake', quantity: 2, price: 35000, discountAmount: 0, unitName: 'PCS', unitQuantity: 1 },
      { productId: 'prod-008', productName: 'Nasi Goreng Spesial', quantity: 1, price: 28000, discountAmount: 0, unitName: 'PCS', unitQuantity: 1 },
      { productId: 'prod-005', productName: 'Americano', quantity: 1, price: 15000, discountAmount: 3000, unitName: 'PCS', unitQuantity: 1 },
    ]
  },
  { 
    invoiceId: 'INV-20240720-004', 
    date: '2024-07-20T18:20:00Z',
    customer: 'Dewi Lestari', 
    cashier: 'Siti Sarah', 
    total: 32000, 
    status: 'Completed',
    items: [
       { productId: 'prod-007', productName: 'Teh Lemon Madu', quantity: 2, price: 16000, discountAmount: 0, unitName: 'PCS', unitQuantity: 1 }
    ]
  },
  { 
    invoiceId: 'INV-20240719-005', 
    date: '2024-07-19T09:05:00Z',
    customer: 'Online Order', 
    cashier: 'Budi Santoso', 
    total: 88000, 
    status: 'Completed',
    items: [
        { productId: 'prod-002', productName: 'Croissant Cokelat', quantity: 4, price: 22000, discountAmount: 0, unitName: 'PCS', unitQuantity: 1 }
    ]
  },
]

export const mockPurchases: Purchase[] = [
    { 
        poNumber: 'PO-20240715-001', 
        date: '2024-07-15', 
        supplier: 'PT Sinar Jaya Abadi', 
        supplierId: 'sup-002', 
        paymentMethod: 'kredit',
        total: 1500000, 
        status: 'Received',
        items: [
            { productId: 'prod-001', productName: 'Kopi Susu Gula Aren', quantity: 50, unit: 'PCS', purchasePrice: 10000, discount: 0, hpp: 10000, margin: 80, sellingPrice: 18000, total: 500000 },
            { productId: 'prod-005', productName: 'Americano', quantity: 100, unit: 'PCS', purchasePrice: 8000, discount: 0, hpp: 8000, margin: 87.5, sellingPrice: 15000, total: 800000 },
        ]
    },
    { 
        poNumber: 'PO-20240716-002', 
        date: '2024-07-16', 
        supplier: 'CV Makmur Pangan', 
        supplierId: 'sup-003',
        paymentMethod: 'tunai',
        total: 750000, 
        status: 'Received',
        items: [
             { productId: 'prod-007', productName: 'Teh Lemon Madu', quantity: 50, unit: 'PCS', purchasePrice: 9000, discount: 0, hpp: 9000, margin: 77.78, sellingPrice: 16000, total: 450000 },
        ]
    },
]

export const mockUsers: User[] = [
  { id: 'user-001', username: 'admin', fullName: 'Administrator Utama', role: 'Admin', status: 'Aktif' },
  { id: 'user-002', username: 'kasir01', fullName: 'Siti Sarah', role: 'Kasir', status: 'Aktif' },
  { id: 'user-003', username: 'kasir02', fullName: 'Budi Santoso', role: 'Kasir', status: 'Non-Aktif' },
  { id: 'user-004', username: 'gudang01', fullName: 'Rahmat Hidayat', role: 'Gudang', status: 'Aktif' },
]

export const mockMembers: Member[] = [
  { id: 'C0001', name: 'Budi Hartono', phone: '081234567890', points: 150, isActive: true, address: 'Jl. Merdeka 1', city: 'Jakarta', level: 'Level 1', creditLimit: 0, registrationDate: new Date().toISOString(), expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString() },
  { id: 'C0002', name: 'Siti Aminah', phone: '082345678901', points: 275, isActive: true, address: 'Jl. Sudirman 2', city: 'Bandung', level: 'Level 1', creditLimit: 0, registrationDate: new Date().toISOString(), expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString() },
  { id: 'C0003', name: 'Dewi Lestari', phone: '083456789012', points: 50, isActive: true, address: 'Jl. Pahlawan 3', city: 'Surabaya', level: 'Level 1', creditLimit: 0, registrationDate: new Date().toISOString(), expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString() },
  { id: 'C0004', name: 'Rahmat Hidayat', phone: '085678901234', points: 800, isActive: false, address: 'Jl. Gatot Subroto 4', city: 'Medan', level: 'Level 2', creditLimit: 500000, registrationDate: new Date().toISOString(), expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString() },
];

export const mockSalesmen: Salesman[] = [
  { id: 'sls-001', name: 'Andi Wijaya', phone: '081122334455', address: 'Jl. Kenanga No. 10', status: 'Aktif' },
  { id: 'sls-002', name: 'Bunga Citra', phone: '081234567890', address: 'Jl. Mawar No. 5', status: 'Aktif' },
  { id: 'sls-003', name: 'Candra Darmawan', phone: '087890123456', address: 'Jl. Melati No. 15', status: 'Non-Aktif' },
];

export const mockBanks: Bank[] = [
  { id: 'bank-001', name: 'BCA', type: 'Bank', accountNumber: '1234567890', accountName: 'Ziyyanmart' },
  { id: 'bank-002', name: 'Mandiri', type: 'Bank', accountNumber: '0987654321', accountName: 'Ziyyanmart' },
  { id: 'ewallet-001', name: 'GoPay', type: 'E-Wallet' },
  { id: 'ewallet-002', name: 'OVO', type: 'E-Wallet' },
  { id: 'ewallet-003', name: 'DANA', type: 'E-Wallet' },
];
