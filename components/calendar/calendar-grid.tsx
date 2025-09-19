import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Users } from 'lucide-react';

interface Event {
  type: string;
  color: string;
  title: string;
  time: string;
  attendees: number;
}

interface CalendarEvent {
  day: number;
  events: Event[];
}

interface CalendarGridProps {
  currentPeriod: Date;
  events: CalendarEvent[];
}

export function CalendarGrid({ currentPeriod, events }: CalendarGridProps) {
  // Calculate calendar grid data
  const firstDayOfMonth = new Date(currentPeriod.getFullYear(), currentPeriod.getMonth(), 1);
  const lastDayOfMonth = new Date(currentPeriod.getFullYear(), currentPeriod.getMonth() + 1, 0);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const totalDays = lastDayOfMonth.getDate();

  const today = new Date();
  const isCurrentMonth = today.getMonth() === currentPeriod.getMonth() && today.getFullYear() === currentPeriod.getFullYear();

  // Generate days for the grid
  const days = [];
  for (let i = 0; i < 42; i++) {
    const dayNumber = i - startingDayOfWeek + 1;
    const isCurrentDay = isCurrentMonth && dayNumber === today.getDate();
    const isValidDay = dayNumber > 0 && dayNumber <= totalDays;
    const eventData = events.find(e => e.day === dayNumber);

    days.push(
      <div
        key={i}
        className={`min-h-[100px] p-3 text-sm border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
          !isValidDay ? 'text-gray-300 bg-gray-25' : 'text-gray-900'
        } ${isCurrentDay ? 'bg-[#FBEAE1] border-[#F1BBAA] text-[#1F1D1A] font-semibold' : ''}`}
      >
        {isValidDay && (
          <>
            <div className="font-medium mb-2 text-sm">{dayNumber}</div>
            {eventData && (
              <div className="space-y-1">
                {eventData.events.map((event, idx) => (
                  <TooltipProvider key={idx}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className={`w-full h-1.5 rounded-full ${event.color} ring-1 ring-gray-200 cursor-pointer hover:opacity-80`} />
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
  }

  return (
    <div className="grid grid-cols-7 gap-1">
      {/* Weekday headers */}
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
          {day}
        </div>
      ))}
      {/* Calendar days */}
      {days}
    </div>
  );
}
