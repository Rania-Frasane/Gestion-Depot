"use client"

import React, { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import {
  ArrowRight, Box, Brain, Zap, Shield, BarChart3,
  CheckCircle2, Menu, X, Play, Users,
  Globe, Star, Sun, Moon, Sparkles, Database, FileSpreadsheet, Cpu,
  ShieldAlert, ArrowUpRight, HelpCircle, Mail, MapPin, Phone, MessageSquare
} from "lucide-react"
import { DepotManagerLogo } from "@/components/Logo"

// Interactive Neural Network Particles Background Component
function ParticlesBackground({ theme }: { theme: 'light' | 'dark' }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      radius: number
    }> = []

    const particleCount = Math.min(60, Math.floor((width * height) / 25000))

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 2 + 1,
      })
    }

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      const particleColor = theme === 'dark' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(99, 102, 241, 0.15)'
      const lineColor = theme === 'dark' ? 'rgba(99, 102, 241, 0.05)' : 'rgba(99, 102, 241, 0.03)'

      ctx.fillStyle = particleColor
      ctx.strokeStyle = lineColor

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fill()

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y)

          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [theme])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-1000 opacity-60"
    />
  )
}

// 3D Card Hover Effect (Aceternity UI Style)
function Card3D({ children, className, theme }: { children: React.ReactNode, className?: string, theme: 'light' | 'dark' }) {
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const el = cardRef.current
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2

    // Smooth angle calculations
    setRotateX(-y / 15)
    setRotateY(x / 15)
  }

  const handleMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: "preserve-3d", perspective: 1000 }}
      animate={{ rotateX, rotateY }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={className}
    >
      <div style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }} className="size-full">
        {children}
      </div>
    </motion.div>
  )
}

// Interactive FAQ Accordion Component
function FAQItem({ question, answer, theme }: { question: string, answer: string, theme: 'light' | 'dark' }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div
      className={`border rounded-2xl transition-all duration-300 ${isOpen
        ? theme === 'dark'
          ? 'border-brand-cyan/50 bg-slate-900/40 shadow-lg shadow-brand-cyan/5'
          : 'border-brand-cyan/40 bg-white shadow-md shadow-brand-cyan/5/30'
        : theme === 'dark'
          ? 'border-slate-800 bg-slate-900/10 hover:border-slate-700/60'
          : 'border-slate-200 bg-white/50 hover:border-slate-300'
        }`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 md:p-6 text-left font-bold text-sm md:text-base tracking-tight cursor-pointer"
      >
        <span className="flex items-center gap-3">
          <HelpCircle className="size-4.5 text-brand-cyan shrink-0 animate-pulse" />
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 185 : 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="text-slate-400"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="overflow-hidden"
          >
            <div className={`px-5 md:px-6 pb-6 pt-0 text-xs md:text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-650'
              }`}>
              <div className="h-px bg-slate-800/10 dark:bg-slate-800/60 mb-4" />
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [activeTab, setActiveTab] = useState<'analytics' | 'charts' | 'datasets' | 'workflows' | 'insights' | 'admin'>('analytics')

  const heroRef = useRef<HTMLDivElement>(null)

  // Aceternity UI mock container scroll reveal calculation
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })

  const rotateX = useTransform(scrollYProgress, [0, 0.8], [15, 0])
  const scale = useTransform(scrollYProgress, [0, 0.8], [0.92, 1])
  const translate = useTransform(scrollYProgress, [0, 0.8], [0, -10])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)

    // Default to light theme for crisp/clean contrast
    document.documentElement.classList.remove('dark')

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      if (next === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      return next
    })
  }

  // Mockup Tabs content renderer
  const renderMockupContent = () => {
    switch (activeTab) {
      case 'analytics':
        return (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4 text-slate-350 h-full flex flex-col justify-between"
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">AI Logistics Predictor</span>
              <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-brand-cyan/10 text-brand-cyan">Mode IA Actif</span>
            </div>

            <div className="grid grid-cols-2 gap-3 flex-1 my-2">
              <div className="p-3 bg-slate-900/60 border border-slate-850 rounded-xl flex flex-col justify-between">
                <span className="text-[8px] text-slate-500 uppercase tracking-widest font-black">Rotation des Stocks</span>
                <span className="text-xl font-serif font-black text-white">+18.4%</span>
                <span className="text-[8px] text-emerald-400 font-bold">Optimisé par IA</span>
              </div>
              <div className="p-3 bg-slate-900/60 border border-slate-850 rounded-xl flex flex-col justify-between">
                <span className="text-[8px] text-slate-500 uppercase tracking-widest font-black">Coûts de Transport</span>
                <span className="text-xl font-serif font-black text-rose-500">-35.1%</span>
                <span className="text-[8px] text-rose-400 font-bold">Moins de surstock</span>
              </div>
            </div>

            <div className="bg-brand-cyan/5 border border-brand-cyan/10 rounded-xl p-3 flex items-center justify-between">
              <div>
                <h4 className="text-[10px] font-black text-brand-cyan flex items-center gap-1.5"><Sparkles size={11} /> Recommandation IA</h4>
                <p className="text-[8px] text-slate-500">Transférer 45 cartons de Catégorie A vers l'Entrepôt Nord sous 24h.</p>
              </div>
              <button className="h-6.5 text-[9px] rounded-lg px-3 bg-brand-cyan hover:bg-brand-cyan/90 text-white cursor-pointer font-bold transition-all shrink-0">Exécuter</button>
            </div>
          </motion.div>
        )
      case 'charts':
        return (
          <motion.div
            key="charts"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3 text-slate-350 h-full flex flex-col justify-between"
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Activité & Flux Logistique</span>
              <div className="flex gap-2"><div className="w-8 h-2 bg-slate-800 rounded-full" /><div className="w-8 h-2 bg-brand-cyan rounded-full" /></div>
            </div>

            <div className="flex-1 flex items-end gap-1.5 pt-4">
              {[30, 50, 20, 70, 45, 90, 60, 40, 85, 30, 95, 65].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-slate-850 rounded-t transition-all duration-500" style={{ height: `${h * 0.3}px` }} />
                  <div className="w-full bg-brand-cyan/80 rounded-t transition-all duration-500" style={{ height: `${h * 0.5}px` }} />
                </div>
              ))}
            </div>

            <div className="flex justify-between text-[8px] text-slate-500 mt-2 font-mono">
              <span>JAN</span>
              <span>MAR</span>
              <span>MAY</span>
              <span>JUL</span>
              <span>SEP</span>
              <span>NOV</span>
            </div>
          </motion.div>
        )
      case 'datasets':
        return (
          <motion.div
            key="datasets"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3 text-slate-350 h-full flex flex-col justify-between"
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Gestionnaire de Produits</span>
              <button className="h-6 text-[8px] rounded-lg px-2 bg-white text-black hover:bg-slate-200 font-bold">Ajouter</button>
            </div>

            <div className="space-y-1.5 flex-1 my-2 overflow-hidden">
              {[
                { ref: "PRD-2034", name: "Capteur Laser Pro", qty: "145 pcs", status: "Optimal", color: "text-emerald-400" },
                { ref: "PRD-9812", name: "Module Contrôle v4", qty: "12 pcs", status: "Critique", color: "text-rose-500" },
                { ref: "PRD-5621", name: "Câble Blindé 10m", qty: "450 pcs", status: "Optimal", color: "text-emerald-400" }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-850 text-[9px] font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-550 font-bold">{item.ref}</span>
                    <span className="text-white font-sans font-semibold">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">{item.qty}</span>
                    <span className={`font-bold ${item.color}`}>{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )
      case 'workflows':
        return (
          <motion.div
            key="workflows"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3 text-slate-350 h-full flex flex-col justify-between"
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">AI Workflows Automatisés</span>
              <span className="text-[8px] font-black text-emerald-400">3 Règles actives</span>
            </div>

            <div className="space-y-2 flex-1 my-2">
              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-900/40 border border-slate-850/60">
                <div className="size-5 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mt-0.5 shrink-0"><CheckCircle2 size={11} /></div>
                <div>
                  <h5 className="text-[9px] font-black text-white leading-none">Règle #1 : Réappro automatique</h5>
                  <p className="text-[8px] text-slate-500 mt-1">Déclenché si stock &lt; 20 pcs. Commande envoyée à Vendeur A.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-900/40 border border-slate-850/60">
                <div className="size-5 rounded-lg bg-brand-cyan/10 text-brand-cyan flex items-center justify-center mt-0.5 shrink-0"><Zap size={11} /></div>
                <div>
                  <h5 className="text-[9px] font-black text-white leading-none">Règle #2 : Alerte de fluctuation</h5>
                  <p className="text-[8px] text-slate-500 mt-1">Notification instantanée si les prix fournisseurs varient de 5%.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )
      case 'insights':
        return (
          <motion.div
            key="insights"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3 text-slate-350 h-full flex flex-col justify-between"
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Panneau d'Insights Globaux</span>
              <span className="text-[8px] font-bold text-brand-cyan flex items-center gap-1"><Sparkles size={9} /> Haute Résilience</span>
            </div>

            <div className="flex-1 flex flex-col gap-2 my-1.5 justify-center">
              <div className="p-2.5 bg-slate-900/80 border border-slate-850 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-2.5 rounded-full bg-emerald-500" />
                  <span className="text-[9px] text-slate-350 font-bold">Niveau optimal atteint</span>
                </div>
                <span className="text-[9px] font-mono text-emerald-400 font-bold">96%</span>
              </div>
              <div className="p-2.5 bg-slate-900/80 border border-slate-850 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-2.5 rounded-full bg-brand-cyan animate-ping" />
                  <span className="text-[9px] text-slate-350 font-bold">Resilience Supply Chain</span>
                </div>
                <span className="text-[9px] font-mono text-brand-cyan font-bold">Excellente</span>
              </div>
            </div>

            <p className="text-[7.5px] text-slate-550 leading-tight">Mises à jour quotidiennes basées sur les tendances logistiques régionales et le comportement des prestataires.</p>
          </motion.div>
        )
      case 'admin':
        return (
          <motion.div
            key="admin"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3 text-slate-350 h-full flex flex-col justify-between"
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aperçu Dépôt Admin</span>
              <div className="flex items-center gap-1.5">
                <div className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[8px] text-slate-400">Services OK</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 flex-1 my-1">
              <div className="p-2 bg-slate-900/60 border border-slate-850 rounded-xl flex flex-col justify-between text-center">
                <span className="text-[7px] text-slate-500 font-bold uppercase">Utilisateurs</span>
                <span className="text-xs font-black text-white">148</span>
              </div>
              <div className="p-2 bg-slate-900/60 border border-slate-850 rounded-xl flex flex-col justify-between text-center">
                <span className="text-[7px] text-slate-500 font-bold uppercase">Charge Serv.</span>
                <span className="text-xs font-black text-brand-cyan">24%</span>
              </div>
              <div className="p-2 bg-slate-900/60 border border-slate-850 rounded-xl flex flex-col justify-between text-center">
                <span className="text-[7px] text-slate-500 font-bold uppercase">Sync. DB</span>
                <span className="text-xs font-black text-emerald-400">99%</span>
              </div>
            </div>

            <div className="bg-slate-900/30 rounded-lg p-2 border border-slate-850/60">
              <span className="text-[7px] font-black uppercase text-slate-500 block mb-1">Dernières Actions Système</span>
              <div className="flex justify-between text-[7px] font-mono text-slate-400">
                <span>[Scan Barcode] OK - PRD-2034</span>
                <span className="text-slate-600">il y a 2m</span>
              </div>
            </div>
          </motion.div>
        )
    }
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 overflow-x-hidden font-sans relative ${theme === 'dark'
      ? 'bg-brand-bg text-brand-white selection:bg-brand-cyan/30'
      : 'bg-brand-light-grey text-brand-dark-grey selection:bg-brand-cyan/20'
      }`}>

      {/* Interactive Neural Network Particles Background */}
      <ParticlesBackground theme={theme} />

      {/* Decorative Grid Overlay (Linear/Vercel style) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      {/* Decorative Floating Lights (Aceternity UI Sparkles effect) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[150px] opacity-20 transition-colors duration-500 ${theme === 'dark' ? 'bg-brand-cyan/30' : 'bg-brand-cyan/20'
          }`} />
        <div className={`absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full blur-[130px] opacity-20 transition-colors duration-500 ${theme === 'dark' ? 'bg-brand-cyan/20' : 'bg-brand-cyan/10'
          }`} />
        <div className={`absolute bottom-1/4 left-1/3 w-[700px] h-[700px] rounded-full blur-[180px] opacity-15 transition-colors duration-500 ${theme === 'dark' ? 'bg-brand-cyan/15' : 'bg-brand-cyan/10'
          }`} />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled
        ? theme === 'dark'
          ? 'bg-brand-bg/80 backdrop-blur-xl border-b border-brand-slate py-3 shadow-lg shadow-black/20'
          : 'bg-brand-white/80 backdrop-blur-xl border-b border-brand-muted/80 py-3 shadow-sm'
        : 'bg-transparent py-5'
        }`}>
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">

            <DepotManagerLogo size="lg" />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className={`text-sm font-semibold transition-colors ${theme === 'dark' ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>Fonctionnalités</Link>
            <Link href="#solutions" className={`text-sm font-semibold transition-colors ${theme === 'dark' ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>Solutions</Link>
            <Link href="#about" className={`text-sm font-semibold transition-colors ${theme === 'dark' ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>À Propos</Link>
            <Link href="#pricing" className={`text-sm font-semibold transition-colors ${theme === 'dark' ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>Tarifs</Link>
            <Link href="#faq" className={`text-sm font-semibold transition-colors ${theme === 'dark' ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>FAQ</Link>
            <Link href="#contact" className={`text-sm font-semibold transition-colors ${theme === 'dark' ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>Contact</Link>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

            {/* Premium Theme Switcher */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className={`p-2.5 rounded-full border transition-all duration-300 cursor-pointer shadow-md backdrop-blur-md ${theme === 'dark'
                ? 'border-slate-800 bg-slate-900/60 text-yellow-400 hover:bg-slate-800'
                : 'border-slate-200/80 bg-white/80 text-brand-cyan hover:bg-slate-50'
                }`}
            >
              <AnimatePresence mode="wait" initial={false}>
                {theme === 'dark' ? (
                  <motion.div key="sun" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                    <Sun className="size-4.5" />
                  </motion.div>
                ) : (
                  <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                    <Moon className="size-4.5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            <div className="flex items-center gap-3 ml-2">
              <Link href="/login" className={`text-sm font-bold transition-colors ${theme === 'dark' ? 'text-white hover:text-brand-cyan' : 'text-slate-700 hover:text-brand-cyan'}`}>Connexion</Link>
              <Link href="/register" className="bg-black dark:bg-white text-white dark:text-black hover:bg-slate-850 dark:hover:bg-slate-100 rounded-full px-5.5 py-2 text-xs font-bold shadow-md transition-all duration-300 hover:scale-[1.03]">
                Essai Gratuit
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full border ${theme === 'dark' ? 'border-slate-800 bg-slate-900 text-yellow-400' : 'border-slate-200 bg-white text-brand-cyan shadow-sm'}`}
            >
              {theme === 'dark' ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
            </button>
            <button className={`${theme === 'dark' ? 'text-white' : 'text-slate-850'}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed inset-0 z-40 backdrop-blur-3xl pt-24 px-6 flex flex-col gap-6 md:hidden ${theme === 'dark' ? 'bg-slate-950/95 text-white' : 'bg-white/95 text-slate-900'
              }`}
          >
            <Link href="#features" onClick={() => setMobileMenuOpen(false)} className={`text-2xl font-bold border-b pb-4 ${theme === 'dark' ? 'border-slate-900' : 'border-slate-100'}`}>Fonctionnalités</Link>
            <Link href="#solutions" onClick={() => setMobileMenuOpen(false)} className={`text-2xl font-bold border-b pb-4 ${theme === 'dark' ? 'border-slate-900' : 'border-slate-100'}`}>Solutions</Link>
            <Link href="#about" onClick={() => setMobileMenuOpen(false)} className={`text-2xl font-bold border-b pb-4 ${theme === 'dark' ? 'border-slate-900' : 'border-slate-100'}`}>À Propos</Link>
            <Link href="#pricing" onClick={() => setMobileMenuOpen(false)} className={`text-2xl font-bold border-b pb-4 ${theme === 'dark' ? 'border-slate-900' : 'border-slate-100'}`}>Tarifs</Link>
            <Link href="#faq" onClick={() => setMobileMenuOpen(false)} className={`text-2xl font-bold border-b pb-4 ${theme === 'dark' ? 'border-slate-900' : 'border-slate-100'}`}>FAQ</Link>
            <Link href="#contact" onClick={() => setMobileMenuOpen(false)} className={`text-2xl font-bold border-b pb-4 ${theme === 'dark' ? 'border-slate-900' : 'border-slate-100'}`}>Contact</Link>
            <div className="flex flex-col gap-4 mt-8">
              <Link href="/login" className={`flex items-center justify-center h-14 rounded-2xl text-lg font-bold border transition-all ${theme === 'dark' ? 'border-slate-800 text-white bg-slate-900/40 hover:bg-slate-900' : 'border-slate-200 text-slate-800 bg-white hover:bg-slate-50'}`}>
                Se Connecter
              </Link>
              <Link href="/register" className="flex items-center justify-center bg-brand-cyan hover:bg-brand-cyan/90 text-white h-14 rounded-2xl text-lg font-bold">
                Commencer Gratuitement
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero / Container Scroll Reveal Section */}
      <section ref={heroRef} className="relative pt-32 pb-16 md:pt-44 md:pb-24 px-6 z-10 flex flex-col items-center">
        <div className="container mx-auto text-center max-w-5xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider mb-8 backdrop-blur-md ${theme === 'dark'
              ? 'bg-brand-bg/60 border-brand-slate text-brand-cyan shadow-lg shadow-black/10'
              : 'bg-brand-white/80 border-brand-muted text-brand-cyan shadow-sm'
              }`}
          >
            <Sparkles size={13} className="text-brand-cyan animate-spin-slow" />
            Nouveau : Moteur d'IA Predictive & Optimisation logistique active
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[1.05]"
          >
            Gérez votre dépôt avec <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan via-[#4dbeee] to-brand-white">l'intelligence absolue.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`text-base sm:text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed ${theme === 'dark' ? 'text-brand-muted' : 'text-brand-dark-grey'
              }`}
          >
            DEPOT MANAGER combine des algorithmes de pointe, des flux analytiques et une interface premium pour transformer votre logistique en levier de croissance.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto sm:max-w-none"
          >
            <Link href="/register" className="flex items-center justify-center h-13 px-8 rounded-full bg-brand-cyan text-brand-bg hover:bg-brand-cyan/95 font-bold text-base shadow-lg transition-transform hover:scale-[1.03] w-full sm:w-auto">
              Créer un compte gratuit <ArrowRight className="ml-2 size-4" />
            </Link>
            <Link href="/contact" className={`flex items-center justify-center h-13 px-8 rounded-full font-bold text-base transition-all w-full sm:w-auto border ${theme === 'dark'
              ? 'border-brand-slate text-brand-white bg-brand-bg/30 hover:bg-brand-bg'
              : 'border-brand-muted text-brand-dark-grey bg-brand-white hover:bg-brand-light-grey'
              }`}>
              <Play className="mr-2 size-4 text-brand-cyan fill-current" /> Voir la démo
            </Link>
          </motion.div>
        </div>


        {/* Aceternity UI Container Scroll Reveal Mockup (Tabbed Mockups) */}
        <motion.div
          style={{
            rotateX: rotateX,
            scale: scale,
            translateY: translate,
            transformStyle: "preserve-3d"
          }}
          className="mt-16 md:mt-24 relative max-w-5xl w-full mx-auto px-2 md:px-0 pointer-events-auto"
        >
          <div className="absolute -inset-1 rounded-2xl md:rounded-[2rem] bg-gradient-to-r from-brand-cyan to-slate-400 opacity-20 blur-xl pointer-events-none" />

          {/* Interactive Mockup Tabs Switcher */}
          <div className="flex flex-wrap justify-center gap-2 mb-4 relative z-20">
            {[
              { id: 'analytics', label: 'Analyses IA', icon: Brain },
              { id: 'charts', label: 'Graphiques', icon: BarChart3 },
              { id: 'datasets', label: 'Datasets', icon: FileSpreadsheet },
              { id: 'workflows', label: 'Workflows', icon: Cpu },
              { id: 'insights', label: 'Insights IA', icon: Sparkles },
              { id: 'admin', label: 'Console Admin', icon: ShieldAlert }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`h-9 px-4 text-xs font-bold rounded-full transition-all cursor-pointer flex items-center ${activeTab === tab.id
                  ? 'bg-brand-cyan text-white shadow-md'
                  : theme === 'dark'
                    ? 'bg-slate-900/80 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-850'
                    : 'bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
              >
                <tab.icon className="size-3.5 mr-1.5 shrink-0" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className={`rounded-2xl md:rounded-[2rem] border p-2 md:p-3 backdrop-blur-2xl shadow-2xl overflow-hidden relative ${theme === 'dark' ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200/80 bg-white/70 shadow-brand-cyan/5'
            }`}>
            <div className={`rounded-xl md:rounded-[1.6rem] overflow-hidden relative shadow-inner aspect-[16/10] bg-slate-950 flex items-center justify-center border ${theme === 'dark' ? 'border-slate-950' : 'border-slate-100'
              }`}>
              {/* Premium Dashboard Layout Mockup */}
              <div className="absolute inset-0 bg-slate-950 p-4 flex flex-col gap-4 text-left font-sans select-none overflow-hidden scale-[1.002]">
                {/* Header mock */}
                <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-red-500" />
                    <div className="size-2 rounded-full bg-yellow-500" />
                    <div className="size-2 rounded-full bg-green-500" />
                    <span className="text-[10px] text-slate-650 font-mono ml-2">https://app.edepot.manager/dashboard/{activeTab}</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-16 h-4 bg-slate-905 rounded-full animate-pulse" />
                    <div className="w-8 h-4 bg-brand-cyan/20 rounded-full" />
                  </div>
                </div>
                {/* Content mock */}
                <div className="grid grid-cols-4 gap-4 flex-1">
                  {/* Sidebar mock */}
                  <div className="col-span-1 border-r border-slate-900 pr-4 flex flex-col gap-2.5">
                    <div className={`h-6 w-full rounded-lg flex items-center px-2 transition-colors ${activeTab === 'analytics' ? 'bg-slate-900 text-brand-cyan' : 'bg-transparent text-slate-400'}`}><Brain className="size-3 mr-2 shrink-0" /><span className="text-[9px] font-bold">Analyses IA</span></div>
                    <div className={`h-6 w-full rounded-lg flex items-center px-2 transition-colors ${activeTab === 'charts' ? 'bg-slate-900 text-brand-cyan' : 'bg-transparent text-slate-400'}`}><BarChart3 className="size-3 mr-2 shrink-0" /><span className="text-[9px] font-bold">Graphiques</span></div>
                    <div className={`h-6 w-full rounded-lg flex items-center px-2 transition-colors ${activeTab === 'datasets' ? 'bg-slate-900 text-brand-cyan' : 'bg-transparent text-slate-400'}`}><FileSpreadsheet className="size-3 mr-2 shrink-0" /><span className="text-[9px] font-bold">Datasets</span></div>
                    <div className={`h-6 w-full rounded-lg flex items-center px-2 transition-colors ${activeTab === 'workflows' ? 'bg-slate-900 text-brand-cyan' : 'bg-transparent text-slate-400'}`}><Cpu className="size-3 mr-2 shrink-0" /><span className="text-[9px] font-bold">Workflows</span></div>
                    <div className={`h-6 w-full rounded-lg flex items-center px-2 transition-colors ${activeTab === 'insights' ? 'bg-slate-900 text-brand-cyan' : 'bg-transparent text-slate-400'}`}><Sparkles className="size-3 mr-2 shrink-0" /><span className="text-[9px] font-bold">Insights IA</span></div>
                    <div className={`h-6 w-full rounded-lg flex items-center px-2 transition-colors ${activeTab === 'admin' ? 'bg-slate-900 text-brand-cyan' : 'bg-transparent text-slate-400'}`}><ShieldAlert className="size-3 mr-2 shrink-0" /><span className="text-[9px] font-bold">Console Admin</span></div>
                  </div>
                  {/* Active tab content container */}
                  <div className="col-span-3 flex flex-col justify-between p-3.5 bg-slate-900/20 border border-slate-900 rounded-xl relative overflow-hidden">
                    <AnimatePresence mode="wait">
                      {renderMockupContent()}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Trusted By (With smooth hover effects) */}
      <section className={`py-12 border-y transition-colors duration-500 ${theme === 'dark' ? 'border-slate-900 bg-slate-950/40' : 'border-slate-200/60 bg-white/40 shadow-sm'
        }`}>
        <div className="container mx-auto px-6 text-center">
          <p className={`text-xs font-black uppercase tracking-widest mb-8 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Ils font confiance à notre plateforme</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 grayscale dark:invert-0 hover:grayscale-0 transition-all duration-300">
            {['Acme Corp', 'Global Logistics', 'TechFlow', 'Quantum', 'Nexus'].map((name, i) => (
              <div
                key={i}
                className={`text-xl md:text-2xl font-black font-serif italic tracking-tighter cursor-pointer hover:scale-105 transition-transform ${theme === 'dark' ? 'text-white' : 'text-slate-800'
                  }`}
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid (With 3D Hover Cards - Aceternity Card) */}
      <section id="features" className="py-24 px-6 relative z-10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">Conçu pour l'excellence opérationnelle.</h2>
            <p className={`max-w-2xl mx-auto text-base sm:text-lg ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              Tout ce dont vous avez besoin pour piloter vos stocks et vos équipes, dans une interface minimaliste d'exception.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Brain, title: "IA Prédictive", desc: "Anticipez les ruptures de stock grâce à nos algorithmes d'apprentissage automatique.", color: "from-brand-cyan/10 to-brand-cyan/5" },
              { icon: Zap, title: "Mouvements Temps Réel", desc: "Suivi des flux logistiques et mises à jour instantanées de l'inventaire en temps réel.", color: "from-brand-cyan/10 to-brand-cyan/5" },
              { icon: BarChart3, title: "Analyses de Shadcn UI", desc: "Tableaux de bord interactifs et superbes graphiques pastel personnalisables.", color: "from-blue-500/10 to-blue-650/10" },
              { icon: Shield, title: "Sécurité & Rôles", desc: "Traçabilité complète des actions, permissions précises et authentification forte.", color: "from-rose-500/10 to-rose-650/10" },
              { icon: Globe, title: "Multi-Entrepôts", desc: "Gérez plusieurs sites de stockage et transferts inter-dépôts en un seul point.", color: "from-emerald-500/10 to-emerald-650/10" },
              { icon: Users, title: "RH & Collaborateurs", desc: "Suivez les performances de votre équipe et optimisez la dynamique humaine.", color: "from-amber-500/10 to-amber-650/10" },
            ].map((f, i) => (
              <Card3D
                key={i}
                theme={theme}
                className={`rounded-3xl p-8 border transition-all duration-300 cursor-pointer h-full ${theme === 'dark'
                  ? 'bg-slate-900/40 border-slate-800 hover:border-slate-700/80 hover:bg-slate-900/60'
                  : 'bg-white border-slate-200/80 shadow-sm hover:border-slate-300 hover:shadow-md'
                  }`}
              >
                <div className={`size-12 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br ${f.color} ${theme === 'dark' ? 'text-brand-cyan' : 'text-brand-cyan'
                  }`}>
                  <f.icon className="size-5" />
                </div>
                <h3 className="text-xl font-bold mb-3 tracking-tight">{f.title}</h3>
                <p className={`leading-relaxed text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{f.desc}</p>
              </Card3D>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions / Feature Focus Section */}
      <section id="solutions" className="py-20 px-6 relative overflow-hidden">
        <div className="container mx-auto max-w-5xl">
          <div className={`rounded-3xl border p-8 md:p-12 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden ${theme === 'dark' ? 'border-slate-900 bg-slate-900/20' : 'border-slate-200/60 bg-white shadow-sm'
            }`}>
            <div className="flex-1 space-y-6">
              <span className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-brand-cyan'}`}>Technologie Intelligente</span>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">Optimisez vos commandes grâce à notre moteur prédictif.</h2>
              <p className={`text-sm md:text-base leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                Notre système analyse en temps réel les flux d'entrées et de sorties pour générer des alertes de stock intelligentes avant même qu'une rupture ne survienne. Réduisez vos coûts logistiques jusqu'à 35%.
              </p>
              <div className="flex flex-col gap-3">
                {[
                  "Algorithmes d'apprentissage automatique avancés",
                  "Intégration instantanée avec vos bases de produits",
                  "Rapports automatisés exportables en CSV"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    <span className="text-sm font-semibold">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3D Floating Mockup Side */}
            <div className="flex-1 w-full flex items-center justify-center relative">
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                className={`w-full max-w-[320px] aspect-[4/3] rounded-2xl border p-4 shadow-2xl ${theme === 'dark' ? 'border-slate-800 bg-slate-950/80 shadow-black/40' : 'border-slate-200 bg-white shadow-brand-cyan/5'
                  }`}
              >
                <div className="flex justify-between items-center border-b border-slate-900 pb-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Database className="size-3 text-brand-cyan" />
                    <span className="text-[10px] text-slate-500 font-mono">IA Reorder Engine</span>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">Actif</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400">Stock Minimum :</span>
                    <span className="font-bold">120 pcs</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400">Stock Actuel :</span>
                    <span className="text-rose-500 font-bold">45 pcs (Faible)</span>
                  </div>
                  <div className="h-px bg-slate-900 my-2" />
                  <span className="text-[8px] uppercase tracking-widest text-slate-500 font-black">Suggestion IA</span>
                  <div className="bg-brand-cyan/5 border border-brand-cyan/10 rounded-xl p-2.5 flex items-center justify-between mt-1">
                    <div>
                      <h4 className="text-[10px] font-black text-brand-cyan">Commander 150 unités</h4>
                      <p className="text-[8px] text-slate-500">Délai estimé : 2 jours (Vendeur A)</p>
                    </div>
                    <button className="h-6 text-[9px] rounded-lg px-2 bg-brand-cyan hover:bg-brand-cyan/90 text-white font-bold transition-all cursor-pointer">Accepter</button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section (New - requested) */}
      <section id="about" className="py-24 px-6 relative z-10">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <span className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-brand-cyan'}`}>Qui Sommes-Nous</span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mt-4 mb-6">Réinventer la logistique par la data.</h2>
            <p className={`max-w-2xl mx-auto text-base sm:text-lg ${theme === 'dark' ? 'text-slate-400' : 'text-slate-650'}`}>
              DEPOT MANAGER est né de la vision de simplifier et de moderniser le quotidien des entrepôts grâce à des interfaces premium et des outils intelligents.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold tracking-tight">Une technologie pensée pour les humains.</h3>
              <p className={`text-sm md:text-base leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                Nos solutions ne se contentent pas d'afficher des données; elles les rendent actionnables. Inspirés par les design systems de Stripe, Vercel et Apple, nous mettons le design et la fluidité au service de votre rentabilité logistique.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <h4 className="text-2xl font-black text-brand-cyan">99.9%</h4>
                  <p className="text-xs text-slate-500 mt-1 font-semibold">Taux de disponibilité</p>
                </div>
                <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <h4 className="text-2xl font-black text-brand-cyan">-35%</h4>
                  <p className="text-xs text-slate-500 mt-1 font-semibold">De pertes de stock</p>
                </div>
              </div>
            </div>

            <div className={`p-8 rounded-3xl border flex flex-col justify-between gap-6 ${theme === 'dark' ? 'bg-slate-900/20 border-slate-900' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-brand-cyan/10 flex items-center justify-center text-brand-cyan shrink-0"><Sparkles size={18} /></div>
                <div>
                  <h4 className="font-bold text-sm">Design & Performance</h4>
                  <p className="text-slate-500 text-xs">Des transitions ultra-fluides en 60 FPS.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0"><Shield size={18} /></div>
                <div>
                  <h4 className="font-bold text-sm">Confidentialité & RGPD</h4>
                  <p className="text-slate-500 text-xs">Données cryptées en transit et au repos.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-brand-cyan/10 flex items-center justify-center text-brand-cyan shrink-0"><ArrowUpRight size={18} /></div>
                <div>
                  <h4 className="font-bold text-sm">Évolutivité garantie</h4>
                  <p className="text-slate-500 text-xs">Prêt pour les structures multi-sites.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Infinite Testimonials Slider (Aceternity UI Infinite Moving Cards) */}
      <section className="py-20 overflow-hidden relative">
        <div className="container mx-auto px-6 text-center max-w-4xl mb-16">
          <h2 className="text-2xl md:text-4xl font-black tracking-tight mb-4">Recommandé par les leaders du secteur.</h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Plus de 50M de produits tracés avec un taux de satisfaction exceptionnel.</p>
        </div>

        {/* Marquee Row */}
        <div className="flex relative w-full overflow-hidden before:absolute before:left-0 before:top-0 before:bottom-0 before:w-20 before:bg-gradient-to-r before:from-slate-950/0 before:to-transparent before:z-10 after:absolute after:right-0 after:top-0 after:bottom-0 after:w-20 after:bg-gradient-to-l after:from-slate-950/0 after:to-transparent after:z-10">
          <motion.div
            className="flex gap-6 w-max py-4"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
          >
            {[
              { text: "L'IA prédictive nous a permis de réduire nos ruptures de stock de 85% en moins de trois mois.", author: "Marie Dubois", role: "Directrice Logistique, TechFlow" },
              { text: "Une interface magnifique et intuitive. Nos équipes ont été formées en une seule journée.", author: "Karim Hassan", role: "Supply Chain Manager, Global Logistics" },
              { text: "Les analyses en temps réel de DEPOT MANAGER sont devenues indispensables pour notre prise de décision.", author: "Sophie Martin", role: "CEO, Nexus Retail" },
              { text: "L'IA prédictive nous a permis de réduire nos ruptures de stock de 85% en moins de trois mois.", author: "Marie Dubois", role: "Directrice Logistique, TechFlow" },
              { text: "Une interface magnifique et intuitive. Nos équipes ont été formées en une seule journée.", author: "Karim Hassan", role: "Supply Chain Manager, Global Logistics" },
              { text: "Les analyses en temps réel de DEPOT MANAGER sont devenues indispensables pour notre prise de décision.", author: "Sophie Martin", role: "CEO, Nexus Retail" }
            ].map((t, i) => (
              <div
                key={i}
                className={`p-6 rounded-2xl border w-[320px] shrink-0 flex flex-col justify-between ${theme === 'dark'
                  ? 'bg-slate-900/30 border-slate-800/80 text-white'
                  : 'bg-white border-slate-200 text-slate-800 shadow-sm'
                  }`}
              >
                <div>
                  <div className="flex gap-1 text-brand-cyan mb-4">
                    {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="size-3 fill-current" />)}
                  </div>
                  <p className={`italic text-xs leading-relaxed mb-6 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>"{t.text}"</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-brand-cyan/25 flex items-center justify-center font-bold text-brand-cyan text-xs shrink-0">
                    {t.author.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs">{t.author}</h4>
                    <p className="text-slate-500 text-[10px]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section id="pricing" className="py-24 px-6 relative z-10">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">Des tarifs clairs et évolutifs.</h2>
            <p className={`max-w-xl mx-auto text-base ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              Démarrez gratuitement pendant 14 jours, puis faites évoluer votre offre en fonction de vos besoins logistiques.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Starter", price: "0", desc: "Pour les petits commerces et start-ups.", features: ["Jusqu'à 1 000 produits", "1 Entrepôt logistique", "Suivi basique des stocks"], popular: false },
              { name: "Pro", price: "49", desc: "Pour les PME en pleine expansion.", features: ["Produits illimités", "5 Entrepôts logistiques", "IA Prédictive & Reorder Engine", "Support prioritaire 24/7"], popular: true },
              { name: "Entreprise", price: "199", desc: "Pour les grandes plateformes logistiques.", features: ["Entrepôts illimités", "IA Custom & Intégrations API", "Analyses avancées sur mesure", "Gestionnaire de compte dédié"], popular: false },
            ].map((plan, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -6 }}
                className={`p-8 rounded-[2rem] border flex flex-col justify-between ${plan.popular
                  ? 'border-brand-cyan bg-brand-bg/20 relative shadow-xl shadow-brand-cyan/5'
                  : theme === 'dark'
                    ? 'border-slate-800 bg-slate-900/40'
                    : 'border-slate-200 bg-white shadow-sm'
                  }`}
              >
                {plan.popular && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-cyan text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">Le plus choisi</div>}

                <div>
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-2 tracking-tight">{plan.name}</h3>
                    <p className={`text-xs h-10 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{plan.desc}</p>
                  </div>

                  <div className="mb-8 flex items-baseline gap-1.5">
                    <span className="text-5xl font-black tracking-tight">{plan.price}€</span>
                    <span className="text-slate-400 text-sm">/mois</span>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-3 text-xs font-semibold">
                        <CheckCircle2 className="size-4.5 text-brand-cyan shrink-0" />
                        <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button className={`w-full h-12 rounded-xl font-bold transition-all cursor-pointer ${plan.popular
                  ? 'bg-brand-cyan hover:bg-brand-cyan/90 text-white shadow-lg shadow-brand-cyan/10'
                  : theme === 'dark'
                    ? 'bg-slate-800 hover:bg-slate-700 text-white border-none'
                    : 'bg-black hover:bg-slate-800 text-white'
                  }`}>
                  Choisir ce plan
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section (New - requested) */}
      <section id="faq" className="py-24 px-6 relative z-10">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <span className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-brand-cyan'}`}>Questions Fréquentes</span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mt-4 mb-6">Des réponses à vos questions.</h2>
            <p className={`max-w-xl mx-auto text-base ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              Apprenez-en plus sur DEPOT MANAGER, l’intégration de l’IA et la sécurité de vos informations logistiques.
            </p>
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            <FAQItem
              theme={theme}
              question="Comment fonctionne l'IA prédictive de DEPOT MANAGER ?"
              answer="Notre module d'intelligence artificielle analyse en continu l'historique de vos ventes et de vos livraisons. En calculant les vitesses de rotation et en anticipant les fluctuations de la demande (ex: saisonnalité), l'IA est capable d'anticiper le point de commande optimal et d'éviter les ruptures de stock ou le surstockage inutile."
            />
            <FAQItem
              theme={theme}
              question="Est-il possible d'importer et exporter des données de produits ?"
              answer="Absolument. Notre plateforme supporte l'importation et l'exportation complètes au format CSV/Excel. De plus, notre API REST documentée vous permet de synchroniser automatiquement votre catalogue de produits et vos factures avec vos ERP tiers de manière sécurisée."
            />
            <FAQItem
              theme={theme}
              question="Mes données d'inventaire et d'employés sont-elles sécurisées ?"
              answer="La sécurité est notre priorité absolue. DEPOT MANAGER utilise un cryptage de haut niveau (AES-256) pour stocker vos données de stock, d'employés et de transactions. Les transferts de données se font exclusivement via des protocoles SSL/TLS sécurisés. Nous effectuons des sauvegardes quotidiennes automatisées."
            />
            <FAQItem
              theme={theme}
              question="Comment s'effectue le passage d'un plan à un autre ?"
              answer="Vous pouvez mettre à niveau ou rétrograder votre plan à tout moment directement depuis vos paramètres de facturation. Les changements sont calculés au prorata de votre utilisation mensuelle. Il n'y a aucun engagement de durée."
            />
          </div>
        </div>
      </section>

      {/* Contact Section (New - requested) */}
      <section id="contact" className="py-24 px-6 relative z-10">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <span className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-brand-cyan'}`}>Nous Contacter</span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mt-4 mb-6">Prêt à transformer vos opérations ?</h2>
            <p className={`max-w-xl mx-auto text-base ${theme === 'dark' ? 'text-slate-400' : 'text-slate-650'}`}>
              Notre équipe d'experts est disponible pour vous guider ou vous proposer une démonstration personnalisée.
            </p>
          </div>

          <div className="grid md:grid-cols-12 gap-8 items-start">
            {/* Contact info grid */}
            <div className="md:col-span-5 space-y-4">
              <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center gap-3">
                  <div className="size-8.5 rounded-lg bg-brand-cyan/10 text-brand-cyan flex items-center justify-center shrink-0"><Mail size={16} /></div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest">Email</h4>
                    <p className="text-xs md:text-sm font-semibold mt-0.5">support@edepot-manager.com</p>
                  </div>
                </div>
              </div>
              <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center gap-3">
                  <div className="size-8.5 rounded-lg bg-brand-cyan/10 text-brand-cyan flex items-center justify-center shrink-0"><Phone size={16} /></div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest">Téléphone</h4>
                    <p className="text-xs md:text-sm font-semibold mt-0.5">+33 (0)1 89 23 45 67</p>
                  </div>
                </div>
              </div>
              <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center gap-3">
                  <div className="size-8.5 rounded-lg bg-brand-cyan/10 text-brand-cyan flex items-center justify-center shrink-0"><MapPin size={16} /></div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest">Siège Social</h4>
                    <p className="text-xs md:text-sm font-semibold mt-0.5">8 Boulevard de la Logistique, Paris</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Glassmorphic Form */}
            <div className={`md:col-span-7 p-8 rounded-3xl border backdrop-blur-2xl shadow-xl ${theme === 'dark' ? 'border-slate-800 bg-slate-900/20' : 'border-slate-200/80 bg-white shadow-brand-cyan/5/30'
              }`}>
              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">Nom</label>
                    <input
                      type="text"
                      placeholder="Jean"
                      className={`w-full h-11 px-4 text-xs md:text-sm rounded-xl border focus:outline-none focus:ring-1 focus:ring-brand-cyan ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">Prénom</label>
                    <input
                      type="text"
                      placeholder="Dupont"
                      className={`w-full h-11 px-4 text-xs md:text-sm rounded-xl border focus:outline-none focus:ring-1 focus:ring-brand-cyan ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">Email</label>
                  <input
                    type="email"
                    placeholder="jean.dupont@entreprise.com"
                    className={`w-full h-11 px-4 text-xs md:text-sm rounded-xl border focus:outline-none focus:ring-1 focus:ring-brand-cyan ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">Message</label>
                  <textarea
                    rows={4}
                    placeholder="Comment pouvons-nous vous aider ?"
                    className={`w-full p-4 text-xs md:text-sm rounded-xl border focus:outline-none focus:ring-1 focus:ring-brand-cyan resize-none ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-brand-cyan hover:bg-brand-cyan/90 text-white font-bold text-xs md:text-sm shadow-md transition-transform hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare size={16} /> Envoyer le message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 relative z-10">
        <div className="container mx-auto max-w-5xl">
          <div className="p-10 md:p-16 rounded-[2.5rem] bg-gradient-to-br from-brand-bg via-slate-900 to-black relative overflow-hidden text-center shadow-xl">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none" />
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">Prêt à révolutionner votre logistique ?</h2>
              <p className="text-brand-cyan text-base md:text-lg">
                Rejoignez des milliers d'entreprises qui ont déjà fait le choix de l'intelligence artificielle pour leur gestion de stock.
              </p>
              <Link href="/register" className="inline-flex items-center justify-center h-14 px-10 rounded-full bg-white text-black hover:bg-slate-100 font-black text-base shadow-2xl transition-transform hover:scale-[1.03]">
                Essayer Gratuitement
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 border-t transition-colors duration-500 ${theme === 'dark' ? 'border-slate-900 bg-slate-950' : 'border-slate-200/80 bg-white'
        }`}>
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 space-y-4">
              <Link href="/" className="flex items-center gap-2">

                <DepotManagerLogo size="md" theme="light" />
              </Link>
              <p className="text-slate-500 text-xs max-w-xs leading-relaxed">
                Le logiciel SaaS de gestion de stock et d'entrepôt le plus avancé du marché, conçu avec une esthétique premium et propulsé par l'IA.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-4">Produit</h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li><Link href="#features" className="hover:text-brand-cyan transition-colors">Fonctionnalités</Link></li>
                <li><Link href="#pricing" className="hover:text-brand-cyan transition-colors">Tarifs</Link></li>
                <li><Link href="#" className="hover:text-brand-cyan transition-colors">Sécurité</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-4">Entreprise</h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li><Link href="#about" className="hover:text-brand-cyan transition-colors">À propos</Link></li>
                <li><Link href="#contact" className="hover:text-brand-cyan transition-colors">Contact</Link></li>
                <li><Link href="#" className="hover:text-brand-cyan transition-colors">Mentions légales</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-900/10 dark:border-slate-800/20 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-500">
            <p>© {new Date().getFullYear()} DEPOT MANAGER. Tous droits réservés.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link href="#" className="hover:text-brand-cyan transition-colors">Twitter</Link>
              <Link href="#" className="hover:text-brand-cyan transition-colors">LinkedIn</Link>
              <Link href="#" className="hover:text-brand-cyan transition-colors">GitHub</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
