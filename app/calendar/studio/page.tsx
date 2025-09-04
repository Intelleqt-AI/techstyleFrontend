'use client';

import React from 'react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, Search, Filter, Calendar, Users, Video } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const todayEvents = [
  // {
  //   id: 1,
  //   title: 'Client Meeting - Penthouse Review',
  //   time: '10:00 AM',
  //   duration: '1h',
  //   location: 'Office Conference Room',
  //   type: 'meeting',
  //   project: 'Luxury Penthouse',
  //   projectTextHex: '#6E7A58',
  //   projectBorderHex: '#8FA58F',
  //   attendees: 3,
  //   hasConflict: false,
  //   canJoin: true,
  //   color: 'bg-[#E07A57] border-[#CE6B4E]',
  // },
  // {
  //   id: 2,
  //   title: 'Site Visit - Office Space Progress',
  //   time: '2:30 PM',
  //   duration: '2h',
  //   location: 'Downtown Construction Site',
  //   type: 'site-visit',
  //   project: 'Modern Office',
  //   projectTextHex: '#6E7A58',
  //   projectBorderHex: '#8FA58F',
  //   attendees: 5,
  //   hasConflict: true,
  //   canJoin: false,
  //   color: 'bg-[#8FA58F] border-[#6E7A58]',
  // },
];

const viewOptions = [
  { id: 'month', label: 'Month', icon: Calendar },
  { id: 'week', label: 'Week', icon: Calendar },
  { id: 'today', label: 'Today', icon: Calendar },
];

// Calendar events with earthy colors and tooltips - Updated for August 2025
const calendarEvents = [
  // {
  //   day: 6,
  //   events: [
  //     {
  //       type: 'meeting',
  //       color: 'bg-[#E68E71]',
  //       title: 'Client Meeting - Penthouse Review',
  //       time: '10:00 AM',
  //       attendees: 3,
  //     },
  //     {
  //       type: 'task',
  //       color: 'bg-[#6B7C85]',
  //       title: 'Design Review',
  //       time: '2:00 PM',
  //       attendees: 2,
  //     },
  //   ],
  // },
  // {
  //   day: 8,
  //   events: [
  //     {
  //       type: 'site-visit',
  //       color: 'bg-[#8FA58F]',
  //       title: 'Site Visit - Office Space',
  //       time: '2:30 PM',
  //       attendees: 5,
  //     },
  //   ],
  // },
  // {
  //   day: 12,
  //   events: [
  //     {
  //       type: 'delivery',
  //       color: 'bg-[#C78A3B]',
  //       title: 'Material Delivery',
  //       time: '11:00 AM',
  //       attendees: 2,
  //     },
  //   ],
  // },
  // {
  //   day: 15,
  //   events: [
  //     {
  //       type: 'meeting',
  //       color: 'bg-[#E07A57]',
  //       title: 'Project Review',
  //       time: '9:00 AM',
  //       attendees: 4,
  //     },
  //     {
  //       type: 'meeting',
  //       color: 'bg-[#E68E71]',
  //       title: 'Client Call',
  //       time: '3:00 PM',
  //       attendees: 2,
  //     },
  //   ],
  // },
  // {
  //   day: 20,
  //   events: [
  //     {
  //       type: 'task',
  //       color: 'bg-[#6B7C85]',
  //       title: 'Documentation Update',
  //       time: '1:00 PM',
  //       attendees: 1,
  //     },
  //   ],
  // },
  // {
  //   day: 22,
  //   events: [
  //     {
  //       type: 'pto',
  //       color: 'bg-[#D9D5CC]',
  //       title: 'Personal Time Off',
  //       time: 'All Day',
  //       attendees: 0,
  //     },
  //   ],
  // },
];

export default function CalendarStudioPage() {
  const [mode, setMode] = useState<'calendar' | 'timeline'>('calendar');
  const [activeView, setActiveView] = useState('month');
  const [currentPeriod, setCurrentPeriod] = useState({
    month: new Date(2025, 7), // August 2025
    week: new Date(2025, 7, 4), // Week starting Aug 4, 2025
    today: new Date(2025, 7, 6), // Aug 6, 2025
    year: new Date(2025, 0), // 2025
  });

  const navigatePeriod = (direction: 'prev' | 'next') => {
    setCurrentPeriod(prev => {
      const newPeriod = { ...prev };

      if (mode === 'timeline') {
        switch (activeView) {
          case 'month':
            const yearDate = new Date(prev.year);
            yearDate.setFullYear(yearDate.getFullYear() + (direction === 'next' ? 1 : -1));
            newPeriod.year = yearDate;
            break;
          case 'week':
            const monthDate = new Date(prev.month);
            monthDate.setMonth(monthDate.getMonth() + (direction === 'next' ? 1 : -1));
            newPeriod.month = monthDate;
            break;
          case 'today':
            const dayMonthDate = new Date(prev.month);
            dayMonthDate.setMonth(dayMonthDate.getMonth() + (direction === 'next' ? 1 : -1));
            newPeriod.month = dayMonthDate;
            break;
        }
      } else {
        // Calendar mode navigation
        switch (activeView) {
          case 'month':
            const monthDate = new Date(prev.month);
            monthDate.setMonth(monthDate.getMonth() + (direction === 'next' ? 1 : -1));
            newPeriod.month = monthDate;
            break;
          case 'week':
            const weekDate = new Date(prev.week);
            weekDate.setDate(weekDate.getDate() + (direction === 'next' ? 7 : -7));
            newPeriod.week = weekDate;
            break;
          case 'today':
            const todayDate = new Date(prev.today);
            todayDate.setDate(todayDate.getDate() + (direction === 'next' ? 1 : -1));
            newPeriod.today = todayDate;
            break;
        }
      }

      return newPeriod;
    });
  };

  const getNavigatorLabel = () => {
    if (mode === 'timeline') {
      switch (activeView) {
        case 'month':
          return currentPeriod.year.getFullYear().toString();
        case 'week':
          return currentPeriod.month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        case 'today':
          return currentPeriod.month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        default:
          return '2025';
      }
    }

    switch (activeView) {
      case 'month':
        return currentPeriod.month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      case 'week':
        const weekStart = new Date(currentPeriod.week);
        const weekEnd = new Date(currentPeriod.week);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}`;
      case 'today':
        return currentPeriod.today.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
      default:
        return currentPeriod.month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  };

  const scrollbarStyles = `
  .timeline-header-scroll::-webkit-scrollbar {
    display: none;
  }
  .timeline-header-scroll {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .timeline-body-scroll::-webkit-scrollbar {
    height: 8px;
  }
  .timeline-body-scroll::-webkit-scrollbar-track {
    background: transparent;
  }
  .timeline-body-scroll::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 4px;
  }
  .timeline-body-scroll::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }
`;

  const renderCalendarContent = () => {
    if (mode === 'timeline') {
      // Sample staff data with projects and time allocations - Updated for August 2025
      // const staffData = [
      //   {
      //     id: 1,
      //     name: 'Alex Morgan',
      //     role: 'Lead Designer',
      //     avatar: 'AM',
      //     projects: [
      //       {
      //         name: 'Luxury Penthouse',
      //         start: '2025-01-01',
      //         end: '2025-03-31',
      //         color: 'bg-[#E07A57]',
      //         allocation: 100,
      //       },
      //       {
      //         name: 'Hotel Lobby Design',
      //         start: '2025-04-01',
      //         end: '2025-07-31',
      //         color: 'bg-[#8FA58F]',
      //         allocation: 80,
      //       },
      //     ],
      //   },
      //   {
      //     id: 2,
      //     name: 'Sarah Chen',
      //     role: 'Interior Designer',
      //     avatar: 'SC',
      //     projects: [
      //       {
      //         name: 'Modern Office',
      //         start: '2025-02-01',
      //         end: '2025-06-30',
      //         color: 'bg-[#6E7A58]',
      //         allocation: 100,
      //       },
      //     ],
      //   },
      //   {
      //     id: 3,
      //     name: 'Mike Rodriguez',
      //     role: 'Project Manager',
      //     avatar: 'MR',
      //     projects: [
      //       {
      //         name: 'Luxury Penthouse',
      //         start: '2025-01-01',
      //         end: '2025-02-28',
      //         color: 'bg-[#E07A57]',
      //         allocation: 60,
      //       },
      //       {
      //         name: 'Modern Office',
      //         start: '2025-03-01',
      //         end: '2025-05-31',
      //         color: 'bg-[#6E7A58]',
      //         allocation: 80,
      //       },
      //       {
      //         name: 'Hotel Lobby Design',
      //         start: '2025-06-01',
      //         end: '2025-08-31',
      //         color: 'bg-[#8FA58F]',
      //         allocation: 70,
      //       },
      //     ],
      //   },
      //   {
      //     id: 4,
      //     name: 'Emma Wilson',
      //     role: '3D Visualizer',
      //     avatar: 'EW',
      //     projects: [
      //       {
      //         name: 'Hotel Lobby Design',
      //         start: '2025-03-01',
      //         end: '2025-07-31',
      //         color: 'bg-[#8FA58F]',
      //         allocation: 100,
      //       },
      //     ],
      //   },
      //   {
      //     id: 5,
      //     name: 'David Park',
      //     role: 'Technical Designer',
      //     avatar: 'DP',
      //     projects: [
      //       {
      //         name: 'Modern Office',
      //         start: '2025-02-15',
      //         end: '2025-06-15',
      //         color: 'bg-[#6E7A58]',
      //         allocation: 90,
      //       },
      //       {
      //         name: 'Luxury Penthouse',
      //         start: '2025-07-01',
      //         end: '2025-08-31',
      //         color: 'bg-[#E07A57]',
      //         allocation: 85,
      //       },
      //     ],
      //   },
      // ];

      const staffData = [];

      // Generate date range based on current view
      const generateTimelineData = () => {
        switch (activeView) {
          case 'month': {
            // Show 12 months of the year
            const year = currentPeriod.year.getFullYear();
            const months = [];
            for (let i = 0; i < 12; i++) {
              months.push({
                label: new Date(year, i, 1).toLocaleDateString('en-US', { month: 'short' }),
                fullLabel: new Date(year, i, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                date: new Date(year, i, 1),
                width: 100,
              });
            }
            return { periods: months, type: 'month' as const };
          }
          case 'week': {
            // Show weeks in the current month
            const year = currentPeriod.month.getFullYear();
            const month = currentPeriod.month.getMonth();
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);

            // Find the first Monday of or before the first day of the month
            const startDate = new Date(firstDay);
            const dayOfWeek = startDate.getDay();
            const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            startDate.setDate(startDate.getDate() - daysToSubtract);

            const weeks = [];
            const currentWeek = new Date(startDate);

            while (currentWeek <= lastDay || currentWeek.getMonth() === month) {
              const weekEnd = new Date(currentWeek);
              weekEnd.setDate(weekEnd.getDate() + 6);

              weeks.push({
                label: `Week ${Math.ceil(currentWeek.getDate() / 7)}`,
                fullLabel: `${currentWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString(
                  'en-US',
                  { month: 'short', day: 'numeric' }
                )}`,
                date: new Date(currentWeek),
                width: 120,
              });

              currentWeek.setDate(currentWeek.getDate() + 7);

              // Break if we've gone too far past the month
              if (weeks.length > 6) break;
            }
            return { periods: weeks, type: 'week' as const };
          }
          case 'today': {
            // Show days in the current month
            const year = currentPeriod.month.getFullYear();
            const month = currentPeriod.month.getMonth();
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            const days = [];
            for (let i = 1; i <= daysInMonth; i++) {
              const date = new Date(year, month, i);
              days.push({
                label: i.toString(),
                fullLabel: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
                date: date,
                width: 40,
              });
            }
            return { periods: days, type: 'day' as const };
          }
          default:
            return { periods: [], type: 'month' as const };
        }
      };

      const timelineData = generateTimelineData();
      const { periods, type } = timelineData;

      // Calculate project bar positions
      const getProjectBarStyle = (project: any) => {
        const startDate = new Date(project.start);
        const endDate = new Date(project.end);

        let startIndex = 0;
        let endIndex = periods.length - 1;

        if (type === 'month') {
          startIndex = startDate.getMonth();
          endIndex = endDate.getMonth();
        } else if (type === 'week') {
          // Find which week the project starts and ends in
          startIndex = periods.findIndex(period => {
            const weekStart = period.date;
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            return startDate >= weekStart && startDate <= weekEnd;
          });
          endIndex = periods.findIndex(period => {
            const weekStart = period.date;
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            return endDate >= weekStart && endDate <= weekEnd;
          });
        } else if (type === 'day') {
          startIndex = Math.max(0, startDate.getDate() - 1);
          endIndex = Math.min(periods.length - 1, endDate.getDate() - 1);
        }

        startIndex = Math.max(0, startIndex);
        endIndex = Math.min(periods.length - 1, endIndex);

        const width = periods[0]?.width || 100;
        const left = startIndex * width;
        const barWidth = Math.max(width - 4, (endIndex - startIndex + 1) * width - 4);

        return {
          left: `${left}px`,
          width: `${barWidth}px`,
        };
      };

      return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {/* Timeline Header */}
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="grid" style={{ gridTemplateColumns: '280px 1fr' }}>
              {/* Staff Header */}
              <div className="p-4 border-r border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">Team Members</h3>
              </div>

              {/* Date Header - Synchronized scrolling */}
              <div className="overflow-x-auto timeline-header-scroll" id="timeline-header-scroll">
                <div className="flex" style={{ minWidth: `${periods.length * (periods[0]?.width || 100)}px` }}>
                  {periods.map((period, index) => {
                    const isToday = type === 'day' && period.date.toDateString() === new Date().toDateString();
                    const isCurrentMonth =
                      type === 'month' &&
                      period.date.getMonth() === new Date().getMonth() &&
                      period.date.getFullYear() === new Date().getFullYear();
                    const isCurrentWeek =
                      type === 'week' &&
                      (() => {
                        const today = new Date();
                        const weekStart = period.date;
                        const weekEnd = new Date(weekStart);
                        weekEnd.setDate(weekEnd.getDate() + 6);
                        return today >= weekStart && today <= weekEnd;
                      })();

                    const isCurrent = isToday || isCurrentMonth || isCurrentWeek;

                    return (
                      <div
                        key={index}
                        className={`flex-shrink-0 p-2 text-center border-r border-gray-200 bg-gray-50 ${
                          isCurrent ? 'bg-[#FBEAE1] border-[#F1BBAA]' : ''
                        }`}
                        style={{ width: `${period.width}px` }}
                        title={period.fullLabel}
                      >
                        <div className={`text-xs font-medium ${isCurrent ? 'text-[#A14A35]' : 'text-gray-600'}`}>
                          {type === 'day' ? new Date(period.date).toLocaleDateString('en-US', { weekday: 'short' }) : ''}
                        </div>
                        <div className={`text-xs ${isCurrent ? 'text-[#CE6B4E] font-semibold' : 'text-gray-500'}`}>{period.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Body */}
          <div className="max-h-[600px] overflow-y-auto">
            <div className="grid" style={{ gridTemplateColumns: '280px 1fr' }}>
              {/* Staff List */}
              <div className="border-r border-gray-200">
                {staffData.map(staff => (
                  <div key={staff.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#E07A57] rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {staff.avatar}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                        <div className="text-xs text-gray-500">{staff.role}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Timeline Bars - Synchronized scrolling */}
              <div className="overflow-x-auto timeline-body-scroll" id="timeline-body-scroll">
                <div style={{ minWidth: `${periods.length * (periods[0]?.width || 100)}px` }}>
                  {staffData.map((staff, staffIndex) => (
                    <div key={staff.id} className="relative border-b border-gray-100" style={{ height: '73px' }}>
                      {/* Background grid */}
                      <div className="absolute inset-0 flex">
                        {periods.map((period, periodIndex) => {
                          const isToday = type === 'day' && period.date.toDateString() === new Date().toDateString();
                          const isCurrentMonth =
                            type === 'month' &&
                            period.date.getMonth() === new Date().getMonth() &&
                            period.date.getFullYear() === new Date().getFullYear();
                          const isCurrentWeek =
                            type === 'week' &&
                            (() => {
                              const today = new Date();
                              const weekStart = period.date;
                              const weekEnd = new Date(weekStart);
                              weekEnd.setDate(weekEnd.getDate() + 6);
                              return today >= weekStart && today <= weekEnd;
                            })();

                          const isCurrent = isToday || isCurrentMonth || isCurrentWeek;

                          return (
                            <div
                              key={periodIndex}
                              className={`border-r border-gray-100 bg-white ${isCurrent ? 'bg-[#FBEAE1]/30' : ''}`}
                              style={{ width: `${period.width}px` }}
                            />
                          );
                        })}
                      </div>

                      {/* Today indicator line for day view */}
                      {type === 'day' &&
                        (() => {
                          const today = new Date();
                          const todayIndex = periods.findIndex(p => p.date.toDateString() === today.toDateString());

                          if (todayIndex >= 0) {
                            return (
                              <div
                                className="absolute top-0 bottom-0 w-1 bg-[#E07A57] z-10"
                                style={{
                                  left: `${todayIndex * (periods[0]?.width || 40) + (periods[0]?.width || 40) / 2}px`,
                                }}
                              />
                            );
                          }
                          return null;
                        })()}

                      {/* Project bars */}
                      {staff.projects.map((project, projectIndex) => {
                        const barStyle = getProjectBarStyle(project);

                        return (
                          <TooltipProvider key={projectIndex}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={`absolute top-4 h-6 ${project.color} rounded-md border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity z-20`}
                                  style={barStyle}
                                >
                                  <div className="px-2 py-1 text-xs text-white font-medium truncate">{project.name}</div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs">
                                <div className="space-y-1">
                                  <p className="font-medium">{project.name}</p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(project.start).toLocaleDateString()} - {new Date(project.end).toLocaleDateString()}
                                  </p>
                                  <p className="text-xs text-gray-500">Allocation: {project.allocation}%</p>
                                  <p className="text-xs text-gray-500">Assigned to: {staff.name}</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Footer */}
          <div className="border-t border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#E07A57] rounded"></div>
                  <span>Luxury Penthouse</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#8FA58F] rounded"></div>
                  <span>Hotel Lobby</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#6E7A58] rounded"></div>
                  <span>Modern Office</span>
                </div>
              </div>
              <div>Hover over bars for project details</div>
            </div>
          </div>
        </div>
      );
    }

    switch (activeView) {
      case 'week':
        return (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="grid grid-cols-8 border-b border-gray-200">
              <div className="p-4 bg-gray-50 border-r border-gray-200"></div>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                <div key={day} className="p-4 text-center border-r border-gray-200 last:border-r-0">
                  <div className="text-sm font-medium text-gray-500">{day}</div>
                  <div className="text-lg font-semibold text-gray-900 mt-1">{4 + index}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-8 min-h-[500px]">
              <div className="bg-gray-50 border-r border-gray-200">
                {Array.from({ length: 12 }, (_, i) => (
                  <div key={i} className="h-16 border-b border-gray-200 flex items-center justify-center text-sm text-gray-500">
                    {8 + i}:00
                  </div>
                ))}
              </div>

              {Array.from({ length: 7 }, (_, dayIndex) => (
                <div key={dayIndex} className="border-r border-gray-200 last:border-r-0 relative">
                  {Array.from({ length: 12 }, (_, hourIndex) => (
                    <div key={hourIndex} className="h-16 border-b border-gray-200 hover:bg-gray-50">
                      {/* {dayIndex === 2 && hourIndex === 2 && (
                        <div className="absolute top-1 left-1 right-1 bg-[#FBEAE1] border border-[#F1BBAA] rounded p-1 text-xs">
                          <div className="font-medium text-[#A14A35]">Client Meeting</div>
                          <div className="text-[#CE6B4E]">10:00 - 11:00</div>
                        </div>
                      )}
                      {dayIndex === 4 && hourIndex === 6 && (
                        <div className="absolute top-1 left-1 right-1 bg-[#E8F0E8] border border-[#B8D4B8] rounded p-1 text-xs">
                          <div className="font-medium text-[#4A6B4A]">Site Visit</div>
                          <div className="text-[#6E7A58]">14:30 - 16:30</div>
                        </div>
                      )} */}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        );

      case 'today':
        return (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Wednesday, August 6</h3>
              <p className="text-sm text-gray-500">2 events scheduled</p>
            </div>

            <div className="grid grid-cols-12 min-h-[600px]">
              <div className="col-span-2 bg-gray-50 border-r border-gray-200">
                {Array.from({ length: 12 }, (_, i) => (
                  <div key={i} className="h-16 border-b border-gray-200 flex items-center justify-center text-sm text-gray-500">
                    {8 + i}:00
                  </div>
                ))}
              </div>

              <div className="col-span-10 relative">
                {Array.from({ length: 12 }, (_, i) => (
                  <div key={i} className="h-16 border-b border-gray-200 hover:bg-gray-50"></div>
                ))}

                {/* <div className="absolute top-32 left-4 right-4 bg-[#FBEAE1] border border-[#F1BBAA] rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-[#A14A35]">Client Meeting - Penthouse Review</h4>
                      <p className="text-sm text-[#CE6B4E]">10:00 AM - 11:00 AM • Office</p>
                      <p className="text-xs text-[#CE6B4E] mt-1">Smith Family</p>
                    </div>
                    <Badge variant="outline" style={{ color: '#6E7A58', borderColor: '#8FA58F' }}>
                      meeting
                    </Badge>
                  </div>
                </div> */}

                {/* <div className="absolute top-96 left-4 right-4 bg-[#E8F0E8] border border-[#B8D4B8] rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-[#4A6B4A]">Site Visit - Office Space</h4>
                      <p className="text-sm text-[#6E7A58]">2:30 PM - 4:30 PM • Downtown</p>
                      <p className="text-xs text-[#6E7A58] mt-1">TechCorp Inc.</p>
                    </div>
                    <Badge variant="outline" style={{ color: '#6E7A58', borderColor: '#8FA58F' }}>
                      site-visit
                    </Badge>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        );

      default: // month view
        return (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="p-6">
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 35 }, (_, i) => {
                  const day = i - 2;
                  const isToday = day === 6;
                  const eventData = calendarEvents.find(e => e.day === day);

                  return (
                    <div
                      key={i}
                      className={`min-h-[100px] p-3 text-sm border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                        day < 1 || day > 31 ? 'text-gray-300 bg-gray-25' : 'text-gray-900'
                      } ${isToday ? ' border-[#F1BBAA] text-[#1F1D1A] font-semibold' : ''}`}
                      // bg-[#FBEAE1]
                    >
                      {day > 0 && day <= 31 && (
                        <>
                          <div className="font-medium mb-2 text-sm">{day}</div>
                          {eventData && (
                            <div className="space-y-1">
                              {eventData.events.map((event, idx) => (
                                <TooltipProvider key={idx}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div
                                        className={`w-full h-1.5 rounded-full ${event.color} ring-1 ring-gray-200 cursor-pointer hover:opacity-80`}
                                      />
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-xs">
                                      <div className="space-y-1">
                                        <p className="font-medium">{event.title}</p>
                                        <p className="text-xs text-gray-500">{event.time}</p>
                                        {event.attendees > 0 && (
                                          <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <Users className="w-3 h-3" />
                                            {event.attendees} attendee{event.attendees !== 1 ? 's' : ''}
                                          </p>
                                        )}
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
    }
  };

  // Synchronized scrolling effect for timeline
  React.useEffect(() => {
    if (mode !== 'timeline') return;

    const headerScroll = document.getElementById('timeline-header-scroll');
    const bodyScroll = document.getElementById('timeline-body-scroll');

    if (!headerScroll || !bodyScroll) return;

    const syncScroll = (source: HTMLElement, target: HTMLElement) => {
      target.scrollLeft = source.scrollLeft;
    };

    const handleHeaderScroll = () => syncScroll(headerScroll, bodyScroll);
    const handleBodyScroll = () => syncScroll(bodyScroll, headerScroll);

    headerScroll.addEventListener('scroll', handleHeaderScroll);
    bodyScroll.addEventListener('scroll', handleBodyScroll);

    return () => {
      headerScroll.removeEventListener('scroll', handleHeaderScroll);
      bodyScroll.removeEventListener('scroll', handleBodyScroll);
    };
  }, [mode, activeView]);

  return (
    <div className="flex-1 bg-gray-50 p-6">
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Row - Calendar/Timeline Toggle, Search, Filter, New */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Calendar/Timeline Toggle - Fixed hover states */}
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMode('calendar')}
                className={`h-8 px-3 text-sm font-medium ${
                  mode === 'calendar' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                Calendar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMode('timeline')}
                className={`h-8 px-3 text-sm font-medium ${
                  mode === 'timeline' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                Timeline
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search events..." className="pl-10 pr-4 bg-white text-sm h-9 w-64 border-gray-200" />
            </div>

            {/* Filter */}
            <Button variant="outline" size="sm" className="text-gray-600 border-gray-300 h-9 text-sm bg-transparent">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>

            {/* New Event */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="bg-gray-900 text-white hover:bg-gray-800 h-9 text-sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="text-sm">
                  <Video className="w-4 h-4 mr-2" />
                  Meeting
                </DropdownMenuItem>
                <DropdownMenuItem className="text-sm">
                  <MapPin className="w-4 h-4 mr-2" />
                  Site Visit
                </DropdownMenuItem>
                <DropdownMenuItem className="text-sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Second Row - View Options and Date Navigation */}
        <div className={`flex items-center ${mode === 'timeline' ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-4">
            {/* View Options */}
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 px-3 text-sm font-medium ${activeView === 'month' ? 'bg-gray-100 text-gray-900' : 'text-gray-600'}`}
                onClick={() => setActiveView('month')}
              >
                Month
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 px-3 text-sm font-medium ${activeView === 'week' ? 'bg-gray-100 text-gray-900' : 'text-gray-600'}`}
                onClick={() => setActiveView('week')}
              >
                Week
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 px-3 text-sm font-medium ${activeView === 'today' ? 'bg-gray-100 text-gray-900' : 'text-gray-600'}`}
                onClick={() => setActiveView('today')}
              >
                Today
              </Button>
            </div>

            {/* Date Navigation - Centered only for timeline */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => navigatePeriod('prev')}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">{getNavigatorLabel()}</h2>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => navigatePeriod('next')}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Calendar Views */}
        {mode === 'timeline' ? (
          // Full width timeline view
          <div>{renderCalendarContent()}</div>
        ) : (
          // Calendar view with sidebar
          <div className="grid grid-cols-4 gap-6">
            {/* Main Calendar */}
            <div className="col-span-3">{renderCalendarContent()}</div>

            {/* Today Side Panel */}
            <div className="col-span-1">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm sticky top-6 max-h-[calc(100vh-3rem)] flex flex-col">
                <div className="p-6 flex-shrink-0">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500 ml-auto">
                      <span>72°F</span>
                    </div>
                  </div>

                  {/* AI Insight */}
                  <div className="mb-6 p-4 bg-[#FBEAE1] border border-[#F1BBAA] rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#E07A57] rounded-full mt-2 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-[#A14A35] mb-1">No Meeting Today</p>
                        {/* <p className="text-[#CE6B4E]">Perfect for deep work between meetings</p> */}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scrollable Events */}
                <div className="flex-1 overflow-y-auto px-6 pb-6">
                  <div className="space-y-3">
                    {todayEvents.map(event => (
                      <div
                        key={event.id}
                        className="flex flex-col gap-1 rounded-lg border border-gray-200 p-3 bg-white shadow-sm hover:shadow-md transition-shadow"
                      >
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-1">
                          <div
                            className={`w-3 h-3 rounded-full ${event.color.split(' ')[0]} ring-2 ${event.color
                              .split(' ')[1]
                              .replace('border-', 'ring-')}`}
                          />
                          <span className="text-sm font-medium text-gray-900">{event.time}</span>
                        </div>

                        {/* Title */}
                        <h4 className="font-medium text-gray-900 text-sm leading-relaxed mb-1">{event.title}</h4>

                        {/* Project Badge */}
                        <div className="mb-2">
                          <Badge
                            variant="outline"
                            className="text-xs"
                            style={{ color: event.projectTextHex, borderColor: event.projectBorderHex }}
                          >
                            {event.project}
                          </Badge>
                        </div>

                        {/* Meta info */}
                        <div className="text-xs text-gray-600 mb-2">{event.location}</div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-2 text-xs text-gray-500 border-t border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {event.duration}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {event.attendees}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quick Actions */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <Button size="sm" variant="outline" className="w-full text-gray-600 border-gray-300 h-9 text-sm bg-transparent">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Event
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
