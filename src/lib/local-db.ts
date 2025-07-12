
'use client'

import { invoke } from '@tauri-apps/api/tauri'
import type { Database } from './types'
import { mockProducts, mockSales, mockPurchases, mockUsers, mockSuppliers, mockProductGroups, mockMembers, mockSalesmen, mockBanks } from "./mock-data";

/**
 * Provides a client-side abstraction for interacting with Tauri's command system to manage local data files.
 * This should only be used in 'use client' components.
 */

const isTauri = () => typeof window !== 'undefined' && '__TAURI__' in window;

/**
 * Retrieves application settings using Tauri's invoke.
 * If not in Tauri context, it falls back to localStorage.
 * @returns {Promise<any>} A promise that resolves to the settings object.
 */
export const getAppSettings = async (): Promise<any> => {
  if (!isTauri()) {
    if (typeof localStorage !== 'undefined') {
        const settings = localStorage.getItem('appSettings');
        return settings ? JSON.parse(settings) : {};
    }
    return {};
  }
  try {
    return await invoke('get_app_settings');
  } catch (error) {
    console.error("Failed to get app settings via Tauri, falling back to localStorage:", error);
    return {};
  }
};

/**
 * Saves the application settings object using Tauri's invoke.
 * If not in Tauri context, it falls back to localStorage.
 * @param {any} settings - The settings object to save.
 * @returns {Promise<void>}
 */
export const saveAppSettings = async (settings: any): Promise<void> => {
   if (!isTauri()) {
     if (typeof localStorage !== 'undefined') {
       localStorage.setItem('appSettings', JSON.stringify(settings));
     }
     return;
   }
   try {
    await invoke('save_app_settings', { settings });
  } catch (error) {
    console.error("Failed to save app settings via Tauri:", error);
  }
};

/**
 * Retrieves the entire database. It tries Tauri first, then falls back to localStorage.
 * If no data is found, it initializes with mock data and saves it.
 * @returns {Promise<Database>} A promise that resolves to the full database object.
 */
export const getDatabase = async (): Promise<Database> => {
    let data: Database | null = null;

    if (isTauri()) {
        try {
            data = await invoke('get_database');
        } catch (error) {
            console.error("Tauri invoke for get_database failed, falling back to localStorage:", error);
        }
    }
    
    if (!data && typeof localStorage !== 'undefined') {
        const localData = localStorage.getItem('ziyyanmartDb');
        if (localData) {
            try {
                data = JSON.parse(localData);
            } catch (e) {
                console.error("Failed to parse local DB from localStorage, re-initializing.", e);
            }
        }
    }
    
    if (data) {
        const defaultData = initializeDatabase();
        // Ensure all keys from default data exist, to prevent errors after schema updates.
        for (const key in defaultData) {
            if (!(key in data)) {
                (data as any)[key] = (defaultData as any)[key];
            }
        }
        return data;
    } else {
        console.log("No database found. Initializing with mock data.");
        const mockData = initializeDatabase();
        await saveDatabase(mockData);
        return mockData;
    }
};

/**
 * Saves the provided database object. It tries Tauri first, then falls back to localStorage.
 * @param {Database} data - The complete database object to save.
 * @returns {Promise<{success: boolean; message?: string}>}
 */
export const saveDatabase = async (data: Database): Promise<{success: boolean; message?: string}> => {
    if (isTauri()) {
        try {
            await invoke('save_database', { data });
            return { success: true };
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.error("Failed to save database via Tauri:", error);
            return { success: false, message };
        }
    }

    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('ziyyanmartDb', JSON.stringify(data));
        return { success: true };
    }
    
    return { success: false, message: "No storage mechanism available." };
};

/**
 * Creates a default database object from mock data.
 * @returns {Database} The default database object.
 */
const initializeDatabase = (): Database => {
    return {
        products: mockProducts,
        sales: mockSales,
        purchases: mockPurchases,
        users: mockUsers,
        suppliers: mockSuppliers,
        productGroups: mockProductGroups,
        members: mockMembers,
        salesmen: mockSalesmen,
        banks: mockBanks,
        salesReturns: [],
        purchaseReturns: [],
        stockAdjustments: [],
        suspendedTransactions: [],
        consignmentReceipts: [],
        stockTransfers: [],
        redemptionPromos: [],
        cashTransactions: [],
    };
};
