// components/sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SignedOut, SignedIn, SignInButton, UserButton, useUser } from '@clerk/nextjs'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  DollarSign,
  CloudSun,
  MapPin,
  Droplets,
  Calendar,
  Bug,
  Wheat,
  Wrench,
  Users,
  Settings,
  HelpCircle,
  User
} from 'lucide-react'

const sidebarItems = [
  {
    title: 'GENERAL',
    items: [
      {
        title: 'Dashboard',
        href: '/admin/dashboard',
        icon: LayoutDashboard,
      },
      {
        title: 'Financial',
        href: '/admin/dashboard/financial',
        icon: DollarSign,
      },
      {
        title: 'Weather Forecast',
        href: '/admin/dashboard/weather-forecast',
        icon: CloudSun,
      },
    ]
  },
  {
    title: 'MANAGEMENT',
    items: [
      {
        title: 'Field',
        href: '/admin/dashboard/field',
        icon: MapPin,
      },
      {
        title: 'Water Usage',
        href: '/admin/dashboard/water-usage',
        icon: Droplets,
      },
      {
        title: 'Harvest Plan',
        href: '/admin/dashboard/harvest-plan',
        icon: Calendar,
      },
      {
        title: 'Pest & Disease',
        href: '/admin/dashboard/pest-disease',
        icon: Bug,
      },
      {
        title: 'Soil & Crop',
        href: '/admin/dashboard/soil-analysis',
        icon: Wheat,
      },
      {
        title: 'Equipment',
        href: '/admin/dashboard/equipment',
        icon: Wrench,
      },
    ]
  },
  {
    title: 'OTHERS',
    items: [
      {
        title: 'Settings',
        href: '/admin/dashboard/settings',
        icon: Settings,
      }
    ]
  }
]

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useUser()

  return (
    <div className="flex h-screen w-64 flex-col bg-[#E1E2E4] border-r">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b px-6">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="h-2 w-2 bg-[#783121] rotate-45"></div>
            <div className="h-2 w-2 bg-[#39883E] rotate-45"></div>
            <div className="h-2 w-2 bg-[#EFCF46] rotate-45"></div>
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#783121]">TerraSense</h1>
            <p className="text-xs text-gray-600">For Farmers</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        {sidebarItems.map((section) => (
          <div key={section.title} className="mb-6">
            <h2 className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              {section.title}
            </h2>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-[#39883E]/10',
                      isActive 
                        ? 'bg-[#39883E]/20 text-[#39883E] border-r-2 border-[#39883E]' 
                        : 'text-gray-700 hover:text-[#39883E]'
                    )}
                  >
                    <Icon className={cn(
                      'mr-3 h-5 w-5',
                      isActive ? 'text-[#39883E]' : 'text-gray-500'
                    )} />
                    {item.title}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Authentication Section */}
      <div className="border-t bg-[#E1E2E4] p-4">
        <SignedOut>
          <div className="flex items-center justify-center">
            <SignInButton mode="modal">
              <button className="flex items-center space-x-2 w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-[#39883E]/10 hover:text-[#39883E] transition-colors">
                <User className="h-5 w-5" />
                <span>Sign In</span>
              </button>
            </SignInButton>
          </div>
        </SignedOut>
        
        <SignedIn>
          <div className="flex items-center space-x-3">
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8"
                }
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.fullName || user?.firstName || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>
        </SignedIn>
      </div>
    </div>
  )
}