"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Printer, Search, Tags, Check } from "lucide-react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function EtiquettesPage() {
  const [produits, setProduits] = useState<any[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    api.get("produits/").then(res => setProduits(res.data.results || res.data))
  }, [])

  const filtered = produits.filter(p => 
    p.nom.toLowerCase().includes(search.toLowerCase()) || 
    p.code.toLowerCase().includes(search.toLowerCase())
  )

  const toggleSelect = (id: number) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handlePrint = () => {
    if (selected.length === 0) return
    // In a real app, this would open a print-friendly route or generate a PDF
    // For now, we simulate the action
    window.print()
  }

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Impression d'Étiquettes</h1>
          <p className="text-slate-500">Sélectionnez les produits pour lesquels vous souhaitez imprimer des étiquettes QR/Barcode.</p>
        </div>
        <Button onClick={handlePrint} disabled={selected.length === 0} className="gap-2">
          <Printer className="size-4" />
          Imprimer ({selected.length})
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input 
                placeholder="Rechercher un produit..." 
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={() => setSelected(produits.map(p => p.id))}>Tout sélectionner</Button>
            <Button variant="ghost" onClick={() => setSelected([])}>Effacer</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead className="text-right">QR Code</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id} className={selected.includes(p.id) ? "bg-slate-50" : ""}>
                  <TableCell>
                    <Checkbox 
                      checked={selected.includes(p.id)} 
                      onCheckedChange={() => toggleSelect(p.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{p.nom}</TableCell>
                  <TableCell>{p.code}</TableCell>
                  <TableCell>{p.categorie_nom}</TableCell>
                  <TableCell>{p.prix_vente} MAD</TableCell>
                  <TableCell className="text-right">
                    {p.qr_code ? (
                      <img src={p.qr_code} alt="QR" className="size-10 inline-block rounded border" />
                    ) : (
                      <span className="text-xs text-slate-400 italic">Non généré</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="hidden print:block print:fixed print:inset-0 print:bg-white print:z-[9999] p-10">
         <h2 className="text-xl font-bold mb-6 text-center border-b pb-4">Étiquettes de Stock — DEPOT MANAGER</h2>
         <div className="grid grid-cols-3 gap-6">
            {produits.filter(p => selected.includes(p.id)).map(p => (
              <div key={p.id} className="border-2 border-slate-300 p-4 rounded-lg text-center flex flex-col items-center gap-2 h-[180px] justify-center">
                <div className="font-bold text-sm truncate w-full">{p.nom}</div>
                {p.qr_code ? (
                  <img src={p.qr_code} alt="QR" className="size-24" />
                ) : (
                  <div className="size-24 bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 uppercase">Pas de QR</div>
                )}
                <div className="text-xs font-mono">{p.code}</div>
                <div className="font-bold text-lg">{p.prix_vente} MAD</div>
              </div>
            ))}
         </div>
      </div>
    </div>
  )
}
