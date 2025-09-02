'use client';

import type React from 'react';

import { useEffect, useMemo, useState } from 'react';
import { ProjectNav } from '@/components/project-nav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Search,
  Filter,
  Mail,
  MessageSquare,
  Sparkles,
  CheckCircle,
  Zap,
  Star,
  StarOff,
  Share2,
  MoreHorizontal,
  Paperclip,
  Send,
  Archive,
  EllipsisVertical,
  PaperclipIcon,
  Reply,
  Forward,
  Smile,
  Pin,
  PinOff,
  BellOff,
  MoveRight,
  AlertCircle,
  Bell,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { fetchOnlyProject, fetchProjectEmails, fetchProjects } from '@/supabase/API';
import { Badge } from '@/components/ui/badge';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import EmailIframe from '@/components/inbox/EmailIframe';
// extend once in your app (e.g., in _app.tsx or a utils/date.ts file)
dayjs.extend(relativeTime);

type SourceType = 'Email' | 'Portal' | 'System' | 'AI';

type Thread = {
  id: number;
  from: string;
  avatar: string;
  type: SourceType;
  title: string;
  preview: string;
  projectItem: string;
  received: string;
  unread: boolean;
  selected?: boolean;
  actionCount: number;
  online?: boolean;
  hasAttachments?: boolean;
  pinned?: boolean;
  starred?: boolean;
  messageCount?: number;
  lastUpdated?: string;
  aiNeedsReview?: boolean;
};

type Msg = {
  id: number;
  sender: string;
  avatar: string;
  message: string;
  timestamp: string;
  isClient: boolean;
  attachments: { name: string; type: 'image' | 'file'; size: string }[];
  source?: SourceType;
};

const initialThreads: Thread[] = [
  {
    id: 2,
    from: 'Lighting Supplier',
    avatar: 'LS',
    type: 'Email',
    title: 'Quote #LS-2024-001 - Pendant Lights',
    preview: 'Please find attached our quote...',
    projectItem: 'Pendant Lights',
    received: '4h ago',
    unread: false,
    selected: true,
    actionCount: 0,
    hasAttachments: true,
    pinned: true,
    starred: true,
    messageCount: 12,
    lastUpdated: '2:45 PM',
  },
  {
    id: 1,
    from: 'Sarah Johnson',
    avatar: 'SJ',
    type: 'Portal',
    title: 'Kitchen layout approval needed',
    preview: 'Few questions about the island placement...',
    projectItem: 'Kitchen Island',
    received: '2h ago',
    unread: true,
    actionCount: 2,
    online: true,
    hasAttachments: false,
    messageCount: 9,
    lastUpdated: '3:20 PM',
  },
  {
    id: 3,
    from: 'Techstyles AI',
    avatar: 'AI',
    type: 'AI',
    title: '3 tasks completed, 2 require attention',
    preview: 'Daily project summary; please review decisions...',
    projectItem: 'Daily Summary',
    received: '6h ago',
    unread: true,
    actionCount: 1,
    hasAttachments: false,
    messageCount: 8,
    lastUpdated: '5:05 PM',
    aiNeedsReview: true,
  },
  {
    id: 4,
    from: 'Mike Chen',
    avatar: 'MC',
    type: 'Portal',
    title: 'Electrical outlet placement question',
    preview: 'Need clarification on placement?',
    projectItem: 'Electrical Work',
    received: '1d ago',
    unread: false,
    actionCount: 1,
    online: true,
    hasAttachments: true,
    messageCount: 5,
    lastUpdated: 'Yesterday',
  },
  {
    id: 5,
    from: 'System',
    avatar: 'SY',
    type: 'System',
    title: 'Spec update: Flooring finish v3',
    preview: 'Spec sheet updated by Jane • parquet oak • see Doc...',
    projectItem: 'Flooring',
    received: '2d ago',
    unread: false,
    actionCount: 0,
    hasAttachments: false,
    messageCount: 3,
    lastUpdated: '2 days ago',
  },
];

const baseConversation: Msg[] = [
  {
    id: 1,
    sender: 'Sarah Johnson',
    avatar: 'SJ',
    message: 'Hi team! I reviewed the latest kitchen design...',
    timestamp: '2:30 PM',
    isClient: true,
    attachments: [],
    source: 'Portal',
  },
  {
    id: 2,
    sender: 'Jane Designer',
    avatar: 'JD',
    message: 'Thanks! What specific questions do you have?',
    timestamp: '2:45 PM',
    isClient: false,
    attachments: [],
    source: 'Portal',
  },
  {
    id: 3,
    sender: 'Sarah Johnson',
    avatar: 'SJ',
    message: 'Could we move it closer to the window? See references attached.',
    timestamp: '3:15 PM',
    isClient: true,
    attachments: [
      { name: 'kitchen-inspiration-1.jpg', type: 'image', size: '2.4 MB' },
      { name: 'kitchen-inspiration-2.jpg', type: 'image', size: '1.8 MB' },
    ],
    source: 'Portal',
  },
];

// Icon for source
function getTypeIcon(type: SourceType) {
  switch (type) {
    case 'Email':
      return Mail;
    case 'Portal':
      return MessageSquare;
    case 'System':
      return Zap;
    case 'AI':
      return Sparkles;
    default:
      return MessageSquare;
  }
}

// Display label mapping (AI => AI notes)
function getTypeLabel(type: SourceType) {
  if (type === 'AI') return 'AI notes';
  return type;
}

// Neutral source pill with text
function SourcePill({ type }: { type: SourceType }) {
  const Icon = getTypeIcon(type);
  const label = getTypeLabel(type);
  return (
    <span className="inline-flex items-center rounded-md border border-gray-200 bg-neutral-100 text-gray-700 px-2.5 py-1 text-[11px] font-medium leading-none">
      <Icon className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
      {label}
    </span>
  );
}

// Heuristic: action required
function getActionRequiredCount(t: Thread) {
  let count = 0;
  if (t.actionCount > 0) count += t.actionCount;
  if (t.preview.trim().endsWith('?')) count += 1;
  if (t.hasAttachments) count += 1;
  if (t.type === 'AI' && t.aiNeedsReview) count += 1;
  return count;
}

export default function ProjectMessagesPage({ params }: { params: { id: string } }) {
  const [threads, setThreads] = useState<Thread[]>(initialThreads);
  const [selectedThreadId, setSelectedThreadId] = useState<number>(initialThreads.find(t => t.selected)?.id ?? initialThreads[0].id);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'All' | 'Action-Required' | 'Starred'>('All');
  const [selectedSources, setSelectedSources] = useState<Set<SourceType>>(new Set());
  const [sendVia, setSendVia] = useState<'Email' | 'Portal'>('Portal');
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingList] = useState(false);
  const { toast } = useToast();
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [emails, setEmails] = useState([]);

  const { data: emailData, isLoading: emailLoading } = useQuery({
    queryKey: ['FetchEmail', params?.id],
    queryFn: () => fetchProjectEmails({ projectID: params?.id }),
    enabled: !!params?.id,
  });

  useEffect(() => {
    let result = emailData?.emails || [];

    if (searchText.trim()) {
      const lower = searchText.toLowerCase();
      result = result.filter(
        item =>
          item.snippet?.toLowerCase().includes(lower) ||
          item.subject?.toLowerCase().includes(lower) ||
          item.sender?.name?.toLowerCase().includes(lower)
      );
    }

    // Sort by internalDate (newest first)
    result.sort((a, b) => b.internalDate - a.internalDate);

    setEmails(result);
  }, [searchText, emailData?.emails, emailLoading]);

  // Get Project
  const { data: project, isLoading: ProjectLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => fetchProjects(),
  });

  const selectedThread = useMemo(() => threads.find(t => t.id === selectedThreadId)!, [threads, selectedThreadId]);

  const conversation: Msg[] = useMemo(() => {
    const msgs = [...baseConversation];
    if (selectedThread?.type === 'Email') {
      msgs.unshift({
        id: 0,
        sender: 'Lighting Supplier',
        avatar: 'LS',
        message: 'Dear Jane, attached is our updated quote for the pendant lights.',
        timestamp: '1:55 PM',
        isClient: false,
        attachments: [{ name: 'Quote-LS-2024-001.pdf', type: 'file', size: '320 KB' }],
        source: 'Email',
      });
      while (msgs.length < 8) {
        msgs.push({
          id: msgs.length + 10,
          sender: 'Jane Designer',
          avatar: 'JD',
          message: 'Noted, thanks. We will review and get back to you.',
          timestamp: '2:10 PM',
          isClient: false,
          attachments: [],
          source: 'Email',
        });
      }
    }
    if (selectedThread?.type === 'AI') {
      return msgs.map(m => ({ ...m, source: 'AI' as SourceType }));
    }
    return msgs;
  }, [selectedThread]);

  const filteredThreads = useMemo(() => {
    let list = threads.slice();

    if (tab === 'Action-Required') {
      list = list.filter(t => getActionRequiredCount(t) > 0);
    } else if (tab === 'Starred') {
      list = list.filter(t => t.starred);
    }

    if (selectedSources.size > 0) {
      list = list.filter(t => selectedSources.has(t.type));
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        t =>
          t.from.toLowerCase().includes(q) ||
          t.title.toLowerCase().includes(q) ||
          t.preview.toLowerCase().includes(q) ||
          t.projectItem.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned));
    return list;
  }, [threads, tab, selectedSources, query]);

  const pinned = filteredThreads.filter(t => t.pinned);
  const unpinned = filteredThreads.filter(t => !t.pinned);

  function toggleSource(type: SourceType) {
    setSelectedSources(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  function clearSources() {
    setSelectedSources(new Set());
  }

  function markAllRead() {
    setThreads(prev => prev.map(t => ({ ...t, unread: false })));
    toast({ title: 'All messages marked as read' });
  }

  function onStar(t: Thread) {
    setThreads(prev => prev.map(x => (x.id === t.id ? { ...x, starred: !x.starred } : x)));
  }

  function onPin(t: Thread) {
    setThreads(prev => prev.map(x => (x.id === t.id ? { ...x, pinned: !x.pinned } : x)));
  }

  function onApproveAI(t: Thread) {
    if (t.type !== 'AI') return;
    setThreads(prev => prev.map(x => (x.id === t.id ? { ...x, aiNeedsReview: false, actionCount: Math.max(0, x.actionCount - 1) } : x)));
    toast({ title: 'AI Note approved' });
  }

  const showAISummary = (selectedThread?.messageCount ?? conversation.length) > 6;
  const actionCountForSelected = getActionRequiredCount(selectedThread ?? initialThreads[0]);

  // Placeholder project name for header subline
  const projectName = project?.find(item => item.id == params?.id);

  return (
    <div className="flex-1 bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <ProjectNav projectId={params.id} />

        {/* Top toolbar */}
        <div className="flex items-center justify-between">
          <div className="bg-white border border-gray-200 rounded-lg p-1 flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className={` font-medium px-3 ${
                selectedSources.size === 0
                  ? 'bg-gray-900 hover:bg-gray-900 hover:text-white text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              onClick={clearSources}
            >
              All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={` font-medium px-3 ${
                selectedSources.has('Email')
                  ? 'bg-gray-900 hover:bg-gray-900 hover:text-white text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              onClick={() => toggleSource('Email')}
            >
              Emails
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={` font-medium px-3 ${
                selectedSources.has('Portal')
                  ? 'bg-gray-900 hover:bg-gray-900 hover:text-white text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              onClick={() => toggleSource('Portal')}
            >
              Portal
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={` font-medium px-3 ${
                selectedSources.has('AI')
                  ? 'bg-gray-900 hover:bg-gray-900 hover:text-white text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              onClick={() => toggleSource('AI')}
            >
              AI notes
            </Button>
          </div>

          <div className="flex-1 flex justify-center px-8">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search messages..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                className="pl-10 bg-white border-gray-200 focus:border-gray-300 focus:ring-0"
                aria-label="Search messages"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-gray-700 border-gray-300 bg-transparent rounded-md text-xs">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={markAllRead}
              className="text-gray-700 border-gray-300 bg-transparent rounded-md text-xs"
            >
              <Archive className="w-4 h-4 mr-2" />
              Mark all read
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: thread list */}
          <aside className="bg-white border border-gray-200 rounded-xl shadow-sm">
            {/* Header: three filter pills (clay/terracotta active) */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                {(['All', 'Action-Required', 'Starred'] as const).map(t => (
                  <Button
                    key={t}
                    variant={tab === t ? 'default' : 'outline'}
                    size="sm"
                    className={
                      tab === t
                        ? 'h-8 px-3 text-sm rounded-full bg-[#C76850] text-white hover:bg-[#B85C47] shadow-[inset_0_-1px_0_rgba(0,0,0,0.05)]'
                        : 'h-8 px-3 text-sm rounded-full text-slate-700 border border-slate-300 bg-white hover:bg-slate-50'
                    }
                    onClick={() => setTab(t)}
                    aria-pressed={tab === t}
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>

            {pinned.length > 0 && <div className="px-4 pt-3 text-[11px] text-gray-500 uppercase tracking-wide">Pinned</div>}

            <div className="divide-y divide-gray-100">
              {isLoadingList &&
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={`s-${i}`} className="p-4 min-h-[72px] animate-pulse">
                    <div className="h-4 w-24 bg-neutral-200 rounded mb-2" />
                    <div className="h-3 w-48 bg-neutral-200 rounded" />
                  </div>
                ))}

              {/* {pinned.map(thread => (
                <ThreadRow
                  key={thread.id}
                  thread={thread}
                  isSelected={selectedThreadId === thread.id}
                  onClick={() => setSelectedThreadId(thread.id)}
                  onStar={() => onStar(thread)}
                  onPin={() => onPin(thread)}
                />
              ))} */}
              {/* 
              {unpinned.map(thread => (
                <ThreadRow
                  key={thread.id}
                  thread={thread}
                  isSelected={selectedThreadId === thread.id}
                  onClick={() => setSelectedThreadId(thread.id)}
                  onStar={() => onStar(thread)}
                  onPin={() => onPin(thread)}
                />
              ))} */}

              {emails?.length > 0 &&
                emails?.map(message => (
                  <div
                    key={message.id}
                    onClick={() => setSelectedMessage(message)}
                    className={`flex items-start gap-4 p-4 hover:bg-gray-50 relative transition-colors group cursor-pointer  ${
                      selectedMessage?.id === message.id ? 'bg-greige-100' : ''
                    }`}
                  >
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <EllipsisVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem>
                            <Star className="h-4 w-4 mr-2" />
                            Star
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Pin className="h-4 w-4 mr-2" />
                            Pin
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <BellOff className="h-4 w-4 mr-2" />
                            Mute
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MoveRight className="h-4 w-4 mr-2" />
                            Move to…
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Avatar or fallback icon */}
                    <div className="flex-shrink-0">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="bg-gray-900 text-white text-[10px] font-semibold">
                          {message?.from?.email?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className=" text-gray-900 w-full truncate text-sm">
                          {message?.subject}
                          {/* {getEmailHeader(message?.payload?.headers, 'Subject')} */}
                        </span>

                        <div className="flex items-center  flex-shrink-0 gap-2">
                          <span className="inline-flex items-center rounded-md border border-gray-200 bg-neutral-100 text-gray-700 px-2.5 py-1 text-[11px] leading-none font-medium">
                            <Mail className="h-3.5 w-3.5 mr-1" />
                            Email
                          </span>

                          <span className="text-xs text-gray-500">
                            <span>{dayjs(Number(message?.internalDate)).fromNow()}</span>
                          </span>
                        </div>
                      </div>

                      {/* Subject (if email) + snippet/message */}
                      <p className="text-xs text-gray-600 truncate flex-1 py-1">
                        {/* <span className="font-medium"> {getEmailHeader(message?.payload?.headers, 'Subject')}</span> */}

                        {/* {message.noteTitle ? <span className="font-medium">{message.noteTitle}: </span> : null} */}
                        {message?.snippet}
                      </p>

                      {/* Project line (kept neutral) */}
                      <div className="mt-1 flex items-center gap-2">
                        <span className="inline-flex items-center rounded-md border border-gray-300 text-gray-700 px-2 py-0.5 text-[11px]">
                          {projectName?.name}
                        </span>
                        <AlertCircle className="h-4 w-4 text-[#C76850]" aria-label="Needs attention" title="Needs attention" />
                      </div>
                    </div>
                  </div>
                ))}

              {!isLoadingList && filteredThreads.length === 0 && (
                <div className="p-8 text-center text-sm text-gray-600">
                  {tab === 'All' ? 'No messages yet. Connect email or start a portal thread.' : 'You’re all caught up 🙌'}
                </div>
              )}
            </div>
          </aside>

          {/* Right: reading pane */}
          <section className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col">
            {selectedMessage ? (
              <>
                {/* Header (unchanged) */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <div className="flex -space-x-2">
                        <Avatar className="w-7 h-7 ring-2 ring-white">
                          <AvatarFallback className="bg-gray-900 text-white text-[10px] font-semibold">
                            {selectedMessage?.from?.email?.slice(0, 2).toUpperCase() || 'FR'}
                          </AvatarFallback>
                        </Avatar>
                        <Avatar className="w-7 h-7 ring-2 ring-white">
                          <AvatarFallback className="bg-neutral-300 text-gray-700 text-[10px] font-semibold">
                            {selectedMessage?.to?.email?.slice(0, 2).toUpperCase() || 'TO'}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {<span className="font-semibold text-gray-900 truncate"> {selectedMessage?.subject}</span>}

                        {/* {getEmailAddressFromHeader(selectedMessage?.payload?.headers, `From`)}) */}
                      </h3>
                      {/* <p className="text-sm text-gray-500">{selectedMessage.project}</p> */}
                      {/* <p className="text-sm text-gray-500">{selectedMessage?.from?.email}</p> */}
                      <div className="flex mt-1.5 items-center gap-3">
                        <span className="inline-flex items-center rounded-md border border-gray-300 text-gray-700 px-2 py-0.5 text-[11px]">
                          {projectName?.name}
                        </span>
                        <span>
                          {' '}
                          <Mail className="h-4 w-4" />
                        </span>
                        <span
                          className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#C76850] text-white"
                          title="Needs attention"
                          aria-label="Needs attention"
                        >
                          <AlertCircle className="h-3.5 w-3.5" />
                        </span>
                        {/* <span className="text-[11px] text-gray-500">{dayjs(Number(selectedMessage?.internalDate)).fromNow()}</span> */}

                        <p className="text-[11px] text-gray-500">
                          {`${selectedMessage?.messages?.length ?? conversation.length} messages • last updated ${
                            dayjs(Number(selectedMessage?.internalDate)).isSame(dayjs(), 'day')
                              ? dayjs(Number(selectedMessage?.internalDate)).format('h:mm A')
                              : dayjs(Number(selectedMessage?.internalDate)).format('DD/MM/YYYY h:mm A') ?? 'recently'
                          }`}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                      <Star className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700" aria-label="Share">
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700" aria-label="More">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(window.location.href)}>Copy link</DropdownMenuItem>
                        <DropdownMenuItem>Open in portal/email</DropdownMenuItem>
                        <DropdownMenuItem>Print</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Detail body */}
                {selectedMessage.type === 'ai-note' ? (
                  <>
                    {/* AI Note card preview (neutral styling, same palette) */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      <div className="border border-gray-200 rounded-lg bg-white">
                        <div className="p-4 flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-gray-600 border-gray-300 bg-transparent text-xs">
                              <Sparkles className="w-3 h-3 mr-1" />
                              AI Note
                            </Badge>
                            {selectedMessage.noteSource && (
                              <span className="text-xs text-gray-500 capitalize">{selectedMessage.noteSource}</span>
                            )}
                            {selectedMessage.noteStatus === 'needs_review' && (
                              <Badge variant="outline" className="text-gray-600 border-gray-300 bg-transparent text-[10px]">
                                Needs review
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-gray-900 text-white hover:bg-gray-800"
                              onClick={() => {
                                console.log('Approve AI Note');
                              }}
                            >
                              Approve
                            </Button>
                          </div>
                        </div>

                        <div className="px-4 pb-4 space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{selectedMessage.noteTitle || 'AI-generated note'}</h4>
                            <p className="text-sm text-gray-700 mt-1">{selectedMessage.message}</p>
                          </div>

                          {/* Executive summary */}
                          <section aria-labelledby="exec-summary">
                            <h5 id="exec-summary" className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              Executive summary
                            </h5>
                            <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-gray-700">
                              <li>Lighter-toned flooring options preferred to increase perceived brightness.</li>
                              <li>Durability and low-maintenance prioritized due to anticipated foot traffic.</li>
                              <li>Consider acoustic underlay to mitigate echo in high-ceiling space.</li>
                            </ul>
                          </section>

                          {/* Decisions */}
                          <section aria-labelledby="decisions">
                            <h5 id="decisions" className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              Decisions
                            </h5>
                            <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-gray-700">
                              <li>Drop current hardwood SKU-1823 from shortlist.</li>
                              <li>Evaluate two oak samples with matte finish next visit.</li>
                            </ul>
                          </section>

                          {/* Action items */}
                          <section aria-labelledby="actions">
                            <h5 id="actions" className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              Action items
                            </h5>
                            <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-gray-700">
                              <li>Request quotes for engineered oak options by Friday.</li>
                              <li>Schedule on-site sample review with client next week.</li>
                            </ul>
                          </section>

                          {/* Risks */}
                          <section aria-labelledby="risks">
                            <h5 id="risks" className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              Risks / blockers
                            </h5>
                            <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-gray-700">
                              <li>Lead times on preferred SKUs may extend beyond current milestone.</li>
                            </ul>
                          </section>

                          {/* Recording / attachments (lightweight placeholders) */}
                          <div className="pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-3 text-sm">
                              <span className="text-gray-500">Attachments:</span>
                              <Button variant="outline" size="sm" className="h-7 text-xs bg-transparent">
                                Site photos (2)
                              </Button>
                              <Button variant="outline" size="sm" className="h-7 text-xs bg-transparent">
                                Voice memo
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Quick actions row (neutral) */}
                        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" className="text-gray-700 bg-transparent">
                              Assign to me
                            </Button>
                            <Button variant="outline" size="sm" className="text-gray-700 bg-transparent">
                              Create task
                            </Button>
                            <Button variant="outline" size="sm" className="text-gray-700 bg-transparent">
                              Jump to project
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Messages thread (kept unchanged for non AI Notes) */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {selectedMessage?.messages?.map(item => {
                        return (
                          <div
                            key={item.id}
                            className={cn(
                              'group relative flex items-start gap-3',
                              item?.labelIds?.includes('SENT') ? 'justify-start' : 'justify-end'
                            )}
                          >
                            {item?.labelIds?.includes('SENT') && (
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-gray-900 text-white text-xs font-semibold">
                                  {item?.labelIds?.includes('SENT')
                                    ? item?.to?.name
                                      ? item?.to?.email?.slice(0, 2).toUpperCase()
                                      : item?.to?.email?.slice(0, 2).toUpperCase()
                                    : item?.from?.email
                                    ? item?.from?.email?.slice(0, 2).toUpperCase()
                                    : item?.from?.email?.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div className={cn('w-full max-w-[100%]', item?.labelIds?.includes('SENT') ? 'order-2' : 'order-1')}>
                              <div
                                className={cn(
                                  'rounded-lg p-3',
                                  item?.labelIds?.includes('SENT') ? 'bg-gray-100 text-gray-900' : 'bg-greige-100 !text-white'
                                )}
                              >
                                <div
                                  className={cn(
                                    'mb-1 flex items-center gap-2 text-[11px]',
                                    item?.labelIds?.includes('SENT') ? 'text-gray-600' : 'text-neutral-600'
                                  )}
                                >
                                  <Mail className="w-4 h-4" />
                                  <span>{dayjs(Number(item?.internalDate)).fromNow()}</span>
                                </div>
                                <EmailIframe payload={item.payload} />
                              </div>
                            </div>

                            {/* <iframe
                              className="h-full min-h-[300px] max-h-fit"
                              style={{ width: '100%', border: 'none' }}
                              srcDoc={getEmailBody(item.payload)}
                            /> */}
                            {!item?.labelIds?.includes('SENT') && (
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-gray-900 text-white text-xs font-semibold">
                                  {item?.labelIds?.includes('SENT')
                                    ? item?.to?.name
                                      ? item?.to?.email?.slice(0, 2).toUpperCase()
                                      : item?.to?.email?.slice(0, 2).toUpperCase()
                                    : item?.from?.email
                                    ? item?.from?.email?.slice(0, 2).toUpperCase()
                                    : item?.from?.email?.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a message to view the conversation</p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function ThreadRow({
  thread,
  isSelected,
  onClick,
  onStar,
  onPin,
}: {
  thread: Thread;
  isSelected: boolean;
  onClick: () => void;
  onStar: () => void;
  onPin: () => void;
}) {
  const Icon = getTypeIcon(thread.type);
  const actionRequired = getActionRequiredCount(thread);
  const label = getTypeLabel(thread.type);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => e.key === 'Enter' && onClick()}
      className={cn('group relative p-4 min-h-[72px] cursor-pointer transition-colors', isSelected ? 'bg-greige-100' : 'hover:bg-slate-50')}
    >
      {/* right-edge kebab on hover */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <EllipsisVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={onStar}>
              {thread.starred ? <StarOff className="h-4 w-4 mr-2" /> : <Star className="h-4 w-4 mr-2" />}
              {thread.starred ? 'Unstar' : 'Star'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onPin}>
              {thread.pinned ? <PinOff className="h-4 w-4 mr-2" /> : <Pin className="h-4 w-4 mr-2" />}
              {thread.pinned ? 'Unpin' : 'Pin'}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <BellOff className="h-4 w-4 mr-2" />
              Mute
            </DropdownMenuItem>
            <DropdownMenuItem>
              <MoveRight className="h-4 w-4 mr-2" />
              Move to…
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-start gap-3">
        <Avatar className="w-6 h-6">
          <AvatarFallback className="bg-gray-900 text-white text-[10px] font-semibold">{thread.avatar}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* Line 1 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className={cn('text-sm truncate', thread.unread ? 'font-semibold text-gray-900' : 'text-gray-900')}>{thread.from}</span>
              {/* Source pill with text (AI => AI notes) */}
              <span className="inline-flex items-center rounded-md border border-gray-200 bg-neutral-100 text-gray-700 px-2.5 py-1 text-[11px] leading-none font-medium">
                <Icon className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                {label}
              </span>
              {/* attachments icon remains inline */}
              {thread.hasAttachments && <Paperclip className="w-3.5 h-3.5 text-gray-400" aria-label="Has attachments" />}
            </div>
            <span className="text-xs text-gray-500 shrink-0">{thread.received}</span>
          </div>

          {/* Line 2 */}
          <div className="mt-1 flex items-center gap-2">
            <p className="text-xs text-gray-600 truncate flex-1">
              {thread.title} — {thread.preview}
            </p>
            {/* Removed text StatusBadge to keep the row cleaner */}
          </div>

          {/* Bottom: project chip with compact icons (action/attention next to pill) */}
          <div className="mt-1 flex items-center gap-2">
            <span className="inline-flex items-center rounded-md border border-gray-300 text-gray-700 px-2 py-0.5 text-[11px]">
              {thread.projectItem}
            </span>
            {(actionRequired > 0 || (thread.type === 'AI' && thread.aiNeedsReview)) && (
              <AlertCircle className="h-4 w-4 text-[#C76850]" aria-label="Needs attention" title="Needs attention" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function HeaderIconForSource({ type }: { type: SourceType }) {
  const Icon = getTypeIcon(type);
  return <Icon className="h-4 w-4 text-gray-600" aria-label={getTypeLabel(type)} title={getTypeLabel(type)} />;
}

function TinySourceIcon({ type }: { type: SourceType }) {
  const Icon = getTypeIcon(type);
  return <Icon className="h-3.5 w-3.5" aria-hidden="true" />;
}

function IconGhostButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
}) {
  return (
    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClick} aria-label={label} title={label}>
      <Icon className="h-4 w-4" />
    </Button>
  );
}

function ConvertDialog({ triggerLabel, type }: { triggerLabel: string; type: 'Task' | 'RFI' | 'PO' }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs bg-transparent whitespace-nowrap rounded-md">
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{`Convert to ${type}`}</DialogTitle>
          <DialogDescription>Front-end only placeholder. Select options and confirm to continue.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 w-24">Assignee</label>
            <Input placeholder="Search or select…" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 w-24">Due date</label>
            <Input type="date" />
          </div>
          <div className="flex items-start gap-2">
            <label className="text-sm text-gray-700 w-24 mt-2">Include</label>
            <Textarea placeholder="Paste bullets or select from summary…" className="min-h-[100px]" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button className="bg-gray-900 text-white hover:bg-gray-800">Convert</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
