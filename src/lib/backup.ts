
'use client'

import { toast } from "../hooks/use-toast"
import { getDatabase } from "./local-db"
import { invoke } from '@tauri-apps/api/tauri'

export const performBackup = async () => {
    const backupData = await getDatabase();
    const backupJson = JSON.stringify(backupData, null, 2);

    try {
      // This calls the 'save_backup' command in our Rust backend
      const filePath: string | null = await invoke('save_backup', { data: backupJson });
      
      if (filePath) {
        toast({
          title: "Backup Berhasil",
          description: `Data telah disimpan di: ${filePath}`
        });
      } else {
        // This case handles when the user cancels the save dialog
        toast({
          variant: "default",
          title: "Backup Dibatalkan",
          description: `Proses backup dibatalkan oleh pengguna.`
        });
      }
    } catch (error) {
       const message = error instanceof Error ? error.message : String(error);
       toast({
         variant: "destructive",
         title: "Backup Gagal",
         description: `Terjadi kesalahan: ${message}`
       });
    }
}
