'use client'

import { useEffect, useState } from "react"
import { User, Bell, Menu, Settings, Power, ChevronDown } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const Navbar: React.FC = () => {
  const [mounted, setMounted] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    setMounted(true)

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
      clearInterval(timeInterval)
    }
  }, [])

  if (!mounted) return null

  return (
    <>
      {/* Futuristic Navbar */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 ease-in-out
                   ${isScrolled 
                     ? 'bg-black/20 backdrop-blur-xl border-b border-cyan-500/20 shadow-[0_8px_32px_rgba(6,182,212,0.1)]' 
                     : 'bg-gradient-to-r from-black/10 via-purple-900/10 to-black/10 backdrop-blur-sm'
                   }`}
      >
        {/* Animated border gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent h-[1px] top-0" />
        
        <div className="flex justify-between items-center px-6 py-4">
          {/* Left Section */}
          <div className="flex items-center gap-6">
            {/* Futuristic Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="group relative p-3 rounded-xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 
                         border border-cyan-500/20 hover:border-cyan-400/40 transition-all duration-300
                         hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-105"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500/0 to-purple-500/0 
                              group-hover:from-cyan-500/10 group-hover:to-purple-500/10 transition-all duration-300" />
            </button>
            
            {/* Logo with glow effect */}
            <div className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 blur-sm opacity-50 group-hover:opacity-75 transition-opacity" />
                <Image 
                  src="/logo_polmatrix.png" 
                  alt="Polmatrix Logo" 
                  width={36} 
                  height={36} 
                  className="relative rounded-lg border border-cyan-500/30"
                />
              </div>
              
              <h1 className="text-2xl font-bold bg-gradient-to-r from-grey-400 via-purple-400 to-grey-400 
                             bg-clip-text text-transparent tracking-wider">
                POLMATRIX
              </h1>
            </div>

            {/* System Status Indicator */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full 
                            bg-green-500/10 border border-green-500/20">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-green-400 font-mono">SYSTEM ONLINE</span>
            </div>
          </div>
          
          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Time Display */}
            <div className="hidden md:flex flex-col items-end text-xs font-mono">
              <span className="text-cyan-400">{currentTime.toLocaleTimeString()}</span>
              <span className="text-cyan-400/60">{currentTime.toLocaleDateString()}</span>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {/* Settings */}
              <button className="p-2.5 rounded-xl bg-gradient-to-br from-slate-700/20 to-slate-800/20 
                                 border border-slate-600/20 hover:border-cyan-400/40 transition-all duration-300
                                 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] group">
                <Settings className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
              </button>

              {/* Notifications with pulse */}
              <button className="relative p-2.5 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 
                                 border border-orange-500/20 hover:border-orange-400/40 transition-all duration-300
                                 hover:shadow-[0_0_15px_rgba(249,115,22,0.2)] group">
                <Bell className="w-4 h-4 text-orange-400 group-hover:text-orange-300 transition-colors" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              </button>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 
                            border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300
                            hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] cursor-pointer group">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 blur-sm opacity-50 group-hover:opacity-75 transition-opacity" />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-sm font-medium text-white">Neural User</span>
                <span className="text-xs text-purple-400">Administrator</span>
              </div>
              <ChevronDown className="w-4 h-4 text-purple-400 group-hover:text-purple-300 transition-colors" />
            </div>

            {/* Power Button */}
            <button className="p-2.5 rounded-xl bg-gradient-to-br from-red-500/10 to-red-600/10 
                               border border-red-500/20 hover:border-red-400/40 transition-all duration-300
                               hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] group">
              <Power className="w-4 h-4 text-red-400 group-hover:text-red-300 transition-colors" />
            </button>
          </div>
        </div>

        {/* Bottom border with moving gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/50 via-purple-500/50 to-cyan-500/50 animate-pulse" />
        </div>
      </nav>

      {/* Overlay for mobile menu */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Futuristic Side Menu */}
      <div className={`fixed top-0 left-0 h-full w-80 bg-black/90 backdrop-blur-xl border-r border-cyan-500/20 
                      z-50 transform transition-transform duration-500 ease-in-out
                      ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Menu Header */}
        <div className="p-6 border-b border-cyan-500/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-cyan-400">NEURAL MENU</h2>
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-cyan-500/10 transition-colors"
            >
              <Menu className="w-5 h-5 text-cyan-400" />
            </button>
          </div>
          
          {/* System Stats */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="text-green-400 font-mono">CPU</div>
              <div className="text-green-300 font-bold">87%</div>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="text-blue-400 font-mono">RAM</div>
              <div className="text-blue-300 font-bold">64%</div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-6 space-y-2">
          {[
            { name: 'Dashboard', href: '/dashboard', icon: '⚡' },
            { name: 'Smart Analyzer', href: '/smart-analyzer', icon: '🧠' },
            { name: 'Correlation Matrix', href: '/correlation', icon: '🔗' },
            { name: 'Economy Simulator', href: '/admin/economy', icon: '💰' },
            { name: 'Neural Networks', href: '#', icon: '🌐' },
            { name: 'Data Streams', href: '#', icon: '📊' },
          ].map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-cyan-500/5 to-purple-500/5 
                         border border-cyan-500/10 hover:border-cyan-400/30 transition-all duration-300
                         hover:shadow-[0_0_15px_rgba(6,182,212,0.1)] group"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-cyan-100 group-hover:text-cyan-300 transition-colors">{item.name}</span>
            </Link>
          ))}
        </div>

        {/* Menu Footer */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <div className="text-xs text-purple-400 mb-2">SYSTEM STATUS</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-green-400 font-mono">All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar;