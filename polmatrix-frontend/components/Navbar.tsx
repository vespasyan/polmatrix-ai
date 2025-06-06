'use client'

import { useEffect, useState } from "react"
import { User, Bell, Menu } from "lucide-react"
import Link from "next/link"
import Image from "next/image" // Import Image component

const Navbar: React.FC = () => {
  const [mounted, setMounted] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    setMounted(true)

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10) // Change background when scrolled more than 10px
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll) // Cleanup listener
  }, [])

  if (!mounted) return null

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 w-full flex justify-between items-center px-6 py-4 transition-colors duration-300 ease-in-out 
                 ${isScrolled ? 'bg-background/80 backdrop-blur-sm shadow-sm' : 'bg-transparent text-white'}`}
    >
      <div className="flex items-center gap-4">
        {/* Add Hamburger Menu Button */}
        <button className="p-2 hover:bg-white/10 rounded-md transition" aria-label="Open menu">
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Add logo */}
        <Image 
          src="/logo_polmatrix.png" 
          alt="Polmatrix Logo" 
          width={32} 
          height={32} 
          className="rounded-sm"
        />
        
        <h1 className="text-xl font-bold">POLMATRIX</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-1 px-3 py-1.5 rounded-md hover:bg-white/10 transition">
          <User className="w-4 h-4" />
          <span>Account</span>
        </button>
        <button className="p-2 hover:bg-white/10 rounded-md transition" aria-label="Notifications">
          <Bell className="w-5 h-5" />
        </button>
      
      </div>
    </nav>
  )
}

export default Navbar;