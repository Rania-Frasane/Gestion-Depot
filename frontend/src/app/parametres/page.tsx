"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  Bell, Globe, Database, Download, Trash2, ChevronRight, Check,
  Monitor, Sun, Volume2, VolumeX, Smartphone, Mail, AlertTriangle,
  Loader2, Sliders, Shield, Zap,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 cursor-pointer focus:outline-none shadow-inner ${
        enabled ? "bg-slate-950" : "bg-slate-200"
      }`}
    >
      <motion.span
        layout
        className="inline-block size-[18px] rounded-full bg-white shadow-md"
        animate={{ x: enabled ? 22 : 2 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      />
    </button>
  )
}

interface SettingRowProps {
  icon: any; label: string; description: string;
  enabled: boolean; onToggle: () => void; accent?: string;
}

function SettingRow({ icon: Icon, label, description, enabled, onToggle, accent = "bg-slate-100 text-slate-600" }: SettingRowProps) {
  return (
    <motion.div
      whileHover={{ x: 2 }}
      className="flex items-center justify-between py-3.5 group cursor-pointer"
      onClick={onToggle}
    >
      <div className="flex items-center gap-3.5">
        <div className={`size-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${enabled ? accent : "bg-slate-100 text-slate-400"}`}>
          <Icon size={15} />
        </div>
        <div>
          <p className={`text-sm font-bold transition-colors ${enabled ? "text-slate-900" : "text-slate-600"}`}>{label}</p>
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{description}</p>
        </div>
      </div>
      <Toggle enabled={enabled} onToggle={onToggle} />
    </motion.div>
  )
}

function SectionHeader({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
      <div className="size-9 rounded-xl bg-slate-950 text-white flex items-center justify-center shadow-sm">
        <Icon size={15} />
      </div>
      <div>
        <p className="text-sm font-extrabold text-slate-900">{title}</p>
        {subtitle && <p className="text-[10px] text-slate-400 font-medium mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}

export default function ParametresPage() {
  const { profile, updateProfile } = useAuth()
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  const [prefs, setPrefs] = useState({
    notif_email: true, notif_stock_alerts: true, notif_order_updates: false,
    notif_sound: true, notif_mobile: false,
    display_compact: false, display_animations: true,
    language: "fr", currency: "MAD",
  })

  useEffect(() => {
    if (profile) {
      setPrefs({
        notif_email: profile.notif_email, notif_stock_alerts: profile.notif_stock_alerts,
        notif_order_updates: profile.notif_order_updates, notif_sound: profile.notif_sound,
        notif_mobile: profile.notif_mobile, display_compact: profile.display_compact,
        display_animations: profile.display_animations, language: profile.language, currency: profile.currency,
      })
      setDirty(false)
    }
  }, [profile])

  const toggle = (key: keyof typeof prefs) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }))
    setDirty(true)
  }

  const setVal = (key: keyof typeof prefs, value: string) => {
    setPrefs(prev => ({ ...prev, [key]: value }))
    setDirty(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateProfile(prefs)
      setDirty(false)
      toast.success("Paramètres sauvegardés ✔️", { description: "Toutes vos préférences ont été appliquées." })
    } catch {
      toast.error("Erreur de sauvegarde", { description: "Veuillez réessayer." })
    } finally {
      setSaving(false)
    }
  }

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }
  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 120, damping: 14 } } }

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">

      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="size-9 rounded-xl bg-slate-950 text-white flex items-center justify-center shadow-md">
              <Sliders size={16} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Paramètres</h1>
          </div>
          <p className="text-sm text-slate-500 font-medium ml-11">Personnalisez votre expérience</p>
        </div>

        <AnimatePresence>
          {dirty && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="h-10 px-5 rounded-2xl bg-slate-950 text-white hover:bg-slate-800 font-extrabold gap-2 text-sm shadow-lg transition-all hover:scale-[1.02]"
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                {saving ? "Sauvegarde..." : "Sauvegarder"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-5">

        {/* Notifications */}
        <motion.div variants={item} className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
          <SectionHeader icon={Bell} title="Notifications" subtitle="Gérez vos alertes et préférences de communication" />
          <div className="px-6 divide-y divide-slate-100">
            <SettingRow icon={Mail} label="Email" description="Alertes critiques par email" enabled={prefs.notif_email} onToggle={() => toggle("notif_email")} accent="bg-blue-100 text-blue-600" />
            <SettingRow icon={AlertTriangle} label="Alertes de stock" description="Notifier quand un produit atteint son seuil minimum" enabled={prefs.notif_stock_alerts} onToggle={() => toggle("notif_stock_alerts")} accent="bg-amber-100 text-amber-600" />
            <SettingRow icon={Bell} label="Commandes" description="Changements de statut des commandes" enabled={prefs.notif_order_updates} onToggle={() => toggle("notif_order_updates")} accent="bg-brand-cyan/10 text-brand-cyan" />
            <SettingRow icon={prefs.notif_sound ? Volume2 : VolumeX} label="Sons" description="Jouer un son lors de chaque notification" enabled={prefs.notif_sound} onToggle={() => toggle("notif_sound")} accent="bg-brand-cyan/10 text-brand-cyan" />
            <SettingRow icon={Smartphone} label="Mobile" description="Notifications push sur appareil mobile" enabled={prefs.notif_mobile} onToggle={() => toggle("notif_mobile")} accent="bg-pink-100 text-pink-600" />
          </div>
          {/* Summary bar */}
          <div className="mx-6 mb-5 mt-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2">
            <Zap size={13} className="text-slate-500 shrink-0" />
            <p className="text-[11px] text-slate-500 font-bold">
              {[prefs.notif_email, prefs.notif_stock_alerts, prefs.notif_order_updates, prefs.notif_sound, prefs.notif_mobile].filter(Boolean).length} / 5 canaux actifs
            </p>
          </div>
        </motion.div>

        {/* Affichage */}
        <motion.div variants={item} className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
          <SectionHeader icon={Monitor} title="Affichage" subtitle="Personnalisez l'apparence de l'interface" />
          <div className="px-6 divide-y divide-slate-100">
            <SettingRow icon={Monitor} label="Mode compact" description="Réduit l'espacement pour afficher plus de données" enabled={prefs.display_compact} onToggle={() => toggle("display_compact")} accent="bg-slate-200 text-slate-700" />
            <SettingRow icon={Sun} label="Animations" description="Activer les transitions et micro-animations" enabled={prefs.display_animations} onToggle={() => toggle("display_animations")} accent="bg-yellow-100 text-yellow-600" />
          </div>
          <div className="px-6 pb-5" />
        </motion.div>

        {/* Langue & Région */}
        <motion.div variants={item} className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
          <SectionHeader icon={Globe} title="Langue & Région" subtitle="Localisez votre interface" />
          <div className="p-6 space-y-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Langue</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { code: "fr", label: "Français", flag: "🇫🇷" },
                  { code: "ar", label: "العربية", flag: "🇲🇦" },
                  { code: "en", label: "English", flag: "🇬🇧" },
                ].map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => setVal("language", lang.code)}
                    className={`relative flex flex-col items-center gap-1.5 p-3.5 rounded-2xl border-2 transition-all cursor-pointer font-bold text-xs ${
                      prefs.language === lang.code
                        ? "border-slate-950 bg-slate-950 text-white shadow-lg scale-[1.02]"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-400 hover:bg-white"
                    }`}
                  >
                    <span className="text-2xl">{lang.flag}</span>
                    <span className="text-[11px] font-black">{lang.label}</span>
                    {prefs.language === lang.code && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-1.5 right-1.5 size-4 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Check size={9} className="text-white" strokeWidth={3} />
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Devise</Label>
              <div className="flex gap-2">
                {[
                  { code: "MAD", label: "Dirham", symbol: "د.م." },
                  { code: "EUR", label: "Euro", symbol: "€" },
                  { code: "USD", label: "Dollar", symbol: "$" },
                ].map(c => (
                  <button
                    key={c.code}
                    onClick={() => setVal("currency", c.code)}
                    className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl border-2 transition-all cursor-pointer ${
                      prefs.currency === c.code
                        ? "border-slate-950 bg-slate-950 text-white shadow-lg"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-400 hover:bg-white"
                    }`}
                  >
                    <span className="text-lg font-black">{c.symbol}</span>
                    <span className="text-[10px] font-black">{c.code}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Données & Confidentialité */}
        <motion.div variants={item} className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
          <SectionHeader icon={Shield} title="Données & Confidentialité" subtitle="Gérez vos données personnelles" />
          <div className="p-5 space-y-3">
            <button
              onClick={() => toast.success("Export démarré", { description: "Vos données seront prêtes dans quelques instants." })}
              className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/80 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan shadow-sm">
                  <Download size={16} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-900">Exporter mes données</p>
                  <p className="text-xs text-slate-400">Format JSON — Toutes vos données</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
            </button>

            <button
              onClick={() => toast.error("Action non disponible", { description: "Contactez l'administrateur système." })}
              className="w-full flex items-center justify-between p-4 rounded-2xl border border-rose-100/80 bg-rose-50/30 hover:bg-rose-50 hover:border-rose-200 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                  <Trash2 size={16} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-rose-700">Supprimer le compte</p>
                  <p className="text-xs text-rose-400">Action irréversible — Données définitivement supprimées</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-rose-300 group-hover:text-rose-600 transition-colors" />
            </button>
          </div>
        </motion.div>

        {/* Save CTA */}
        <motion.div variants={item}>
          <Button
            onClick={handleSave}
            disabled={saving || !dirty}
            className="w-full h-12 rounded-2xl font-extrabold gap-2 text-sm shadow-lg transition-all hover:scale-[1.01] disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
            style={{ background: dirty ? "#0f172a" : "#94a3b8" }}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            {saving ? "Sauvegarde en cours..." : dirty ? "Sauvegarder les paramètres" : "Aucune modification en attente"}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
