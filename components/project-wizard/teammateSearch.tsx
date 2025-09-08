"use client";

import { Users } from "lucide-react";
import { useEffect, useState } from "react";

const TeamAssignment = ({ users, setSelectedTeammates, selectedTeammates }) => {
  const [openPop, setOpenPop] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // const [selectedTeammates, setSelectedTeammates] = useState([]);

  // Sample teammate data
  const teamMembers = [
    {
      id: 1,
      name: "John Doe",
      avatarUrl: "",
      role: "Lead Designer",
    },
    {
      id: 2,
      name: "Alex Johnson",
      avatarUrl: "",
      role: "Frontend Developer",
    },
    {
      id: 3,
      name: "Maria Garcia",
      avatarUrl: "",
      role: "UX Designer",
    },
    {
      id: 4,
      name: "James Wilson",
      avatarUrl: "",
      role: "Backend Engineer",
    },
    {
      id: 5,
      name: "Sarah Chen",
      avatarUrl: "",
      role: "Product Manager",
    },
    {
      id: 6,
      name: "Michael Taylor",
      avatarUrl: "",
      role: "DevOps Specialist",
    },
  ];

  // Filter teammates based on search query
  const filteredTeammates = users.filter(
    (member) =>
      member?.name?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      member?.title?.toLowerCase().includes(searchQuery?.toLowerCase())
  );

  // Toggle teammate selection
  const toggleTeammate = (teammate) => {
    if (selectedTeammates.some((t) => t.id === teammate.id)) {
      setSelectedTeammates(
        selectedTeammates.filter((t) => t.id !== teammate.id)
      );
    } else {
      setSelectedTeammates([...selectedTeammates, teammate]);
    }
  };

  // Get initials for avatar fallback
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  // useEffect(() => {
  //   console.log(users);
  // }, [users]);

  return (
    <div className="">
      <div className="mx-auto">
        {/* <h1 className="text-2xl font-bold text-ink mb-6">Team Assignment</h1> */}

        {/* Team Assignment Card */}
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="">
            <div className="space-y-3">
              {/* Selected Teammates */}
              {selectedTeammates.map((teammate) => (
                <div
                  key={teammate.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-800">
                        {getInitials(teammate.name)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {teammate.name}
                      </p>
                      <p className="text-xs text-gray-600">{teammate.title}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleTeammate(teammate)}
                    className="text-gray-600 hover:text-red-500 transition-colors">
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}

              {/* Popover Trigger Button */}
              <button
                onClick={() => setOpenPop(!openPop)}
                className="w-full p-3 border border-gray-300 rounded-lg flex items-center justify-center gap-2 bg-white hover:bg-gray-50 transition-colors">
                <i className="fas fa-plus text-gray-600"></i>
                <span className="text-sm font-medium text-gray-900">
                  Add Team Member
                </span>
              </button>

              {/* Popover Content */}
              {openPop && (
                <div className="absolute mt-2 mb-5 w-full max-w-md bg-white border border-gray-300 rounded-xl shadow-lg z-10 overflow-hidden">
                  <div className="p-2 border-b border-gray-200">
                    <div className="relative">
                      <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600"></i>
                      <input
                        type="text"
                        placeholder="Search teammates…"
                        className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto">
                    {filteredTeammates.length === 0 ? (
                      <div className="p-4 text-center text-gray-600 text-sm">
                        No people found.
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {filteredTeammates.map((teammate) => {
                          const isSelected = selectedTeammates.some(
                            (t) => t.id === teammate.id
                          );
                          return (
                            <div
                              key={teammate.id}
                              className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                              onClick={() => toggleTeammate(teammate)}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className="h-4 w-4 text-black rounded-full border-gray-400 focus:ring-black focus:ring-offset-0 custom-checkbox"
                              />
                              <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-800">
                                {getInitials(teammate.name)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {teammate.name}
                                </p>
                                <p className="text-xs text-gray-600 truncate">
                                  {teammate.title}
                                </p>
                              </div>
                              {isSelected && (
                                <i className="fas fa-check text-black ml-auto"></i>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Backdrop for closing popover when clicking outside */}
        {openPop && (
          <div
            className="fixed inset-0 z-0"
            onClick={() => setOpenPop(false)}
          />
        )}
      </div>

      <style jsx>{`
        .custom-checkbox {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          border: 1px solid #9ca3af; /* gray-400 */
          border-radius: 50%; /* Make it circular */
          width: 1rem; /* h-4 */
          height: 1rem; /* w-4 */
          cursor: pointer;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease-in-out;
        }

        .custom-checkbox:checked {
          background-color: #000; /* Black when checked */
          border-color: #000; /* Black border when checked */
        }

        .custom-checkbox:checked::after {
          content: "";
          display: block;
          width: 0.5rem;
          height: 0.5rem;
          background-color: #fff; /* White inner circle */
          border-radius: 50%;
        }

        .custom-checkbox:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.4); /* Focus ring for accessibility */
        }
      `}</style>
    </div>
  );
};

export default TeamAssignment;
