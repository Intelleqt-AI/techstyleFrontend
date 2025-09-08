'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

type Props = {
  onEventsChange?: (events: any[]) => void;
};

function toRfc3339(d: Date) {
  return d.toISOString();
}

function formatDateLocal(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function GoogleCalendarClient({ onEventsChange }: Props) {
  const [token, setToken] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Create event form state
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [allDay, setAllDay] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem('gmail_access_token');
    setToken(t);
  }, []);

  useEffect(() => {
    if (!token) return;
    fetchEvents();
  }, [token]);

  async function fetchEvents() {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=50&orderBy=startTime&singleEvents=true',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.status === 401) {
        setError('Unauthorized — token expired. Reconnect Google.');
        setEvents([]);
        setLoading(false);
        return;
      }
      const data = await res.json();
      const items = data.items || [];
      setEvents(items);
      if (onEventsChange) onEventsChange(items);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }

  async function createEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return setError('No Google token found.');
    if (!title || !start) return setError('Title and start are required');

    const body: any = {
      summary: title,
      start: {},
      end: {},
    };

    const isDateOnly = allDay || !start.includes('T');

    if (isDateOnly) {
      // All-day event: use date fields. Google Calendar expects end.date to be exclusive
      body.start = { date: start };

      if (end) {
        // If user provided the same end as start, treat it as a single-day event and make end exclusive
        if (end === start) {
          const next = new Date(start);
          next.setDate(next.getDate() + 1);
          body.end = { date: formatDateLocal(next) };
        } else {
          body.end = { date: end };
        }
      } else {
        const next = new Date(start);
        next.setDate(next.getDate() + 1);
        body.end = { date: formatDateLocal(next) };
      }
    } else {
      // dateTime event
      body.start = { dateTime: new Date(start).toISOString() };
      if (end) {
        body.end = { dateTime: new Date(end).toISOString() };
      } else {
        const s = new Date(start);
        const eDate = new Date(s.getTime() + 60 * 60 * 1000);
        body.end = { dateTime: eDate.toISOString() };
      }
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (res.status === 401) {
        setError('Unauthorized — token expired. Reconnect Google.');
        setLoading(false);
        return;
      }
      const created = await res.json();
      setEvents(prev => {
        const next = [created, ...prev];
        if (onEventsChange) onEventsChange(next);
        return next;
      });
      setTitle('');
      setStart('');
      setEnd('');
    } catch (err: any) {
      setError(err.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="space-y-2">
        <div className="text-sm text-gray-600">Google not connected — connect to view and add calendar events.</div>
        <Button size="sm" variant="outline" onClick={() => (window.location.href = '/settings/integration')}>
          Connect Google
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Google Calendar</h4>
        <Badge variant="outline" className="text-xs">
          {loading ? 'Loading' : 'Synced'}
        </Badge>
      </div>

      {error && <div className="text-xs text-red-600">{error}</div>}

      <form onSubmit={createEvent} className="space-y-2">
        <Input placeholder="Event title" value={title} onChange={e => setTitle(e.target.value)} className="text-sm" />
        <div className="flex items-center justify-between text-xs text-gray-600">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={allDay} onChange={e => setAllDay(e.target.checked)} className="h-4 w-4" />
            <span>All-day</span>
          </label>
          <div className="text-right text-xxs text-gray-400">Leave end empty for 1 hour default</div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Input type={allDay ? 'date' : 'datetime-local'} value={start} onChange={e => setStart(e.target.value)} className="text-sm" />
          <Input type={allDay ? 'date' : 'datetime-local'} value={end} onChange={e => setEnd(e.target.value)} className="text-sm" />
        </div>
        <div className="flex gap-2">
          <Button type="submit" size="sm">
            Add to Google
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={fetchEvents}>
            Refresh
          </Button>
        </div>
      </form>

      <div className="max-h-[220px] overflow-auto">
        {events.length === 0 ? (
          <div className="text-sm text-gray-500">No upcoming events</div>
        ) : (
          <ul className="space-y-2">
            {events.map(ev => (
              <li key={ev.id} className="border rounded p-2 text-sm bg-white">
                <div className="font-medium">{ev.summary || '(no title)'}</div>
                <div className="text-xs text-gray-500">
                  {ev.start?.dateTime ? new Date(ev.start.dateTime).toLocaleString() : ev.start?.date || 'All day'}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
