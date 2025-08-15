"use client"

import { usePathname } from "next/navigation"
import { ChevronRight } from 'lucide-react'

export function BreadcrumbBar() {
  const pathname = usePathname()
  
  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean)
    
    if (segments.length === 0) return [{ label: 'Dashboard', href: '/' }]
    
    const breadcrumbs = []
    
    // First segment
    const firstSegment = segments[0]
    switch (firstSegment) {
      case 'home':
        breadcrumbs.push({ label: 'Home', href: '/home' })
        break
      case 'crm':
        breadcrumbs.push({ label: 'CRM', href: '/crm' })
        break
      case 'projects':
        breadcrumbs.push({ label: 'Projects', href: '/projects' })
        break
      case 'library':
        breadcrumbs.push({ label: 'Library', href: '/library' })
        break
      case 'calendar':
        breadcrumbs.push({ label: 'Calendar', href: '/calendar' })
        break
      case 'finance':
        breadcrumbs.push({ label: 'Finance', href: '/finance' })
        break
      case 'reports':
        breadcrumbs.push({ label: 'Reports', href: '/reports' })
        break
      case 'settings':
        breadcrumbs.push({ label: 'Settings', href: '/settings' })
        break
      default:
        breadcrumbs.push({ label: firstSegment, href: `/${firstSegment}` })
    }
    
    // Second segment
    if (segments.length > 1) {
      const secondSegment = segments[1]
      switch (secondSegment) {
        case 'tasks':
          breadcrumbs.push({ label: 'Tasks', href: `/${firstSegment}/${secondSegment}` })
          break
        case 'inbox':
          breadcrumbs.push({ label: 'Inbox', href: `/${firstSegment}/${secondSegment}` })
          break
        case 'calendar':
          breadcrumbs.push({ label: 'Calendar', href: `/${firstSegment}/${secondSegment}` })
          break
        case 'time':
          breadcrumbs.push({ label: 'Time Tracking', href: `/${firstSegment}/${secondSegment}` })
          break
        case 'leads':
          breadcrumbs.push({ label: 'Leads', href: `/${firstSegment}/${secondSegment}` })
          break
        case 'contacts':
          breadcrumbs.push({ label: 'Contacts', href: `/${firstSegment}/${secondSegment}` })
          break
        case 'pipeline':
          breadcrumbs.push({ label: 'Sales Pipeline', href: `/${firstSegment}/${secondSegment}` })
          break
        case 'proposals':
          breadcrumbs.push({ label: 'Proposals', href: `/${firstSegment}/${secondSegment}` })
          break
        case 'studio':
          breadcrumbs.push({ label: 'Studio', href: `/${firstSegment}/${secondSegment}` })
          break
        case 'products':
          breadcrumbs.push({ label: 'Products', href: `/${firstSegment}/${secondSegment}` })
          break
        case 'materials':
          breadcrumbs.push({ label: 'Materials', href: `/${firstSegment}/${secondSegment}` })
          break
        default:
          breadcrumbs.push({ label: secondSegment, href: `/${firstSegment}/${secondSegment}` })
      }
    }
    
    return breadcrumbs
  }
  
  const breadcrumbs = getBreadcrumbs()
  
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.href} className="flex items-center space-x-2">
          {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
          <span className={index === breadcrumbs.length - 1 ? 'text-gray-900 font-medium' : 'text-gray-600'}>
            {crumb.label}
          </span>
        </div>
      ))}
    </nav>
  )
}
