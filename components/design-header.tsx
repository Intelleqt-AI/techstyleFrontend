"use client"

import { Bell, Settings, User, ChevronDown, Sparkles, Share } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function DesignHeader() {
  return (
    <header className="h-16 border-b border-zinc-800 bg-zinc-900/30 backdrop-blur-xl flex items-center px-6 gap-4">
      <SidebarTrigger className="text-zinc-400 hover:text-white" />
      
      <div className="flex-1 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <h2 className="font-playfair text-lg font-bold text-white">Studio Dashboard</h2>
            <p className="text-xs text-zinc-400">Welcome back, Jane</p>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-400/10 to-orange-500/10 border border-amber-400/20 rounded-full">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-medium text-amber-400">AI Assistant Active</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
            <Share className="w-4 h-4" />
          </Button>
          
          <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-zinc-800 relative">
            <Bell className="w-4 h-4" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 px-3 py-2 hover:bg-zinc-800">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback className="bg-gradient-to-br from-violet-400 to-purple-500 text-white font-semibold">
                    JD
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="text-sm font-medium text-white">Jane Designer</p>
                  <p className="text-xs text-zinc-400">Senior Designer</p>
                </div>
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800">
              <DropdownMenuItem className="text-zinc-300 hover:text-white hover:bg-zinc-800">
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="text-zinc-300 hover:text-white hover:bg-zinc-800">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-800" />
              <DropdownMenuItem className="text-rose-400 hover:text-rose-300 hover:bg-zinc-800">
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
