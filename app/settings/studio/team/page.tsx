"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SettingsPageHeader } from "@/components/settings/page-header";
import { SettingsSection } from "@/components/settings/section";
import { StatusBadge } from "@/components/chip";
import { useToast } from "@/hooks/use-toast";
import useUser from "@/hooks/useUser";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getUsers,
  updateUserRole,
  inviteUser,
  suspendUser,
  resendInvite,
  updateUser,
} from "@/supabase/API";
import { Check } from "lucide-react";

type Member = {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Manager" | "Member";
  status: "active" | "invited" | "suspended";
};

export default function TeamPage() {
  const { user, isLoading: userLoading } = useUser();
  // const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddMemberPopover, setShowAddMemberPopover] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeammates, setSelectedTeammates] = useState<Member[]>([]);
  const [emailInput, setEmailInput] = useState("");

  // Fetch users
  const {
    data: members = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["team-members"],
    queryFn: getUsers,
    enabled: !!user,
  });

  const mutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries(["users", user?.email]);
      toast.success("Profile Updated");
    },
    onError: (error) => {
      console.log(error);
      toast("Error! Try again");
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries(["team-members"]);
      toast.success("Role updated successfully");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to update role");
    },
  });

  // Invite user mutation
  const inviteMutation = useMutation({
    mutationFn: (email: string) => inviteUser(email),
    onSuccess: () => {
      queryClient.invalidateQueries(["team-members"]);
      toast.success("Invitation sent successfully");
      setShowAddMemberPopover(false);
      setEmailInput("");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to send invitation");
    },
  });

  // Suspend user mutation
  const suspendMutation = useMutation({
    mutationFn: (userId: string) => suspendUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(["team-members"]);
      toast.success("User suspended successfully");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to suspend user");
    },
  });

  // Resend invite mutation
  const resendInviteMutation = useMutation({
    mutationFn: (userId: string) => resendInvite(userId),
    onSuccess: () => {
      toast.success("Invitation resent successfully");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to resend invitation");
    },
  });

  const handleRoleChange = (userId: string, newRole: string) => {
    updateRoleMutation.mutate({ userId, role: newRole });
  };

  const handleInvite = () => {
    if (emailInput && emailInput.includes("@")) {
      inviteMutation.mutate(emailInput);
    } else {
      toast.error("Please enter a valid email address");
    }
  };

  const handleSuspend = (userId: string) => {
    // if (confirm("Are you sure you want to suspend this user?")) {
    //   suspendMutation.mutate(userId);
    // }
  };

  const handleAddUser = (user) => {
    console.log(user);

    setSelectedTeammates((prev) => {
      // check if user already exists
      if (prev.some((t) => t.id === user.id)) {
        // remove if exists
        return prev.filter((t) => t.id !== user.id);
      } else {
        // add if not exists
        return [...prev, user];
      }
    });
  };

  const handleSubmit = () => {
    const finalData = {
      ...user,
      teamMember: selectedTeammates, // assign selectedTeammates to teamMember
    };
    // console.log(finalData);
    mutation.mutate(finalData);
  };

  const handleResendInvite = (userId: string) => {
    resendInviteMutation.mutate(userId);
  };

  // Filter teammates based on search query
  const filteredTeammates = members?.data?.filter(
    (member) =>
      member?.name?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      member?.email?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      member?.title?.toLowerCase().includes(searchQuery?.toLowerCase())
  );

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  useEffect(() => {
    if (user?.teamMember) {
      setSelectedTeammates((prev) => {
        // merge existing + user.teamMember without duplicates
        const merged = [...prev];

        user.teamMember.forEach((member) => {
          if (!merged.some((t) => t.id === member.id)) {
            merged.push(member);
          }
        });

        return merged;
      });
    }
  }, [user?.teamMember]);

  // useEffect(() => {
  //   console.log(user);
  // }, [user]);

  if (userLoading || isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading team members</div>;
  }

  return (
    <>
      <SettingsPageHeader
        title="Team"
        description="Manage members, invites, and statuses."
      />

      <SettingsSection
        title="Members"
        description="Add, remove, and manage studio members."
        action={
          <div className="relative">
            <Button
              size="sm"
              className="bg-clay-600 text-white hover:bg-clay-700"
              onClick={() => setShowAddMemberPopover(!showAddMemberPopover)}
              disabled={inviteMutation.isLoading}>
              {inviteMutation.isLoading ? "Sending..." : "Add member"}
            </Button>

            {/* TeamAssignment Popover */}
            {showAddMemberPopover && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-300 rounded-xl shadow-lg z-10 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-medium text-gray-900">Add Team Member</h3>
                </div>

                <div className="p-4 border-b border-gray-200">
                  {/* <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email address
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        placeholder="Enter email address"
                        className="flex-1 px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleInvite();
                        }}
                      />
                      <button
                        onClick={handleInvite}
                        className="px-3 py-2 bg-clay-600 text-white text-sm rounded-md hover:bg-clay-700">
                        Invite
                      </button>
                    </div>
                  </div> */}

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-4 w-4 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search existing members…"
                      className="w-full pl-10 pr-4 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto relative">
                  {filteredTeammates.length === 0 ? (
                    <div className="p-4 text-center text-gray-600 text-sm">
                      No members found.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {filteredTeammates.map((user) => {
                        const isSelected = selectedTeammates.some(
                          (t) => t.id === user.id
                        );

                        return (
                          <div
                            key={user.id}
                            className={`flex items-center gap-3 p-3 cursor-pointer ${
                              isSelected ? "bg-gray-50" : "hover:bg-gray-50"
                            }`}
                            onClick={() => handleAddUser(user)}>
                            {/* Check Icon if selected */}
                            {isSelected && <Check className="h-4 w-4" />}

                            <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-800">
                              {getInitials(user.name)}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {user.name}
                              </p>
                              <p className="text-xs text-gray-600 truncate">
                                {user.role} • {user.email}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="p-2 sticky bottom-0 bg-white">
                    <Button
                      size="sm"
                      className="bg-clay-600 text-white hover:bg-clay-700 w-full"
                      onClick={handleSubmit}>
                      Submit
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        }>
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <div className="grid grid-cols-[1fr,160px,120px,220px] gap-3 items-center px-4 py-2 text-xs text-muted-foreground bg-neutral-50">
            <div>Member</div>
            <div>Role</div>
            <div>Status</div>
            <div className="text-right pr-2">Actions</div>
          </div>
          <ul className="divide-y">
            {user?.teamMember?.map((m: Member) => (
              <li
                key={m.id}
                className="grid grid-cols-[1fr,160px,120px,220px] gap-3 items-center px-4 py-3 bg-white">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getInitials(m.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{m.name}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {m.email}
                    </div>
                  </div>
                </div>

                <div>
                  {/* {m?.role} */}
                  <Select
                    defaultValue={m.role}
                    // onValueChange={(value) => handleRoleChange(m.id, value)}
                    disabled={updateRoleMutation.isLoading}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <StatusBadge status={m.status || "Active"} />
                </div>

                <div className="flex items-center justify-end gap-2">
                  {/* {m.status === "invited" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResendInvite(m.id)}
                      disabled={resendInviteMutation.isLoading}>
                      Resend invite
                    </Button>
                  )} */}
                  {/* <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuspend(m.id)}
                    disabled={suspendMutation.isLoading}>
                    {m.status === "suspended" ? "Reinstate" : "Suspend"}
                  </Button> */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSuspend(m.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50">
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </SettingsSection>

      {/* Backdrop for closing popover when clicking outside */}
      {showAddMemberPopover && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowAddMemberPopover(false)}
        />
      )}
    </>
  );
}
