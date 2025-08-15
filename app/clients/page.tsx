import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Search, Filter, Mail, Phone, MapPin } from 'lucide-react'
import { Input } from "@/components/ui/input"

const clients = [
  {
    id: 1,
    name: "Smith Family",
    email: "contact@smithfamily.com",
    phone: "+1 (555) 123-4567",
    location: "Manhattan, NY",
    projects: 2,
    totalValue: "$150,000",
    status: "active",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "TechCorp Inc.",
    email: "projects@techcorp.com",
    phone: "+1 (555) 234-5678",
    location: "Brooklyn, NY",
    projects: 1,
    totalValue: "$85,000",
    status: "active",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Grandeur Hotels",
    email: "design@grandeurhotels.com",
    phone: "+1 (555) 345-6789",
    location: "SoHo, NY",
    projects: 3,
    totalValue: "$320,000",
    status: "active",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    name: "Johnson Family",
    email: "mary@johnson.com",
    phone: "+1 (555) 456-7890",
    location: "Queens, NY",
    projects: 1,
    totalValue: "$45,000",
    status: "prospect",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 5,
    name: "Modern Living Co.",
    email: "hello@modernliving.com",
    phone: "+1 (555) 567-8901",
    location: "Chelsea, NY",
    projects: 0,
    totalValue: "$0",
    status: "inactive",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

export default function ClientsPage() {
  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-end">
        <Button className="bg-brand-primary text-white hover:bg-brand-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search clients..."
            className="pl-10 bg-white border-gray-200"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Client</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Contact</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Location</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Projects</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Total Value</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                <th className="pl-4 pr-6 py-3 text-right text-sm font-medium text-gray-600 w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={client.avatar || "/placeholder.svg?height=40&width=40&query=client-avatar"} />
                        <AvatarFallback className="bg-gray-100 text-gray-600">
                          {client.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate">{client.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm text-gray-600 whitespace-nowrap truncate" title={client.email}>
                        <Mail className="w-3.5 h-3.5" />
                        <span className="truncate">{client.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 whitespace-nowrap truncate" title={client.phone}>
                        <Phone className="w-3.5 h-3.5" />
                        <span className="truncate">{client.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600 whitespace-nowrap truncate" title={client.location}>
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="truncate">{client.location}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900">{client.projects}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900">{client.totalValue}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      className={`${
                        client.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                        client.status === 'prospect' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                        'bg-gray-50 text-gray-700 border-gray-200'
                      } text-xs`}
                    >
                      {client.status}
                    </Badge>
                  </td>
                  <td className="pl-4 pr-6 py-3 text-right">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600">
                      {/* Replace with your dropdown if needed */}
                      ···
                      <span className="sr-only">Row actions</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
