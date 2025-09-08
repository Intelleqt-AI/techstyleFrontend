'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Mic, Calendar, Clock, AlertTriangle, DollarSign, TrendingUp, TrendingDown, ArrowUp, Users } from 'lucide-react';
import { HomeNav } from '@/components/home-nav';
import useFetch from '@/hooks/useFetch';
import useUser from '@/supabase/hook/useUser';
import useTask from '@/supabase/hook/useTask';
import { fetchOnlyProject, fetchProjects, getInvoices, getPurchaseOrder, getTimeTracking } from '@/supabase/API';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import useUsers from '@/hooks/useUsers';
import { useRouter } from 'next/navigation';
import { useCurrency } from '@/hooks/useCurrency';

const gbp = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const updatetaskList = data => {
  return [
    {
      name: 'To Do',
      items: data?.filter(item => item.status == 'todo'),
      status: 'To Do',
      progeressIcon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M5.76839 1.6057C5.74976 1.53414 5.74544 1.45961 5.75565 1.38637C5.76586 1.31313 5.79041 1.24263 5.82789 1.17889C5.86538 1.11515 5.91506 1.05943 5.97411 1.01491C6.03315 0.970395 6.10039 0.937955 6.17198 0.919449C7.37111 0.610184 8.6291 0.610184 9.82823 0.919449C9.96105 0.953455 10.0769 1.0348 10.1539 1.14819C10.231 1.26159 10.264 1.39922 10.2467 1.53523C10.2295 1.67124 10.1631 1.79626 10.0601 1.88679C9.95719 1.97733 9.82471 2.02714 9.6876 2.02687C9.64015 2.02662 9.59292 2.02048 9.54698 2.00859C8.53233 1.74689 7.46788 1.74689 6.45323 2.00859C6.30899 2.0458 6.15589 2.02427 6.0275 1.94875C5.89912 1.87322 5.80593 1.74985 5.76839 1.6057ZM2.78221 2.87765C1.91501 3.76072 1.28601 4.84937 0.954089 6.04171C0.914275 6.18549 0.933207 6.33919 1.00672 6.46901C1.08023 6.59883 1.2023 6.69413 1.34608 6.73394C1.48986 6.77375 1.64356 6.75482 1.77338 6.68131C1.9032 6.6078 1.99849 6.48573 2.03831 6.34195C2.3189 5.33266 2.85116 4.41114 3.58518 3.66375C3.68119 3.55575 3.73196 3.41494 3.72695 3.27052C3.72194 3.12611 3.66155 2.98916 3.55829 2.88807C3.45503 2.78698 3.31683 2.7295 3.17234 2.72757C3.02784 2.72563 2.88815 2.77937 2.78221 2.87765ZM2.03831 9.65648C2.01855 9.58529 1.98496 9.51869 1.93946 9.46048C1.89396 9.40227 1.83744 9.35359 1.77313 9.31722C1.70882 9.28085 1.63797 9.25751 1.56464 9.24852C1.49131 9.23953 1.41692 9.24508 1.34573 9.26484C1.27454 9.2846 1.20794 9.31819 1.14973 9.36369C1.09152 9.40919 1.04284 9.46571 1.00647 9.53002C0.970104 9.59433 0.94676 9.66517 0.937772 9.73851C0.928784 9.81184 0.934329 9.88623 0.954089 9.95742C1.28621 11.1497 1.91518 12.2383 2.78221 13.1215C2.88683 13.2279 3.02942 13.2883 3.17862 13.2896C3.32782 13.2908 3.47141 13.2328 3.5778 13.1282C3.68419 13.0235 3.74466 12.881 3.74591 12.7318C3.74716 12.5825 3.68909 12.439 3.58448 12.3326C2.85136 11.5854 2.31943 10.6648 2.03831 9.65648ZM9.54698 13.9927C8.53237 14.2546 7.46784 14.2546 6.45323 13.9927C6.3813 13.9729 6.30616 13.9677 6.23218 13.9772C6.1582 13.9868 6.08687 14.0109 6.02232 14.0483C5.95778 14.0857 5.90131 14.1356 5.85622 14.195C5.81112 14.2544 5.77829 14.3222 5.75964 14.3944C5.74099 14.4667 5.73689 14.5419 5.74758 14.6157C5.75827 14.6895 5.78354 14.7605 5.82191 14.8244C5.86028 14.8884 5.91099 14.9441 5.97109 14.9883C6.03119 15.0325 6.09948 15.0643 6.17198 15.0818C7.37111 15.3911 8.6291 15.3911 9.82823 15.0818C9.97065 15.0427 10.092 14.9491 10.166 14.8213C10.24 14.6935 10.2608 14.5417 10.2239 14.3987C10.187 14.2557 10.0953 14.133 9.96864 14.057C9.84198 13.981 9.69053 13.9579 9.54698 13.9927ZM14.6552 9.26625C14.5839 9.24648 14.5095 9.24096 14.4361 9.24999C14.3628 9.25901 14.2919 9.28242 14.2276 9.31885C14.1632 9.35529 14.1067 9.40405 14.0613 9.46235C14.0158 9.52064 13.9823 9.58733 13.9626 9.65859C13.6822 10.6677 13.1499 11.5891 12.4157 12.3361C12.364 12.3888 12.3231 12.4512 12.2955 12.5197C12.2678 12.5882 12.254 12.6615 12.2546 12.7354C12.2553 12.8093 12.2706 12.8823 12.2995 12.9503C12.3284 13.0183 12.3704 13.0799 12.4231 13.1317C12.4758 13.1834 12.5382 13.2243 12.6068 13.2519C12.6753 13.2796 12.7486 13.2934 12.8224 13.2928C12.8963 13.2921 12.9693 13.2768 13.0373 13.2479C13.1053 13.219 13.1669 13.177 13.2187 13.1243C14.086 12.2413 14.715 11.1526 15.0468 9.96023C15.0668 9.88895 15.0725 9.81442 15.0636 9.74092C15.0548 9.66742 15.0315 9.5964 14.9951 9.53193C14.9587 9.46745 14.9099 9.4108 14.8516 9.36521C14.7933 9.31961 14.7265 9.28598 14.6552 9.26625ZM13.9619 6.34546C13.9817 6.41666 14.0152 6.48326 14.0607 6.54147C14.1062 6.59968 14.1628 6.64836 14.2271 6.68472C14.2914 6.72109 14.3622 6.74443 14.4356 6.75342C14.5089 6.76241 14.5833 6.75686 14.6545 6.7371C14.7257 6.71735 14.7923 6.68376 14.8505 6.63826C14.9087 6.59276 14.9574 6.53624 14.9937 6.47193C15.0301 6.40762 15.0534 6.33677 15.0624 6.26344C15.0714 6.1901 15.0659 6.11572 15.0461 6.04453C14.7143 4.85212 14.0853 3.76344 13.218 2.88046C13.1662 2.82779 13.1045 2.78583 13.0365 2.75698C12.9685 2.72814 12.8955 2.71297 12.8216 2.71235C12.7477 2.71173 12.6744 2.72567 12.6059 2.75337C12.5375 2.78107 12.4751 2.82198 12.4224 2.87378C12.3697 2.92559 12.3278 2.98725 12.2989 3.05527C12.2701 3.12329 12.2549 3.19632 12.2543 3.27019C12.2537 3.34407 12.2676 3.41735 12.2953 3.48584C12.323 3.55433 12.3639 3.61669 12.4157 3.66937C13.1491 4.41605 13.6811 5.33655 13.9619 6.34476V6.34546Z"
            fill="#1E9D9D"
          />
        </svg>
      ),
    },
    {
      name: 'In Progress',
      items: data?.filter(item => item.status == 'in-progress'),
      status: 'In Progress',
      progeressIcon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M8 0.6875C6.55373 0.6875 5.13993 1.11637 3.9374 1.91988C2.73486 2.72339 1.7976 3.86544 1.24413 5.20163C0.690668 6.53781 0.545856 8.00811 0.828011 9.4266C1.11017 10.8451 1.80661 12.148 2.82928 13.1707C3.85196 14.1934 5.15492 14.8898 6.57341 15.172C7.99189 15.4541 9.46219 15.3093 10.7984 14.7559C12.1346 14.2024 13.2766 13.2651 14.0801 12.0626C14.8836 10.8601 15.3125 9.44628 15.3125 8C15.3105 6.06123 14.5394 4.20246 13.1685 2.83154C11.7975 1.46063 9.93877 0.689547 8 0.6875ZM8 14.1875C6.77623 14.1875 5.57994 13.8246 4.56241 13.1447C3.54488 12.4648 2.75182 11.4985 2.2835 10.3679C1.81518 9.23724 1.69265 7.99314 1.93139 6.79288C2.17014 5.59262 2.75944 4.49011 3.62478 3.62478C4.49012 2.75944 5.59262 2.17014 6.79288 1.93139C7.99314 1.69265 9.23724 1.81518 10.3679 2.2835C11.4985 2.75181 12.4648 3.54488 13.1447 4.56241C13.8246 5.57994 14.1875 6.77623 14.1875 8C14.1856 9.64046 13.5331 11.2132 12.3732 12.3732C11.2132 13.5331 9.64046 14.1856 8 14.1875Z"
            fill="#F7A093"
          />
        </svg>
      ),
    },
    {
      name: 'In Review',
      items: data?.filter(item => item.status == 'in-review'),
      status: 'In Review',
      progeressIcon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M8 0.6875C6.55373 0.6875 5.13993 1.11637 3.9374 1.91988C2.73486 2.72339 1.7976 3.86544 1.24413 5.20163C0.690668 6.53781 0.545856 8.00811 0.828011 9.4266C1.11017 10.8451 1.80661 12.148 2.82928 13.1707C3.85196 14.1934 5.15492 14.8898 6.57341 15.172C7.99189 15.4541 9.46219 15.3093 10.7984 14.7559C12.1346 14.2024 13.2766 13.2651 14.0801 12.0626C14.8836 10.8601 15.3125 9.44628 15.3125 8C15.3105 6.06123 14.5394 4.20246 13.1685 2.83154C11.7975 1.46063 9.93877 0.689547 8 0.6875ZM1.8125 8C1.81436 6.35954 2.46686 4.78681 3.62684 3.62683C4.78681 2.46685 6.35955 1.81436 8 1.8125V14.1875C6.35955 14.1856 4.78681 13.5331 3.62684 12.3732C2.46686 11.2132 1.81436 9.64046 1.8125 8Z"
            fill="#F7A093"
          />
        </svg>
      ),
    },
    {
      name: 'Done',
      items: data?.filter(item => item.status == 'done'),
      status: 'Done',
      progeressIcon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M8 0.6875C6.55373 0.6875 5.13993 1.11637 3.9374 1.91988C2.73486 2.72339 1.7976 3.86544 1.24413 5.20163C0.690668 6.53781 0.545856 8.00811 0.828011 9.4266C1.11017 10.8451 1.80661 12.148 2.82928 13.1707C3.85196 14.1934 5.15492 14.8898 6.57341 15.172C7.99189 15.4541 9.46219 15.3093 10.7984 14.7559C12.1346 14.2024 13.2766 13.2651 14.0801 12.0626C14.8836 10.8601 15.3125 9.44628 15.3125 8C15.3105 6.06123 14.5394 4.20246 13.1685 2.83154C11.7975 1.46063 9.93877 0.689547 8 0.6875ZM11.2105 6.71047L7.27297 10.648C7.22073 10.7003 7.15869 10.7418 7.09041 10.7701C7.02212 10.7984 6.94892 10.8129 6.875 10.8129C6.80108 10.8129 6.72789 10.7984 6.6596 10.7701C6.59131 10.7418 6.52928 10.7003 6.47703 10.648L4.78953 8.96047C4.68399 8.85492 4.62469 8.71177 4.62469 8.5625C4.62469 8.41323 4.68399 8.27008 4.78953 8.16453C4.89508 8.05898 5.03824 7.99969 5.1875 7.99969C5.33677 7.99969 5.47992 8.05898 5.58547 8.16453L6.875 9.45477L10.4145 5.91453C10.4668 5.86227 10.5288 5.82081 10.5971 5.79253C10.6654 5.76424 10.7386 5.74969 10.8125 5.74969C10.8864 5.74969 10.9596 5.76424 11.0279 5.79253C11.0962 5.82081 11.1582 5.86227 11.2105 5.91453C11.2627 5.96679 11.3042 6.02884 11.3325 6.09712C11.3608 6.1654 11.3753 6.23859 11.3753 6.3125C11.3753 6.38641 11.3608 6.4596 11.3325 6.52788C11.3042 6.59616 11.2627 6.65821 11.2105 6.71047Z"
            fill="#00B252"
          />
        </svg>
      ),
    },
  ];
};

function timeFromNow(isoString) {
  const inputDate = new Date(isoString);
  const now = new Date();
  const diffMs = inputDate - now;

  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);
  const diffWeek = Math.round(diffDay / 7);

  if (Math.abs(diffSec) < 60) {
    return diffSec > 0 ? `in ${diffSec} seconds` : `${Math.abs(diffSec)} seconds ago`;
  } else if (Math.abs(diffMin) < 60) {
    return diffMin > 0 ? `in ${diffMin} minutes` : `${Math.abs(diffMin)} minutes ago`;
  } else if (Math.abs(diffHour) < 24) {
    return diffHour > 0 ? `in ${diffHour} hours` : `${Math.abs(diffHour)} hours ago`;
  } else if (Math.abs(diffDay) < 7) {
    return diffDay > 0 ? `in ${diffDay} days` : `${Math.abs(diffDay)} days ago`;
  } else {
    return diffWeek > 0 ? `in ${diffWeek} weeks` : `${Math.abs(diffWeek)} weeks ago`;
  }
}

// Mock user data with role-based permissions
const mockUser = {
  firstName: 'Jane',
  role: 'studio_owner', // "staff" | "studio_owner" | "finance_admin"
  permissions: ['finance.read', 'studio.view'],
};

function getFormattedTimeFromMondayToSaturday(tasks) {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  // Get Monday of the current week
  const monday = new Date(now);
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  // Get Friday of the same week
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4); // +4 days = Friday
  friday.setHours(23, 59, 59, 999);

  return tasks
    .reduce((totalHours, task) => {
      // 1. Check if the task was worked on this week (Mon–Fri)
      const taskDate = new Date(task.timerStart);
      if (taskDate < monday || taskDate > friday) {
        return totalHours;
      }

      // 2. Calculate time from sessions
      let sessionTime = 0;
      if (Array.isArray(task.session)) {
        sessionTime = task.session.reduce((sum, session) => {
          const sessionDate = new Date(session.date);
          if (sessionDate >= monday && sessionDate <= friday) {
            if (session.endTime) {
              // Completed session - always count
              return sum + (Number(session.endTime) - Number(session.startTime));
            } else if (session.startTime && task.isActive && !task.isPaused) {
              // Active session - count current duration
              return sum + (Date.now() - Number(session.startTime));
            }
          }
          return sum;
        }, 0);
      }

      // 3. Add saved totalWorkTime for paused/completed tasks
      let additionalTime = 0;
      if (task.totalWorkTime && (task.isPaused || !task.isActive)) {
        additionalTime = Number(task.totalWorkTime);
      }

      // 4. Convert ms → hours and add to total
      const taskHours = (sessionTime + additionalTime) / (1000 * 60 * 60);
      return totalHours + taskHours;
    }, 0)
    .toFixed(1);
}

function getDailyBreakdown(tasks: any[]): Day[] {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  // Calculate Monday of current week
  const monday = new Date(now);
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  // Days we want (Mon → Fri)
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const dailyHours: Day[] = [];

  // Loop only Mon–Fri (5 days)
  for (let i = 0; i < 5; i++) {
    const dayStart = new Date(monday);
    dayStart.setDate(monday.getDate() + i);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const dayName = daysOfWeek[i];

    // Calculate hours for this day
    const dayHours = tasks.reduce((totalHours, task) => {
      const taskDate = new Date(task.timerStart);
      if (taskDate < dayStart || taskDate > dayEnd) {
        return totalHours;
      }

      // Sessions
      let sessionTime = 0;
      if (Array.isArray(task.session)) {
        sessionTime = task.session.reduce((sum, session) => {
          const sessionDate = new Date(session.date);
          if (sessionDate >= dayStart && sessionDate <= dayEnd) {
            if (session.endTime) {
              return sum + (Number(session.endTime) - Number(session.startTime));
            } else if (session.startTime && task.isActive && !task.isPaused) {
              return sum + (Date.now() - Number(session.startTime));
            }
          }
          return sum;
        }, 0);
      }

      // Paused/completed tasks base time
      let additionalTime = 0;
      if (task.totalWorkTime && (task.isPaused || !task.isActive)) {
        additionalTime = Number(task.totalWorkTime);
      }

      return totalHours + (sessionTime + additionalTime) / (1000 * 60 * 60);
    }, 0);

    dailyHours.push({
      day: dayName,
      hours: parseFloat(dayHours.toFixed(1)),
    });
  }

  return dailyHours;
}

// Scope toggle for owners/admins
function ScopeToggle({ scope, onScopeChange, canSeeStudio }) {
  if (!canSeeStudio) return null;

  return (
    <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-1">
      <button
        onClick={() => onScopeChange('my')}
        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
          scope === 'my' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-700 hover:text-neutral-900'
        }`}
      >
        My View
      </button>
      <button
        onClick={() => onScopeChange('studio')}
        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
          scope === 'studio' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-700 hover:text-neutral-900'
        }`}
      >
        Studio View
      </button>
    </div>
  );
}

// Dashboard card components with role-based data
function TodaysMeetingsCard({ scope, userRole }) {
  const myMeetings = [
    // { id: 1, title: 'No Meeting', time: 'Upcoming', client: 'Upcoming', attendee: true },
    // { id: 2, title: 'Material Selection', time: '2:30 PM', client: 'TechCorp', attendee: true },
    // { id: 3, title: 'Team Standup', time: '4:00 PM', client: 'Internal', attendee: true },
  ];

  const studioMeetings = [...myMeetings];

  const meetings = scope === 'studio' ? studioMeetings : myMeetings;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-slatex-600" />
        <h3 className="font-semibold text-neutral-900">Today's Meetings</h3>
      </div>
      <div className="space-y-3 flex-1">
        {meetings?.length > 0 ? (
          meetings.slice(0, 3).map(meeting => (
            <div key={meeting.id} className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${meeting.attendee ? 'bg-sage-500' : 'bg-greige-500'}`}></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">{meeting.title}</p>
                <p className="text-xs text-neutral-600">
                  {meeting.time} • {meeting.client}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-neutral-400 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7H3v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-neutral-500 font-medium text-sm">No meetings today</p>
            <p className="text-neutral-400 text-xs mt-1">Relax! You don’t have any scheduled meetings.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useUser();
  const [myTask, setMyTask] = useState([]);
  const [tasks, setTasks] = useState([]);
  const { data: taskData, isLoading: taskLoading } = useTask();
  const [tracking, setTracking] = useState([]);
  const [userTime, setUserTime] = useState(null);
  const { currency, isLoading: currencyLoading } = useCurrency();
  const { users } = useUsers();
  const admins = [
    'david.zeeman@intelleqt.ai',
    'roxi.zeeman@souqdesign.co.uk',
    'risalat.shahriar@intelleqt.ai',
    'dev@intelleqt.ai',
    'saif@intelleqt.ai',
  ];

  const {
    data: InvoiceData,
    isLoading: InvoiceLoading,
    refetch: InvoiceRefetch,
  } = useQuery({
    queryKey: ['invoices'],
    queryFn: getInvoices,
  });

  const { data, isLoading: Poloading } = useQuery({
    queryKey: ['pruchaseOrder'],
    queryFn: getPurchaseOrder,
  });

  // Calculate totals for stats
  let totalPurchaseOrder = 0;
  let totalInvoiceOrder = 0;

  InvoiceData?.data?.forEach(item => {
    const temp =
      item?.products?.reduce((total, product) => {
        const amount = parseFloat(product.amount.replace(/[^0-9.-]+/g, ''));
        return total + amount * product.QTY;
      }, 0) || 0;

    totalInvoiceOrder += temp;
  });

  data?.data?.forEach(item => {
    const temp =
      item?.products?.reduce((total, product) => {
        const amount = parseFloat(product.amount.replace(/[^0-9.-]+/g, ''));
        return total + amount * product.QTY;
      }, 0) || 0;

    totalPurchaseOrder += temp;
  });

  const {
    data: project,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });

  const { data: trackingData, isLoading: trackingLoading } = useQuery({
    queryKey: ['Time Tracking'],
    queryFn: getTimeTracking,
  });

  function getFormattedTimeFromMondayToSaturday(tasks) {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    // Get Monday of the current week
    const monday = new Date(now);
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    monday.setDate(now.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    // Get Friday of the same week
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4); // +4 days = Friday
    friday.setHours(23, 59, 59, 999);

    return tasks
      .reduce((totalHours, task) => {
        // 1. Check if the task was worked on this week (Mon–Fri)
        const taskDate = new Date(task.timerStart);
        if (taskDate < monday || taskDate > friday) {
          return totalHours;
        }

        // 2. Calculate time from sessions
        let sessionTime = 0;
        if (Array.isArray(task.session)) {
          sessionTime = task.session.reduce((sum, session) => {
            const sessionDate = new Date(session.date);
            if (sessionDate >= monday && sessionDate <= friday) {
              if (session.endTime) {
                // Completed session - always count
                return sum + (Number(session.endTime) - Number(session.startTime));
              } else if (session.startTime && task.isActive && !task.isPaused) {
                // Active session - count current duration
                return sum + (Date.now() - Number(session.startTime));
              }
            }
            return sum;
          }, 0);
        }

        // 3. Add saved totalWorkTime for paused/completed tasks
        let additionalTime = 0;
        if (task.totalWorkTime && (task.isPaused || !task.isActive)) {
          additionalTime = Number(task.totalWorkTime);
        }

        // 4. Convert ms → hours and add to total
        const taskHours = (sessionTime + additionalTime) / (1000 * 60 * 60);
        return totalHours + taskHours;
      }, 0)
      .toFixed(1);
  }

  function getTrackingByUser(email) {
    if (trackingLoading || !trackingData?.data) return [];
    // const processedTasks = trackingData.data.filter(item => item.isActive);
    const filterByEmail = trackingData?.data?.filter(item => item.creator == email);

    return filterByEmail;
  }

  function enrichUsersWithProjectCount(users) {
    if (!users) return [];

    return users.map(user => {
      const totalTime = getFormattedTimeFromMondayToSaturday(getTrackingByUser(user.email));

      return {
        name: user.name,
        totalTime,
      };
    });
  }

  useEffect(() => {
    if (trackingLoading || !user?.email) return;
    const filterByEmail = trackingData?.data?.filter(item => item.creator === user.email);
    setTracking(filterByEmail ?? []);
  }, [trackingLoading, trackingData, user?.email]);

  useEffect(() => {
    if (isLoading || trackingLoading) return;
    setUserTime(enrichUsersWithProjectCount(users?.data));
  }, [users?.data, project, isLoading, trackingLoading]); // Projects

  const timeDisplay = getDailyBreakdown(tracking);
  const router = useRouter();

  function JumpBackInSection({ scope, userRole }) {
    const myProjects = project;

    const studioProjects = project;

    const projects = !isLoading && project;
    // const projects = scope === 'studio' ? studioProjects : myProjects;
    // casj flow - po

    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-neutral-900">Jump Back In</h3>
        <div className="grid gap-3">
          {!isLoading &&
            projects.slice(0, 4).map(project => (
              <div
                onClick={() => router.push(`/projects/${project?.id}`)}
                key={project.id}
                className="flex items-center gap-4 p-4 bg-white rounded-lg border border-greige-500/30 hover:shadow-sm transition-shadow cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-neutral-900 truncate">{project.name}</h4>
                  <div className="flex items-center gap-4 mt-1">
                    <Badge className="text-xs bg-greige-100 text-ink capitalize border border-greige-500/30">
                      {project.phase ? project.phase : 'Initial'}
                    </Badge>
                    <span className="text-xs text-neutral-600">{timeFromNow(project.created_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-neutral-900">
                      {calculateProjectProgress(project.id, taskData?.data, isLoading)}%
                    </div>
                    <Progress
                      value={calculateProjectProgress(project.id, taskData?.data, isLoading)}
                      className="w-16 h-1 mt-1 [&>div]:bg-clay-500"
                    />
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  }

  function TimeTrackedCard({ scope, userRole }) {
    const teamCapacity = [
      { name: 'Saif Hasan', hours: 0.9, capacity: 40 },
      { name: 'David Zameen', hours: 0, capacity: 40 },
      { name: 'Rishalat Shahriar', hours: 0, capacity: 40 },
    ];

    if (scope === 'studio') {
      return (
        <div className="h-full flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-slatex-600" />
            <h3 className="font-semibold text-neutral-900">Team Capacity</h3>
          </div>
          <div className="space-y-3 flex-1">
            {userTime?.slice(0, 6).map(member => (
              <div key={member.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-900">{member.name}</span>
                  <span className="text-neutral-600">{member.totalTime}h / 40h</span>
                </div>
                <Progress value={(member.totalTime / 40) * 100} className="h-1 [&>div]:bg-olive-600" />
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-slatex-600" />
          <h3 className="font-semibold text-neutral-900">Time Tracked</h3>
        </div>
        <div className="space-y-4 flex-1">
          <div>
            <p className="text-xl font-semibold text-neutral-900">{getFormattedTimeFromMondayToSaturday(tracking)} hr</p>
            <p className="text-xs text-neutral-600">This week</p>
          </div>
          <div className="space-y-2">
            {timeDisplay?.map(day => (
              <div key={day.day} className="flex items-center justify-between">
                <span className="text-sm text-neutral-700">{day.day}</span>
                <div className="flex items-center gap-2 flex-1 ml-3">
                  <Progress value={(day.hours / 10) * 100} className="h-1 flex-1 [&>div]:bg-slatex-700" />
                  <span className="text-sm font-medium text-neutral-900 w-8 text-right">{day.hours.toFixed(2)}h</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const [prompt, setPrompt] = useState('');
  const [scope, setScope] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dashboard-scope') || 'my';
    }
    return 'my';
  });

  const canSeeStudio = mockUser.role === 'studio_owner' || mockUser.role === 'finance_admin';
  const canSeeFinance = mockUser.permissions.includes('finance.read');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dashboard-scope', scope);
    }
  }, [scope]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      console.log('Submitted prompt:', prompt);
      setPrompt('');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const quickActions = ['Schedule client call', 'Send invoice reminder', 'Update project status', 'Review proposals'];

  const myRecentTask = tasks => {
    const now = new Date();
    return tasks?.filter(task => task.status !== 'done' && new Date(task.dueDate) < now);
  };

  const myTaskList = tasks => {
    if (!tasks) return;
    if (!user) return [];
    if (admins.includes(user?.email)) {
      return tasks;
    }
    return tasks?.filter(task => {
      if (task.assigned && Array.isArray(task.assigned) && task.assigned.length > 0) {
        return task.assigned.some(assignee => assignee.email === user.email);
      }
      return false;
    });
  };

  const calculateProjectProgress = (projectId: string, tasks: Task[] | undefined, isLoading: boolean): number => {
    if (isLoading || !tasks) return 0;

    const projectTasks = tasks.filter(item => item.projectID === projectId);
    if (projectTasks.length === 0) return 0;

    const completedTasks = projectTasks.filter(task => task.status === 'done');
    const progress = Math.floor((completedTasks.length / projectTasks.length) * 100);

    return progress;
  };

  useEffect(() => {
    if (taskLoading) return;
    setMyTask(myTaskList(taskData.data));
    const myTask = myTaskList(taskData.data);
    const removedArhive = myTask.filter(item => !item.isArchived);
    setTasks(taskData && taskData.data.length > 0 && updatetaskList(removedArhive));
  }, [taskData, taskLoading, user?.email]);

  const overDueTask = myRecentTask(myTask);

  const getSummary = () => {
    if (scope === 'studio') {
      return [
        { color: 'clay', text: `${overDueTask?.length} overdue tasks across 3 projects` },
        { color: 'sage', text: `Team utilisation at ${(totalInvoiceOrder - totalPurchaseOrder) / totalPurchaseOrder}%` },
        {
          color: 'olive',
          text: `${!currencyLoading && (currency?.symbol || '£')}${(
            totalInvoiceOrder - totalPurchaseOrder
          ).toLocaleString()} profit this month`,
        },
      ];
    }
    return [
      { color: 'sage', text: 'No meetings today' },
      { color: 'clay', text: `${overDueTask?.length} overdue tasks` },
      {
        color: 'olive',
        text: `${!isLoading && project[0]?.name} ${calculateProjectProgress(
          !isLoading && project[0]?.id,
          taskData?.data,
          taskLoading
        )}% complete`,
      },
    ];
  };

  function OverdueTasksCard({ scope, userRole }) {
    const myTasks = [
      { id: 1, title: 'Review fabric samples', project: 'Luxury Penthouse', assignee: 'me' },
      { id: 2, title: 'Client presentation prep', project: 'Modern Office', assignee: 'me' },
    ];

    const studioTasks = [
      ...myTasks,
      { id: 3, title: 'Budget approval request', project: 'Boutique Hotel', assignee: 'Mike Johnson' },
      { id: 4, title: 'Contract review', project: 'Retail Space', assignee: 'Sarah Wilson' },
    ];

    const tasks = scope === 'studio' ? overDueTask : overDueTask;

    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-terracotta-600" />
          <h3 className="font-semibold text-neutral-900">Overdue Tasks</h3>
          <Badge className="bg-terracotta-600/10 text-terracotta-600 border border-terracotta-600/30 text-xs">{overDueTask?.length}</Badge>
        </div>
        <div className="space-y-3 flex-1">
          {tasks?.slice(0, 5).map(task => (
            <div key={task.id} className="flex items-center gap-3">
              <div className="w-2 h-2 bg-terracotta-600 rounded-full flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium capitalize text-neutral-900 truncate">{task.name}</p>
                <p className="text-xs capitalize text-neutral-600">
                  {/* {task.project} {scope === 'studio' && task.assignee !== 'me' && `• ${task.assignee}`} */}
                  {(project && project.find(p => p.id === task?.projectID)?.name) || 'No Project'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function FinancialKPIsCard({ scope, userRole }) {
    const myKPIs = [
      {
        label: 'My Budget Util',
        value: `${!currencyLoading && (currency?.symbol || '£')}${getFormattedTimeFromMondayToSaturday(tracking) * 20}`,
        trend: 'up',
        change: '+5%',
      },
      { label: 'Hours This Week', value: getFormattedTimeFromMondayToSaturday(tracking) || '0', trend: 'up', change: '+2h' },
      { label: 'Projects Active', value: project?.length, trend: 'neutral', change: '0' },
    ];

    const studioKPIs = [
      {
        label: 'Studio Profit',
        value: `${!currencyLoading && (currency?.symbol || '£')}${(totalInvoiceOrder - totalPurchaseOrder).toLocaleString()}`,
        trend: 'up',
        change: '+12%',
      },
      { label: 'Utilisation', value: `${(totalInvoiceOrder - totalPurchaseOrder) / totalPurchaseOrder}%`, trend: 'up', change: '+3%' },
      {
        label: 'Cash Flow',
        value: `${!currencyLoading && (currency?.symbol || '£')}${totalPurchaseOrder.toLocaleString()}`,
        trend: 'down',
        change: '-8%',
      },
    ];

    const kpis = scope === 'studio' ? studioKPIs : myKPIs;

    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-slatex-600" />
          <h3 className="font-semibold text-neutral-900">{scope === 'studio' ? 'Studio KPIs' : 'My KPIs'}</h3>
        </div>
        <div className="space-y-4 flex-1">
          {kpis.map((kpi, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-neutral-900">{kpi.value}</p>
                <p className="text-xs text-neutral-600">{kpi.label}</p>
              </div>
              <div className="flex items-center gap-1">
                {kpi.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-olive-700" />
                ) : kpi.trend === 'down' ? (
                  <TrendingDown className="w-4 h-4 text-terracotta-600" />
                ) : (
                  <div className="w-4 h-4" />
                )}
                <span
                  className={`text-xs font-medium ${
                    kpi.trend === 'up' ? 'text-olive-700' : kpi.trend === 'down' ? 'text-terracotta-600' : 'text-neutral-500'
                  }`}
                >
                  {kpi.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-neutral-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <HomeNav />

        {/* Header */}
        <section className="flex items-center justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-6">
              <h1 className="text-2xl font-semibold text-neutral-900">
                {getGreeting()}, {user?.name} 👋
              </h1>
              <div className="text-sm text-neutral-600 font-medium">
                {new Date().toLocaleDateString('en-GB', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </div>
            </div>

            {/* Status indicators */}
            <div className="flex items-center gap-4">
              {getSummary().map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      item.color === 'clay'
                        ? 'bg-clay-500'
                        : item.color === 'sage'
                        ? 'bg-sage-500'
                        : item.color === 'olive'
                        ? 'bg-olive-600'
                        : 'bg-slatex-500'
                    }`}
                  ></div>
                  <span className="text-sm text-neutral-700">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <ScopeToggle scope={scope} onScopeChange={setScope} canSeeStudio={canSeeStudio} />
        </section>

        {/* Dashboard Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card className="p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow h-80">
            <TodaysMeetingsCard scope={scope} userRole={mockUser.role} />
          </Card>
          <Card className="p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow h-80">
            <OverdueTasksCard scope={scope} userRole={mockUser.role} />
          </Card>
          {canSeeFinance && (
            <Card className="p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow h-80">
              <FinancialKPIsCard scope={scope} userRole={mockUser.role} />
            </Card>
          )}
          <Card className="p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow h-80">
            <TimeTrackedCard scope={scope} userRole={mockUser.role} />
          </Card>
        </section>

        {/* Bottom Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Jump Back In - 2/3 width */}
          <div className="lg:col-span-2">
            <JumpBackInSection scope={scope} userRole={mockUser.role} />
          </div>

          {/* AI Prompt Section - 1/3 width */}
          <div className="space-y-4">
            <h3 className="font-semibold text-neutral-900">Quick Actions</h3>

            {/* AI Prompt Bar */}
            <form onSubmit={handleSubmit} className="relative">
              <div className="relative">
                <Mic className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slatex-500" />
                <Input
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="Ask: What needs my attention?"
                  className="pl-10 pr-10 py-3 rounded-lg border-greige-500/30 text-sm"
                />
                {prompt.trim() && (
                  <Button
                    type="submit"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-md w-6 h-6 p-0 bg-neutral-900 text-white hover:bg-neutral-800"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </form>

            {/* Quick Action Pills */}
            <div className="flex flex-wrap gap-2">
              {quickActions.slice(0, 4).map((action, index) => (
                <Badge
                  key={index}
                  className="cursor-pointer bg-greige-100 text-ink hover:bg-greige-300/60 transition-colors text-xs px-3 py-1 border border-greige-500/30"
                >
                  {action}
                </Badge>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
