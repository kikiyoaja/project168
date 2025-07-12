
'use client'

import * as React from 'react'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronsUpDown, Building2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function LoginPage() {
  const [showDbSettings, setShowDbSettings] = React.useState(false)
  const { toast } = useToast()

  const handleLogin = () => {
    // Login logic will be implemented later
    toast({
      title: "Login (Simulasi)",
      description: "Fungsi login akan diimplementasikan setelah ini.",
    })
  }
  
  const handleTestConnection = () => {
      toast({
          title: "Tes Koneksi Berhasil",
          description: "Koneksi ke server database sukses (simulasi)."
      })
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto p-3 bg-primary rounded-full inline-block mb-4">
            <Building2 className="h-10 w-10 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold">Ziyyanmart POS</CardTitle>
          <CardDescription>Silakan masuk untuk melanjutkan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="username">Username</Label>
            <Input id="username" placeholder="Masukkan username Anda" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="Masukkan password Anda" />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" size="lg" onClick={handleLogin}>Login</Button>
          
          <Collapsible open={showDbSettings} onOpenChange={setShowDbSettings}>
            <div className="flex items-center justify-center space-x-2">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <ChevronsUpDown className="h-4 w-4" />
                  Pengaturan Database
                </Button>
              </CollapsibleTrigger>
            </div>
            
            <CollapsibleContent className="space-y-4 mt-4 p-4 border rounded-lg bg-background">
              <div className="space-y-1">
                <Label htmlFor="db-host">Host Server</Label>
                <Input id="db-host" defaultValue="localhost" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="db-port">Port</Label>
                <Input id="db-port" defaultValue="3050" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="db-path">Path Database</Label>
                <Input id="db-path" defaultValue="D:\_data\DATA.FDB" />
              </div>
              <Button variant="outline" className="w-full" onClick={handleTestConnection}>Tes Koneksi</Button>
            </CollapsibleContent>
          </Collapsible>
        </CardFooter>
      </Card>
    </div>
  )
}
