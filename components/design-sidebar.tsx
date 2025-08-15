"use client"

import { Home, Layers, Calendar, Palette, Users, TrendingUp, Settings, Plus, Search } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navigationItems = [
  { title: "Studio", icon: Home, href: "/", color: "from-amber-400 to-orange-500" },
  { title: "Projects", icon: Layers, href: "/projects", color: "from-violet-400 to-purple-500" },
  { title: "Calendar", icon: Calendar, href: "/calendar", color: "from-blue-400 to-cyan-500" },
  { title: "Materials", icon: Palette, href: "/materials", color: "from-emerald-400 to-teal-500" },
  { title: "Clients", icon: Users, href: "/clients", color: "from-pink-400 to-rose-500" },
  { title: "Analytics", icon: TrendingUp, href: "/analytics", color: "from-indigo-400 to-blue-500" },
]

export function DesignSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
      <SidebarHeader className="p-6 border-b border-zinc-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
            <span className="text-black font-bold text-lg">T</span>
          </div>
          <div>
            <h1 className="font-playfair text-xl font-bold text-white">Techstyles</h1>
            <p className="text-xs text-zinc-400">Design Studio</p>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            placeholder="Search projects..."
            className="pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-400"
          />
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-6">
        <SidebarMenu className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  className={`h-12 px-4 rounded-xl transition-all duration-200 group ${
                    isActive 
                      ? 'bg-gradient-to-r ' + item.color + ' text-black font-semibold shadow-lg' 
                      : 'hover:bg-zinc-800/50 text-zinc-300 hover:text-white'
                  }`}
                >
                  <Link href={item.href} className="flex items-center gap-4">
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-black' : 'text-zinc-400 group-hover:text-white'}`} />
                    <span className="font-medium">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
        
        <div className="mt-8 pt-6 border-t border-zinc-800">
          <Button className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold hover:from-amber-500 hover:to-orange-600 rounded-xl h-12">
            <Plus className="w-5 h-5 mr-2" />
            New Project
          </Button>
        </div>
        
        <div className="mt-6">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Recent Projects</h3>
          <div className="space-y-2">
            {[
              { name: "Luxury Penthouse", color: "bg-violet-500", progress: 85 },
              { name: "Modern Office", color: "bg-emerald-500", progress: 60 },
              { name: "Boutique Hotel", color: "bg-rose-500", progress: 92 },
            ].map((project) => (
              <div key={project.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/30 cursor-pointer">
                <div className={`w-3 h-3 rounded-full ${project.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{project.name}</p>
                  <div className="w-full bg-zinc-800 rounded-full h-1 mt-1">
                    <div 
                      className={`h-1 rounded-full ${project.color}`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
