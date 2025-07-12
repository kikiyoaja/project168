
export type MultiUnit = {
  name: string;
  quantity: number;
  price: number;
  barcode: string;
};

export type Product = {
  id: string
  name: string
  category: string
  price: number // Base unit price
  cost?: number // Purchase cost of the base unit
  stock: number // Stock in base units
  imageUrl: string
  aiHint?: string
  groupId: string
  supplierId: string
  units: MultiUnit[]
}

export type SaleItem = {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  discountAmount: number;
  unitName: string;
  unitQuantity: number;
  pointsRedeemed?: number;
};

export type Sale = {
  invoiceId: string
  date: string
  customer: string
  cashier: string
  total: number
  status: 'Completed' | 'Pending' | 'Cancelled'
  items: SaleItem[]
}

export type PurchaseItem = {
    productId: string;
    productName: string;
    quantity: number;
    unit: string;
    purchasePrice: number;
    discount: number;
    hpp: number;
    margin: number;
    sellingPrice: number;
    total: number;
};

export type Purchase = {
  poNumber: string
  date: string
  supplier: string // Legacy, keep for a while
  supplierId: string
  paymentMethod: string
  total: number
  status: 'Received' | 'Ordered' | 'Pending'
  ppn?: 'ppn' | 'non-ppn'
  notes?: string
  items: PurchaseItem[]
}

export type User = {
  id: string
  username: string
  fullName: string
  role: 'Admin' | 'Kasir' | 'Gudang'
  status: 'Aktif' | 'Non-Aktif'
}

export type Supplier = {
  id: string
  name: string // Company Name / PT
  contactPerson: string
  address: string
  phone: string
}

export type ProductGroup = {
  id: string
  name: string
}

export type StockAdjustmentItem = {
  productId: string;
  productName: string;
  systemStock: number;
  physicalStock: number;
  difference: number;
  notes: string;
};

export type StockAdjustment = {
  id: string; // e.g., 'ADJ-20240725-001'
  date: string; // ISO string
  user: string; // e.g., 'Admin'
  items: StockAdjustmentItem[];
  notes?: string;
};

export type SalesReturnItem = {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
};

export type SalesReturn = {
  id: string; // e.g., RTN-20240728-001
  date: string; // ISO string
  originalInvoiceId: string;
  user: string; // cashier who processed the return
  items: SalesReturnItem[];
  totalReturnAmount: number;
  notes?: string;
};

export type PurchaseReturnItem = {
  productId: string;
  productName: string;
  quantity: number;
  price: number; // hpp at time of return
  total: number;
};

export type PurchaseReturn = {
  id: string; // e.g., RTN-P-20240728-001
  date: string; // ISO string
  originalPoNumber: string;
  supplierId: string;
  user: string;
  items: PurchaseReturnItem[];
  totalReturnAmount: number;
  notes?: string;
};

export type ConsignmentItem = {
    productId: string;
    productName: string;
    quantity: number;
    unit: string;
    hpp: number;
};

export type ConsignmentReceipt = {
  id: string; // e.g., CON-20240801-001
  date: string; // ISO string
  supplierId: string;
  user: string;
  items: ConsignmentItem[];
  notes?: string;
  status: 'Received' | 'Settled';
};

export type Member = {
  id: string;
  barcode?: string;
  name: string;
  address?: string;
  city?: string;
  phone: string;
  npwp?: string;
  registrationDate: string; // ISO string
  deposit?: number;
  creditLimit?: number;
  level: string;
  points: number;
  expiryDate: string; // ISO string
  isActive: boolean;
};

export type PoinSettings = {
  enabled: boolean;
  rpToPoint: number;
  pointToRp: number;
};

export type StockTransferItem = {
    productId: string;
    productName: string;
    quantity: number;
    unit: string;
    hpp: number;
};

export type StockTransfer = {
  id: string; // e.g., TRF-20240802-001
  date: string; // ISO string
  destinationBranch: string;
  user: string;
  items: StockTransferItem[];
  notes?: string;
  status: 'Sent' | 'Received';
};

export type RedemptionPromo = {
  id: string;
  name: string;
  minSpend: number;
  promoProductId: string;
  promoPrice: number;
  isActive: boolean;
};

export type CashTransaction = {
  id: string; // e.g., CASH-1672531200000
  date: string; // ISO string
  type: 'in' | 'out'; // Kas Masuk or Kas Keluar
  amount: number;
  description: string;
  user: string; // User who recorded the transaction
};

export type Salesman = {
  id: string;
  name: string;
  phone: string;
  address: string;
  status: 'Aktif' | 'Non-Aktif';
};

export type Bank = {
  id: string;
  name: string;
  type: 'Bank' | 'E-Wallet';
  accountNumber?: string;
  accountName?: string;
};


// Types for local database migration

export type CartItem = Product & {
  quantity: number
  discountAmount: number
  selectedUnit: MultiUnit
  pointsRedeemed?: number
}

export type SuspendedTransaction = {
  cart: CartItem[]
  member: Member | null
}

export type Database = {
  products: Product[];
  sales: Sale[];
  purchases: Purchase[];
  users: User[];
  suppliers: Supplier[];
  productGroups: ProductGroup[];
  members: Member[];
  salesmen: Salesman[];
  banks: Bank[];
  salesReturns: SalesReturn[];
  purchaseReturns: PurchaseReturn[];
  stockAdjustments: StockAdjustment[];
  consignmentReceipts: ConsignmentReceipt[];
  stockTransfers: StockTransfer[];
  redemptionPromos: RedemptionPromo[];
  cashTransactions: CashTransaction[];
  suspendedTransactions: SuspendedTransaction[];
};
