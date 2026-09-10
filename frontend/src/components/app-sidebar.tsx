"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Box,
  Truck,
  Users,
  Receipt,
  Building,
  Building2,
  ArrowLeftRight,
  RefreshCw,
  Tags,
  Scan,
  ShieldAlert,
  AlertTriangle,
  LogOut,
  Settings,
  User,
  TrendingUp,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { useAuth } from "@/context/AuthContext"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { SidebarLogo } from "@/components/Logo"

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  badge?: string;
  highlight?: boolean;
}

interface NavGroup {
  title: string;
  url: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  items?: NavItem[];
  isActive?: boolean;
}

const data: { navMain: NavGroup[] } = {
  navMain: [
    {
      title: "Tableau de Bord",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Stock & Inventaire",
      url: "#",
      icon: Box,
      items: [
        { title: "Produits", url: "/produits", icon: Box },
        { title: "Scanner Code-Barre", url: "/scanner", icon: Scan },
        { title: "Imprimer Étiquettes", url: "/etiquettes", icon: Tags },
        { title: "Fournisseurs", url: "/fournisseurs", icon: Truck },
      ],
    },
    {
      title: "CRM & Ventes",
      url: "#",
      icon: Users,
      items: [
        { title: "Clients", url: "/clients", icon: Users },
        { title: "Facturation", url: "/facturation", icon: Receipt },
        { title: "Commandes", url: "/commandes", icon: RefreshCw },
      ],
    },
    {
      title: "Logistique",
      url: "#",
      icon: Building,
      items: [
        { title: "Entrepôts", url: "/entrepots", icon: Building },
        { title: "Bâtiments", url: "/batiments", icon: Building2 },
        { title: "Transferts", url: "/transferts", icon: ArrowLeftRight },
      ],
    },

    {
      title: "Administration",
      url: "#",
      icon: ShieldAlert,
      items: [
        { title: "Employés", url: "/employes", icon: Users },
        { title: "Performance RH", url: "/employes/performance", icon: TrendingUp },
        { title: "Alertes Système", url: "/alertes", icon: AlertTriangle },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, profilePhoto, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  return (
    <Sidebar variant="inset" {...props}>
      {/* Header / Branding */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <SidebarLogo />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Navigation Content */}
      <SidebarContent>
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 px-2 mb-1">
              {item.title}
            </SidebarGroupLabel>
            <SidebarMenu>
              {item.items ? (
                item.items.map((subItem) => {
                  const isActive = pathname === subItem.url
                  return (
                    <SidebarMenuItem key={subItem.title}>
                      <SidebarMenuButton
                        render={<Link href={subItem.url} />}
                        tooltip={subItem.title}
                        isActive={isActive}
                        className={`group transition-all rounded-xl ${
                          subItem.highlight 
                            ? "text-brand-cyan dark:text-brand-cyan font-extrabold" 
                            : ""
                        } ${isActive ? "font-bold" : ""}`}
                      >
                        <div className={`size-7 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isActive 
                            ? "bg-slate-950 dark:bg-white text-white dark:text-slate-950" 
                            : subItem.highlight
                              ? "bg-brand-cyan/10 dark:bg-brand-bg/30 text-brand-cyan dark:text-brand-cyan"
                              : "bg-slate-100 dark:bg-slate-900 text-slate-500 group-hover:text-slate-900"
                        }`}>
                          {subItem.icon && <subItem.icon className="size-3.5" />}
                        </div>
                        <span className="truncate text-[13px]">{subItem.title}</span>
                        {subItem.badge && (
                          <span className="ml-auto text-[7px] font-black uppercase tracking-widest bg-brand-cyan/100/10 text-brand-cyan dark:text-brand-cyan px-1.5 py-0.5 rounded-full border border-brand-cyan/20">
                            {subItem.badge}
                          </span>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })
              ) : (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    tooltip={item.title}
                    isActive={pathname === item.url}
                  >
                    <div className={`size-7 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      pathname === item.url
                        ? "bg-slate-950 dark:bg-white text-white dark:text-slate-950"
                        : "bg-slate-100 dark:bg-slate-900 text-slate-500"
                    }`}>
                      {item.icon && <item.icon className="size-3.5" />}
                    </div>
                    <span className="text-[13px]">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer - User Menu */}
      <SidebarFooter className="border-t border-slate-100 dark:border-slate-900 pt-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger render={<SidebarMenuButton size="lg" className="rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900" />}>
                <div className="flex aspect-square size-9 items-center justify-center rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 shadow-md shrink-0">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-950 dark:bg-white text-white dark:text-slate-950 uppercase font-extrabold text-sm">
                      {user?.username?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-extrabold text-sm text-slate-900 dark:text-white">
                    {user?.username || "Utilisateur"}
                  </span>
                  <span className="truncate text-[10px] font-bold text-slate-400">
                    {user?.username || "admin"}@depot.ma
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl shadow-xl border-slate-100 dark:border-slate-800 p-2">
                <DropdownMenuItem className="rounded-xl py-2.5 cursor-pointer gap-2" onClick={() => router.push('/profile')}>
                  <User className="h-4 w-4 text-slate-500" /> Mon Profil
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl py-2.5 cursor-pointer gap-2" onClick={() => router.push('/parametres')}>
                  <Settings className="h-4 w-4 text-slate-500" /> Paramètres
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuItem
                  className="text-rose-600 dark:text-rose-400 rounded-xl py-2.5 cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-950/20 gap-2"
                  onClick={logout}
                >
                  <LogOut className="h-4 w-4" /> Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
