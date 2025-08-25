"use client";

import * as React from "react";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin, ExternalLink, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import useProjects from "@/supabase/hook/useProject";
import { useEffect } from "react";

export type ContactDetails = {
  id: string;
  created_at: string;
  name: string;
  surname: string;
  company?: string;
  email: string;
  type: string;
  connection: string;
  find: string;
  budget: number;
  project: string;
  status: string;
  phone: string;
  address: string;
  products?: any[];
  docs?: any[];
};

export type ContactDetailSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: ContactDetails;
};

function StatCard({
  label,
  value,
  icon,
  className,
}: {
  label: string;
  value?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-greige-500/30 bg-neutral-50 p-4",
        className
      )}>
      <div className="text-xs font-medium text-neutral-500">{label}</div>
      <div className="mt-1 flex items-center text-sm font-semibold text-neutral-900">
        {icon && <span className="mr-2">{icon}</span>}
        {value ?? "Not Available"}
      </div>
    </div>
  );
}

export function ContactDetailSheet({
  open,
  onOpenChange,
  contact,
}: ContactDetailSheetProps) {
  const data = contact;

  if (!data) {
    return null;
  }

  const {
    data: projectsData,
    isLoading: projectsLoading,
    error: projectsError,
    refetch,
  } = useProjects();

  // Format budget with currency symbol
  const formatBudget = (budget: number) => {
    if (!budget) return "Not Specified";
    return `$${budget.toLocaleString()}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  // React.useEffect(() => {
  //   console.log(projectsData);
  // }, [projectsData]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full p-0 sm:max-w-xl md:max-w-2xl">
        <div className="flex h-full flex-col">
          <SheetHeader className="px-6 pt-6">
            <div className="flex items-start justify-between">
              <div>
                <SheetTitle className="text-xl font-semibold text-neutral-900">
                  {data.name} {data.surname}
                </SheetTitle>
                {data.company ? (
                  <div className="text-sm text-neutral-600">{data.company}</div>
                ) : null}
              </div>
              <Badge
                className={cn(
                  "ml-2",
                  data.status === "Qualified"
                    ? "bg-green-100 text-green-800"
                    : data.status === "Lead"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                )}>
                {data.status}
              </Badge>
            </div>
          </SheetHeader>

          <Separator className="mt-4" />

          <div className="flex-1 overflow-y-auto">
            <div className="grid gap-6 p-6">
              {/* Contact information */}
              <section aria-label="Contact information">
                <h3 className="mb-4 text-base font-semibold text-neutral-900">
                  Contact Information
                </h3>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <StatCard
                    label="Email"
                    value={
                      <a
                        href={`mailto:${data.email}`}
                        className="hover:underline">
                        {data.email}
                      </a>
                    }
                    icon={<Mail className="h-4 w-4" />}
                  />
                  <StatCard
                    label="Phone"
                    value={
                      <a href={`tel:${data.phone}`} className="hover:underline">
                        {data.phone}
                      </a>
                    }
                    icon={<Phone className="h-4 w-4" />}
                  />
                  {data.address && (
                    <StatCard
                      label="Address"
                      value={data.address.split("\n").map((line, i) => (
                        <div key={i}>{line}</div>
                      ))}
                      icon={<MapPin className="h-4 w-4" />}
                      className="sm:col-span-2"
                    />
                  )}
                </div>
              </section>

              {/* Additional details */}
              <section aria-label="Additional details">
                <h3 className="mb-4 text-base font-semibold text-neutral-900">
                  Additional Details
                </h3>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <StatCard label="Connection" value={data.connection} />
                  <StatCard label="Found Via" value={data.find} />
                  <StatCard label="Budget" value={formatBudget(data.budget)} />
                  <StatCard label="Contact Type" value={data.type} />
                  <StatCard
                    label="Created Date"
                    value={formatDate(data.created_at)}
                    icon={<Calendar className="h-4 w-4" />}
                  />
                </div>
              </section>

              {/* Project information */}
              <section aria-label="Project information">
                <h3 className="mb-4 text-base font-semibold text-neutral-900">
                  Project Information
                </h3>

                <div className="rounded-lg border border-greige-500/30 bg-neutral-50 p-4">
                  <div className="text-xs font-medium text-neutral-500">
                    Project Name
                  </div>
                  <div className="mt-1 text-sm font-semibold text-neutral-900">
                    {projectsData.find((p) => p.id === data.project)?.name ||
                      "Unknown Project"}
                  </div>
                  <Link href={`/projects/${data.project}`} passHref>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="mt-3">
                      <span>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Project
                      </span>
                    </Button>
                  </Link>
                </div>
              </section>

              {/* Documents section */}
              {data.docs && data.docs.length > 0 && (
                <section aria-label="Documents">
                  <h3 className="mb-4 text-base font-semibold text-neutral-900">
                    Documents
                  </h3>

                  <div className="rounded-lg border border-greige-500/30 bg-neutral-50 p-4">
                    <div className="text-sm text-neutral-600">
                      {data.docs.length} document(s) attached
                    </div>
                    <Button variant="outline" size="sm" className="mt-3">
                      View Documents
                    </Button>
                  </div>
                </section>
              )}
            </div>
          </div>

          {/* Sticky footer actions */}
          <div className="border-t border-greige-500/30 bg-white p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-neutral-600">
                Contact options for {data.name}
              </div>
              <div className="flex gap-2">
                {/* Send Email */}
                <Link
                  href={`mailto:${data?.email || "someone@example.com"}`}
                  passHref>
                  <Button
                    asChild
                    variant="outline"
                    className="border-greige-500/30">
                    <span>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Email
                    </span>
                  </Button>
                </Link>

                {/* Call Now */}
                <Link href={`tel:${data?.phone || "+880123456789"}`} passHref>
                  <Button
                    asChild
                    className="bg-clay-600 text-white hover:bg-clay-700">
                    <span>
                      <Phone className="mr-2 h-4 w-4" />
                      Call Now
                    </span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
