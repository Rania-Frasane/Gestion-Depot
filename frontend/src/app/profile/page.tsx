"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
  Camera, Edit3, Save, X, CheckCircle2, Shield, Lock,
  Mail, Building, Loader2, Sparkles, User, Calendar,
  Star, TrendingUp, Package, BarChart3, Clock,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function ProfilePage() {
  const { user, profile, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    username: "",
    email: "",
    bio: "",
    organisation: "",
  })

  useEffect(() => {
    if (profile) {
      setForm({
        username: profile.username || "",
        email: profile.email || "",
        bio: profile.bio || "",
        organisation: profile.organisation || "",
      })
      setPreviewPhoto(profile.photo || null)
    }
  }, [profile])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo trop lourde", { description: "Maximum 5 MB autorisé." })
      return
    }
    setPendingFile(file)
    setPreviewPhoto(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateProfile({
        username: form.username,
        email: form.email,
        bio: form.bio,
        organisation: form.organisation,
        ...(pendingFile ? { photoFile: pendingFile } : {}),
      })
      setPendingFile(null)
      setIsEditing(false)
      toast.success("Profil mis à jour ✔️", { description: "Vos informations ont été enregistrées." })
    } catch (err: any) {
      toast.error("Erreur", { description: err?.response?.data?.error || "Veuillez réessayer." })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setForm({ username: profile.username || "", email: profile.email || "", bio: profile.bio || "", organisation: profile.organisation || "" })
      setPreviewPhoto(profile.photo || null)
    }
    setPendingFile(null)
    setIsEditing(false)
  }

  const initials = (form.username || "U").charAt(0).toUpperCase()
  const joinedDays = Math.floor(Math.random() * 400 + 60)

  const stats = [
    { label: "Jours actifs", value: joinedDays, icon: Calendar, color: "text-brand-cyan", bg: "bg-brand-cyan/10" },
    { label: "Sessions", value: "284", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Actions", value: "1.2k", icon: BarChart3, color: "text-brand-cyan", bg: "bg-brand-cyan/10" },
    { label: "Dernière connexion", value: "Aujourd'hui", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  ]

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">

      {/* Hero Cover Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-[2.5rem] overflow-hidden shadow-2xl"
      >
        {/* Gradient Cover */}
        <div className="h-48 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 relative overflow-hidden">
          {/* Decorative mesh */}
          <div className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, rgba(99,102,241,0.4) 0%, transparent 50%),
                                radial-gradient(circle at 80% 20%, rgba(139,92,246,0.3) 0%, transparent 40%),
                                radial-gradient(circle at 60% 80%, rgba(16,185,129,0.2) 0%, transparent 40%)`
            }}
          />
          <div className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.02) 40px, rgba(255,255,255,0.02) 41px),
                                repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.02) 40px, rgba(255,255,255,0.02) 41px)`
            }}
          />
          {/* Sparkle dots */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute size-1 rounded-full bg-white/40"
              style={{ left: `${15 + i * 14}%`, top: `${20 + (i % 3) * 25}%` }}
              animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
        </div>

        {/* White info panel */}
        <div className="bg-white px-8 pb-8 pt-0">
          <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-14">
            {/* Avatar */}
            <div className="relative shrink-0">
              <motion.div
                className="size-28 rounded-[1.6rem] overflow-hidden border-4 border-white shadow-2xl bg-slate-100 ring-2 ring-slate-200"
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {previewPhoto ? (
                  <img src={previewPhoto} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-950 text-white text-4xl font-black">
                    {initials}
                  </div>
                )}
              </motion.div>
              {isEditing && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1.5 -right-1.5 size-8 rounded-xl bg-slate-950 text-white flex items-center justify-center shadow-lg hover:bg-slate-700 transition-colors cursor-pointer border-2 border-white"
                >
                  <Camera size={14} />
                </motion.button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </div>

            {/* Name + badges */}
            <div className="flex-1 pb-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 leading-none">{form.username || "Utilisateur"}</h1>
                  <p className="text-sm text-slate-500 mt-1 font-medium">{form.email || "—"}</p>
                  <div className="flex flex-wrap gap-2 mt-2.5">
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
                      En ligne
                    </span>
                    <span className="inline-flex items-center gap-1 bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 rounded-full text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5">
                      <Shield size={9} /> Admin
                    </span>
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5">
                      <Star size={9} /> Pro
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <AnimatePresence mode="wait">
                    {isEditing ? (
                      <motion.div key="editing" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="flex gap-2">
                        <Button variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs h-9 border-slate-200" onClick={handleCancel} disabled={saving}>
                          <X size={13} /> Annuler
                        </Button>
                        <Button size="sm" className="rounded-xl gap-1.5 text-xs h-9 bg-slate-950 text-white hover:bg-slate-800 shadow-lg" onClick={handleSave} disabled={saving}>
                          {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                          {saving ? "Sauvegarde..." : "Enregistrer"}
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div key="view" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                        <Button size="sm" variant="outline" className="rounded-xl gap-1.5 text-xs h-9 border-slate-200 hover:bg-slate-50" onClick={() => setIsEditing(true)}>
                          <Edit3 size={13} /> Modifier le profil
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.03, y: -2 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3"
          >
            <div className={`size-10 rounded-xl ${stat.bg} flex items-center justify-center shrink-0 ${stat.color}`}>
              <stat.icon size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
              <p className="text-lg font-black text-slate-900 leading-none">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-3 gap-6">

        {/* Left: Info Cards */}
        <div className="md:col-span-2 flex flex-col gap-5">

          {/* Personal Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                  <User size={14} />
                </div>
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Informations personnelles</span>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nom d'utilisateur</Label>
                  {isEditing ? (
                    <Input
                      value={form.username}
                      onChange={e => setForm({ ...form, username: e.target.value })}
                      className="h-10 rounded-xl border-slate-200 text-sm font-bold"
                    />
                  ) : (
                    <div className="h-10 flex items-center px-3 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-900">
                      {form.username || <span className="text-slate-300 italic font-normal">Non renseigné</span>}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Mail size={10} /> Email
                  </Label>
                  {isEditing ? (
                    <Input
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      className="h-10 rounded-xl border-slate-200 text-sm"
                    />
                  ) : (
                    <div className="h-10 flex items-center px-3 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-900">
                      {form.email || <span className="text-slate-300 italic font-normal">Non renseigné</span>}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Building size={10} /> Organisation
                </Label>
                {isEditing ? (
                  <Input
                    value={form.organisation}
                    onChange={e => setForm({ ...form, organisation: e.target.value })}
                    className="h-10 rounded-xl border-slate-200 text-sm"
                  />
                ) : (
                  <div className="h-10 flex items-center px-3 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-900">
                    {form.organisation || <span className="text-slate-300 italic font-normal">Non renseigné</span>}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bio</Label>
                {isEditing ? (
                  <Textarea
                    value={form.bio}
                    onChange={e => setForm({ ...form, bio: e.target.value })}
                    rows={3}
                    className="rounded-xl border-slate-200 resize-none text-sm"
                    placeholder="Quelques mots sur vous..."
                  />
                ) : (
                  <div className="min-h-[80px] flex items-start px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-900 font-medium leading-relaxed">
                    {form.bio || <span className="text-slate-300 italic font-normal">Aucune bio renseignée</span>}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Security */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden"
          >
            <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-100">
              <div className="size-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                <Lock size={14} />
              </div>
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Sécurité</span>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm">
                    <Lock size={15} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Mot de passe</p>
                    <p className="text-xs text-slate-400 mt-0.5">Géré par l'administrateur</p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-200 px-2.5 py-1 rounded-full">Verrouillé</span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 size={15} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Compte vérifié</p>
                    <p className="text-xs text-slate-400 mt-0.5">Email et identité confirmés</p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">Actif</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right: Side Panel */}
        <div className="flex flex-col gap-5">

          {/* Role Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-950 text-white rounded-3xl p-6 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: "radial-gradient(circle at 80% 20%, rgba(99,102,241,0.6) 0%, transparent 60%)" }}
            />
            <div className="relative z-10">
              <div className="size-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
                <Shield size={22} className="text-brand-cyan" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Rôle actuel</p>
              <h3 className="text-xl font-black text-white">Administrateur</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">Accès complet à toutes les fonctionnalités et modules.</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {["Stock", "CRM", "RH", "Logistique"].map(m => (
                  <span key={m} className="text-[9px] font-black uppercase tracking-widest bg-white/10 text-white px-2 py-1 rounded-lg">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden"
          >
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
              <div className="size-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                <Sparkles size={13} />
              </div>
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Activité récente</span>
            </div>
            <div className="p-5 space-y-3">
              {[
                { action: "Produit ajouté", time: "Il y a 2h", icon: Package, color: "text-brand-cyan bg-brand-cyan/10" },
                { action: "Transfert créé", time: "Hier", icon: TrendingUp, color: "text-emerald-600 bg-emerald-50" },
                { action: "Rapport généré", time: "Il y a 3j", icon: BarChart3, color: "text-brand-cyan bg-brand-cyan/10" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`size-8 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                    <item.icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{item.action}</p>
                    <p className="text-[10px] text-slate-400">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Organisation */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white border border-slate-200/80 rounded-3xl shadow-sm p-5"
          >
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Organisation</p>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-slate-950 text-white flex items-center justify-center font-black text-sm shadow-md">
                D
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">{form.organisation || "Dépôt Manager Pro"}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Plan Entreprise</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
