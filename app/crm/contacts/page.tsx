"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  Plus,
  Mail,
  Phone,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CrmNav } from "@/components/crm-nav";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TypeChip } from "@/components/chip";
import { useQuery } from "@tanstack/react-query";
import { getContact } from "@/supabase/API";

// const contacts = [
//   {
//     id: 1,
//     name: "Sarah Johnson",
//     company: "Johnson & Associates",
//     email: "sarah@johnsonassoc.com",
//     phone: "+1 (555) 123-4567",
//     type: "Client",
//     avatar: "SJ",
//   },
//   {
//     id: 2,
//     name: "Michael Chen",
//     company: "Tech Innovations Inc",
//     email: "michael@techinnovations.com",
//     phone: "+1 (555) 234-5678",
//     type: "Lead",
//     avatar: "MC",
//   },
//   {
//     id: 3,
//     name: "Emily Rodriguez",
//     company: "Creative Studios",
//     email: "emily@creativestudios.com",
//     phone: "+1 (555) 345-6789",
//     type: "Partner",
//     avatar: "ER",
//   },
//   {
//     id: 4,
//     name: "David Thompson",
//     company: "Thompson Enterprises",
//     email: "david@thompsonent.com",
//     phone: "+1 (555) 456-7890",
//     type: "Client",
//     avatar: "DT",
//   },
// ];

export default function ContactsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<
    "all" | "clients" | "suppliers" | "contractors"
  >("all");
  // const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filterContact, setFilterContact] = useState([]);

  const {
    data: contactData,
    isLoading: taskLoading,
    error: taskError,
    refetch: refetchContact,
  } = useQuery({
    queryKey: ["getContacts"],
    queryFn: getContact,
  });

  const filtered = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (!taskLoading && contactData) {
      setContacts(contactData.data);
    }
  }, [taskLoading, contactData]);

  // useEffect(() => {
  //   console.log(contactData);
  // }, [contactData]);

  return (
    <div className="flex-1 bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <CrmNav />

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 h-9 bg-transparent">
              <Filter className="w-4 h-4" />
              Filter
            </Button>

            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" className="gap-2 bg-gray-900 hover:bg-gray-800">
              <Plus className="w-4 h-4" />
              Add Contact
            </Button>
          </div>
        </div>

        {/* Contacts Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th
                    className="px-4 py-3 text-left text-sm font-medium text-gray-600"
                    style={{ width: 48 }}>
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      aria-label="Select all contacts"
                    />
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-medium text-gray-600"
                    style={{ width: 320 }}>
                    Contact
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-medium text-gray-600"
                    style={{ width: 360 }}>
                    Contact Info
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-medium text-gray-600"
                    style={{ width: 140 }}>
                    Type
                  </th>
                  <th
                    className="pl-4 pr-6 py-3 text-right text-sm font-medium text-gray-600"
                    style={{ width: 96 }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {filtered.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        aria-label={`Select ${contact.name}`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="w-8 h-8 shrink-0">
                          <AvatarImage
                            src={
                              "/placeholder.svg?height=32&width=32&query=avatar"
                            }
                          />
                          <AvatarFallback className="bg-gray-900 text-white text-xs font-semibold">
                            {contact.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div
                            className="font-medium text-gray-900 truncate"
                            title={contact.name}>
                            {contact.name}
                          </div>
                          <div
                            className="text-xs text-gray-600 truncate"
                            title={contact.company}>
                            {contact.company}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1 min-w-0">
                        <div
                          className="flex items-center gap-2 text-gray-600 whitespace-nowrap truncate"
                          title={contact.email}>
                          <Mail className="w-4 h-4 shrink-0" />
                          <span className="truncate">{contact.email}</span>
                        </div>
                        <div
                          className="flex items-center gap-2 text-gray-600 whitespace-nowrap truncate"
                          title={contact.phone}>
                          <Phone className="w-4 h-4 shrink-0" />
                          <span className="truncate">{contact.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <TypeChip label={contact.type} />
                    </td>
                    <td className="pl-4 pr-6 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                            aria-label={`Open actions for ${contact.name}`}>
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>Send Email</DropdownMenuItem>
                          <DropdownMenuItem>Schedule Meeting</DropdownMenuItem>
                          <DropdownMenuItem>Add Note</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
