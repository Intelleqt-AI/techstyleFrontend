'use client';

import { useEffect, useMemo, useState } from 'react';
import { HomeNav } from '@/components/home-nav';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  MessageSquare,
  AtSign,
  Bell,
  Archive,
  Search,
  Filter,
  Send,
  Paperclip,
  Smile,
  MoreHorizontal,
  Reply,
  Forward,
  Star,
  Mail,
  Sparkles,
  FolderPlus,
  X,
} from 'lucide-react';
import useUser from '@/hooks/useUser';
import { addProjectEmail, fetchOnlyProject, fetchProjects, getContact } from '@/supabase/API';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchInboxEmails,
  fetchSentEmails,
  getEmailAddressFromHeader,
  getEmailBody,
  getEmailHeader,
  getSenderName,
} from '@/supabase/utils';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import EmailIframe from '@/components/inbox/EmailIframe';
import Drawer from 'react-modern-drawer';
import { Checkbox } from '@/components/ui/checkbox';

// extend once in your app (e.g., in _app.tsx or a utils/date.ts file)
dayjs.extend(relativeTime);

type InboxType = 'all' | 'mentions' | 'system' | 'emails' | 'ai-notes';
type MessageType = 'mention' | 'system' | 'comment' | 'email' | 'ai-note';
type NoteStatus = 'needs_review' | 'published';
type NoteSource = 'zoom' | 'mobile' | 'upload';

type ConversationItem = {
  id: number;
  sender: string;
  content: string;
  time: string;
  avatar: string | null;
};

type InboxItem = {
  id: number;
  type: MessageType;
  from: string;
  message: string;
  subject?: string;
  project: string;
  time: string;
  unread: boolean;
  avatar: string | null;
  conversation: ConversationItem[];
  // Optional fields for AI Notes
  noteStatus?: NoteStatus;
  noteSource?: NoteSource;
  noteTitle?: string;
};

const messages: InboxItem[] = [
  {
    id: 1,
    type: 'mention',
    from: 'Mike Johnson',
    message: '@jane Can you review the kitchen layout for the TechCorp project?',
    project: 'Modern Office Space',
    time: '2h ago',
    unread: true,
    avatar: '/placeholder.svg?height=32&width=32',
    conversation: [
      {
        id: 1,
        sender: 'Mike Johnson',
        content:
          "@jane Can you review the kitchen layout for the TechCorp project? I've attached the latest drawings and would love your feedback on the island placement.",
        time: '2h ago',
        avatar: '/placeholder.svg?height=32&width=32',
      },
      {
        id: 2,
        sender: 'You',
        content: "Thanks Mike! I'll take a look at the drawings and get back to you by end of day.",
        time: '1h ago',
        avatar: '/placeholder.svg?height=32&width=32',
      },
    ],
  },
  {
    id: 2,
    type: 'system',
    from: 'System',
    message: 'Budget approval required for Luxury Penthouse project',
    project: 'Luxury Penthouse',
    time: '4h ago',
    unread: true,
    avatar: null,
    conversation: [
      {
        id: 1,
        sender: 'System',
        content:
          'Budget approval required for Luxury Penthouse project. The current budget request exceeds the approved amount by $15,000.',
        time: '4h ago',
        avatar: null,
      },
    ],
  },
  {
    id: 3,
    type: 'comment',
    from: 'Sarah Wilson',
    message: 'Added new lighting options to the mood board',
    project: 'Boutique Hotel',
    time: '6h ago',
    unread: false,
    avatar: '/placeholder.svg?height=32&width=32',
    conversation: [
      {
        id: 1,
        sender: 'Sarah Wilson',
        content: 'Added new lighting options to the mood board. I think the pendant lights would work really well in the lobby area.',
        time: '6h ago',
        avatar: '/placeholder.svg?height=32&width=32',
      },
    ],
  },
  // Updated: David Chen item converted to an AI Note preview
  {
    id: 4,
    type: 'ai-note',
    from: 'David Chen',
    noteTitle: 'Site Visit — Master Bedroom Flooring',
    message:
      'AI summary: Client wants to explore alternative flooring options for the master bedroom. Current hardwood feels too dark; consider lighter oak or warm-toned engineered wood with matt finish.',
    project: 'Luxury Penthouse',
    time: '8h ago',
    unread: false,
    avatar: '/placeholder.svg?height=32&width=32',
    noteStatus: 'needs_review',
    noteSource: 'mobile',
    conversation: [
      {
        id: 1,
        sender: 'AI Note',
        content:
          "Executive summary drafted. Tap 'Open' to review decisions and action items. Attachments include two photos and a voice memo.",
        time: '8h ago',
        avatar: null,
      },
    ],
  },
  {
    id: 5,
    type: 'system',
    from: 'System',
    message: 'New contractor proposal received for electrical work',
    project: 'Modern Office Space',
    time: '1d ago',
    unread: false,
    avatar: null,
    conversation: [
      {
        id: 1,
        sender: 'System',
        content:
          'New contractor proposal received for electrical work on the Modern Office Space project. Review required within 48 hours.',
        time: '1d ago',
        avatar: null,
      },
    ],
  },
  // Example email item
  {
    id: 6,
    type: 'email',
    from: 'Emily Parker',
    subject: 'Re: FF&E selections for breakout areas',
    message: 'Hi team — attaching revised FF&E selections for the breakout areas. Let me know if you have questions.',
    project: 'Modern Office Space',
    time: '3h ago',
    unread: true,
    avatar: '/placeholder.svg?height=32&width=32',
    conversation: [
      {
        id: 1,
        sender: 'Emily Parker',
        content:
          'Hi team — attaching revised FF&E selections for the breakout areas. Please review the updated armchair and side table options. We can sync tomorrow if needed.',
        time: '3h ago',
        avatar: '/placeholder.svg?height=32&width=32',
      },
      {
        id: 2,
        sender: 'You',
        content: "Thanks, Emily! Received. We'll review these selections and circle back with any questions.",
        time: '2h ago',
        avatar: '/placeholder.svg?height=32&width=32',
      },
    ],
  },
];

export default function InboxPage() {
  // const [filter, setFilter] = useState<InboxType>('all');
  const [selectedMessage, setSelectedMessage] = useState<InboxItem | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [currentTab, setCurrentTab] = useState('Inbox');
  const [filter, setFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [isReply, setIsReply] = useState(false);
  const [reply, setReply] = useState('');
  const { user } = useUser();
  const [contactEmails, setContactEmails] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [emails, setEmails] = useState([]);
  const [Ailoading, setAiLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [error, setError] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [emailForm, setEmailForm] = useState({
    to: '',
    subject: '',
    body: '',
  });
  const [selectedProject, setSelectedProject] = useState('');
  const [projectOpen, setProjectOpen] = useState(false);

  // Get Contact for filter
  const { data: contactData, isLoading: contactLoading } = useQuery({
    queryKey: ['getContacts'],
    queryFn: getContact,
  });

  // Get Project
  const { data: project, isLoading: ProjectLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => fetchProjects(),
  });

  function findProjectInText(text) {
    if (!text || !project || !project.length) return null;

    for (const item of project) {
      // Case-insensitive match
      const projectName = item.name;
      if (text.toLowerCase().includes(projectName.toLowerCase())) {
        return projectName;
      }
    }

    return null; // No match
  }

  function decodeHtmlEntities(text) {
    if (!text) return '';
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  }

  // Send emails to project
  const mutation = useMutation({
    mutationKey: ['email'],
    mutationFn: addProjectEmail,
    onSuccess: e => {
      toast.success(e.message);
      setProjectOpen(false);
      setSelectedProject('');
    },
    onError: e => {
      toast.error(e.message);
    },
  });

  // Get Project
  // const { data: project, isLoading: ProjectLoading } = useQuery({
  //   queryKey: ['projects'],
  //   queryFn: () => fetchProjects(),
  // });

  useEffect(() => {
    if (contactLoading) {
      return;
    }
    setContactEmails(contactData?.data?.map(item => item.email).filter(Boolean));
  }, [contactLoading, contactData?.data]);

  // Fetch inbox email
  const {
    data: inboxEmails,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['inboxEmails', accessToken, process.env.NEXT_PUBLIC_GMAIL_API_KEY],
    queryFn: () => fetchInboxEmails({ token: accessToken }),
    enabled: !!accessToken,
  });

  // Fetch Sent Emails
  const { data: sentEmails, isLoading: sentEmailLoading } = useQuery({
    queryKey: ['sentEmails', accessToken],
    queryFn: () => fetchSentEmails({ token: accessToken }),
    enabled: !!accessToken,
  });

  // Filter read , unread, send , inbox
  useEffect(() => {
    let result = inboxEmails;
    // if (currentTab === 'all' && !isLoading) {
    //   result = inboxEmails;
    // }

    // else if (currentTab === 'Sent' && !sentEmailLoading) {
    //   result = sentEmails;
    // }
    //  else if (currentTab == 'Drafts' && !draftEmailLoading) {
    //   result = draftEmails;
    // }

    // if (filter) {
    //   result = result.filter(item => item.labelIds?.includes('UNREAD'));
    // }

    if (searchText.trim()) {
      const lower = searchText.toLowerCase();
      result = result.filter(
        item =>
          item.snippet?.toLowerCase().includes(lower) ||
          item.subject?.toLowerCase().includes(lower) ||
          item.sender?.name?.toLowerCase().includes(lower)
      );
    }

    setEmails(result);
  }, [searchText, inboxEmails, isLoading]);

  // Initialize Google Identity Services
  useEffect(() => {
    const initializeGoogleServices = async () => {
      try {
        // Load Google Identity Services
        if (!window.google) {
          const script = document.createElement('script');
          script.src = 'https://accounts.google.com/gsi/client';
          script.async = true;
          script.defer = true;
          script.onload = () => {
            initGoogleAuth();
          };
          script.onerror = () => {
            setError('Failed to load Google Identity Services');
          };
          document.head.appendChild(script);
        } else {
          initGoogleAuth();
        }

        // Load Gmail API
        if (!window.gapi) {
          const gapiScript = document.createElement('script');
          gapiScript.src = 'https://apis.google.com/js/api.js';
          gapiScript.onload = () => {
            window.gapi.load('client', initializeGapiClient);
          };
          gapiScript.onerror = () => {
            setError('Failed to load Google API script');
          };
          document.head.appendChild(gapiScript);
        } else {
          window.gapi.load('client', initializeGapiClient);
        }
      } catch (err) {
        setError(`Initialization error: ${err.message}`);
      }
    };

    initializeGoogleServices();
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem('gmail_access_token');
    if (!savedToken) {
      signOut();
      window.location.href = '/settings/studio/integrations';
    }
    if (savedToken) {
      setAccessToken(savedToken);
      setIsSignedIn(true);
      loadUserProfile(savedToken);
    }
  }, []);

  const initGoogleAuth = () => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: `${process.env.NEXT_PUBLIC_GMAIL_API_KEY}`,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: false,
      });
    }
  };

  const initializeGapiClient = async () => {
    try {
      console.log('Initializing GAPI:', window.gapi?.client);
      await window.gapi.client.init({
        apiKey: `${process.env.NEXT_PUBLIC_GMAIL_API_KEY}`,
        discoveryDocs: [`${process.env.NEXT_PUBLIC_DISCOVERY_DOC}`],
      });
      console.log('✅ Gmail API initialized');
    } catch (err) {
      console.error('❌ GAPI Init Error:', err);
      setError(`Gmail API initialization failed: ${err.message}`);
    }
  };

  const handleCredentialResponse = async response => {
    try {
      // This is for ID token, we need access token for Gmail API
      console.log('Credential response received');
      // We'll use the OAuth2 flow instead for access token
    } catch (err) {
      setError(`Credential handling error: ${err.message}`);
    }
  };

  useEffect(() => {
    const listener = async event => {
      if (event.origin !== window.location.origin) return;
      if (event.data.type === 'OAUTH_SUCCESS') {
        const token = event.data.accessToken;
        localStorage.setItem('gmail_access_token', token);
        setAccessToken(token);
        setIsSignedIn(true);
        await loadUserProfile(token);
      }
    };

    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }, []);

  const loadUserProfile = async token => {
    try {
      const response = await fetch(`https://www.googleapis.com/gmail/v1/users/me/profile?key=${process.env.NEXT_PUBLIC_GMAIL_API_KEY}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.log('not signed in');
        throw new Error(`Profile fetch failed: ${response.status}`);
      }

      const profile = await response.json();
      setUserProfile(profile);
    } catch (err) {
      signOut();
      setError(`Profile loading error: ${err.message}`);
      window.location.href = '/settings/studio/integrations';
    }
  };

  // Send Email
  const sendEmail = async () => {
    if (!emailForm.to || !emailForm.subject || !emailForm.body) {
      setError('Please fill in all fields');
      return;
    }
    try {
      const email = [
        'Content-Type: text/plain; charset="UTF-8"',
        'MIME-Version: 1.0',
        'Content-Transfer-Encoding: 7bit',
        `To: ${emailForm.to}`,
        `Subject: ${emailForm.subject}`,
        '',
        emailForm.body,
      ].join('\n');

      const base64Email = btoa(email).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      const response = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/send?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw: base64Email,
        }),
      });

      if (!response.ok) {
        throw new Error(`Send email failed: ${response.status}`);
      }
      setEmailForm({ to: '', subject: '', body: '' });
      setComposeOpen(false);
      toast.success('Email sent successfully!');
    } catch (err) {
      setError(`Email sending error: ${err.message}`);
    }
  };

  //Reply Email
  const replyEmail = async () => {
    if (reply.length == 0) {
      setError('Missing required fields for reply');
      return;
    }

    try {
      const replyEmailText = [
        'Content-Type: text/plain; charset="UTF-8"',
        'MIME-Version: 1.0',
        'Content-Transfer-Encoding: 7bit',
        `To: ${selectedMessage?.from?.email}`,
        `Subject: ${selectedMessage?.subject}`,
        `In-Reply-To: ${getEmailHeader(selectedMessage.messages[0].payload.headers, 'Message-ID')}`,
        `References: ${getEmailHeader(selectedMessage.messages[0].payload.headers, 'Message-ID')}`,
        '',
        reply,
      ].join('\n');

      const rawMessage = btoa(replyEmailText).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      const res = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/send?key=${process.env.NEXT_PUBLIC_GMAIL_API_KEY}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw: rawMessage,
          threadId: selectedMessage?.id,
        }),
      });

      if (!res.ok) throw new Error(`Reply failed: ${res.status}`);
      setIsReply(false);
      setReply('');
      toast.success('Reply sent!');
    } catch (err) {
      setError(`Reply error: ${err.message}`);
    }
  };

  const signOut = () => {
    setIsSignedIn(false);
    setAccessToken(null);
    setUserProfile(null);
    setEmails([]);
    setError(null);
    localStorage.removeItem('gmail_access_token');
  };

  const generateAIReply = async emailBody => {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Write only a professional email reply to this email. If you need my name for reply , my name is : ${user?.name} , Only use my where its needed .  Do not include any explanations, subject , notes, or additional text outside the email content:\n\n${emailBody}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 512,
            candidateCount: 1,
          },
        }),
      }
    );

    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No reply generated.';
  };

  // Ai reply button handle
  const handleAiReply = async () => {
    setAiLoading(true);
    try {
      const aiReply = await generateAIReply(selectedTopic?.snippet);
      setReply(aiReply);
    } catch (error) {
      setReply('AI failed to generate a reply.');
    } finally {
      setAiLoading(false);
    }
  };

  // handleCancel
  const handleCancel = () => {
    setProjectOpen(false);
    setSelectedProject('');
  };

  // handle send to project
  const handleSendToProject = () => {
    if (!selectedMessage || !selectedProject) return;
    mutation.mutate({ projectID: selectedProject?.id, emailData: selectedMessage });
  };

  const filteredMessages = useMemo(() => {
    return messages;
    // switch (filter) {
    //   case 'mentions':
    //     return messages.filter(m => m.type === 'mention');
    //   case 'system':
    //     return messages.filter(m => m.type === 'system');
    //   case 'emails':
    //     return messages.filter(m => m.type === 'email');
    //   case 'ai-notes':
    //     return messages.filter(m => m.type === 'ai-note');
    //   case 'all':
    //   default:
    //     return messages;
    // }
  }, [filter]);

  return (
    <div className="flex-1 bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <HomeNav />

        {/* Header with filters, search, and actions */}
        <div className="flex items-center justify-between">
          {/* Left: Filter buttons */}
          <div className="bg-white border border-gray-200 rounded-lg p-1 flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className={` font-medium px-3 ${
                filter == 'all'
                  ? 'bg-gray-900 hover:bg-gray-900 hover:text-white text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              onClick={() => setFilter('all')}
            >
              All
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={` font-medium px-3 ${
                filter == 'mentions'
                  ? 'bg-gray-900 hover:bg-gray-900 hover:text-white text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              onClick={() => setFilter('mentions')}
            >
              Mentions
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={` font-medium px-3 ${
                filter == 'system'
                  ? 'bg-gray-900 hover:bg-gray-900 hover:text-white text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              onClick={() => setFilter('system')}
            >
              System
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={` font-medium px-3 ${
                filter == 'emails'
                  ? 'bg-gray-900 hover:bg-gray-900 hover:text-white text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              onClick={() => setFilter('emails')}
            >
              Emails
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={` font-medium px-3 ${
                filter == 'ai-notes'
                  ? 'bg-gray-900 hover:bg-gray-900 hover:text-white text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              onClick={() => setFilter('ai-notes')}
            >
              AI Notes
            </Button>
          </div>

          {/* Center: Search */}
          <div className="flex-1 flex justify-center px-8">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                onChange={e => setSearchText(e.target.value)}
                placeholder="Search inbox..."
                className="pl-10 bg-white border-gray-200 focus:border-gray-300 focus:ring-0"
              />
            </div>
          </div>

          {/* Right: Action buttons */}
          <div className="flex gap-3">
            <Button variant="outline" size="sm" className="text-gray-600 border-gray-300 bg-transparent">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="text-gray-600 border-gray-300 bg-transparent">
              <Archive className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-5 gap-6 h-[calc(100vh+100px)]">
          {/* Left Column: Messages List */}
          <div className="col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-sm font-medium text-gray-900">Recent Messages</h3>
            </div>

            <div className="overflow-y-scroll h-full pb-12">
              <div className="divide-y divide-gray-100">
                {emails?.length > 0 &&
                  emails.map(message => (
                    <div
                      key={message.id}
                      onClick={() => setSelectedMessage(message)}
                      className={`flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                        message?.labelIds?.includes('UNREAD') ? 'bg-[#FBEAE1]' : ''
                      } ${selectedMessage?.id === message.id ? 'bg-gray-100' : ''}`}
                    >
                      {/* Unread indicator */}
                      {message?.labelIds?.includes('UNREAD') && <div className="w-2 h-2 bg-[#E07A57] rounded-full flex-shrink-0 mt-2" />}
                      {!message?.labelIds?.includes('UNREAD') && <div className="w-2 h-2 bg-transparent rounded-full flex-shrink-0 mt-2" />}
                      {/* Avatar or fallback icon */}
                      <div className="flex-shrink-0">
                        {!message.avatar ? (
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={message?.avatar || '/placeholder.svg'} />
                            <AvatarFallback className="bg-gray-100 text-gray-600 text-sm">
                              {/* {getEmailHeader(message?.payload?.headers, 'Subject')[0]} */}S
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <Bell className="w-5 h-5 text-gray-500" />
                          </div>
                        )}
                      </div>

                      {/* Message Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-medium text-gray-900 w-full truncate text-sm">
                            {message?.subject}
                            {/* {getEmailHeader(message?.payload?.headers, 'Subject')} */}
                          </span>

                          {/* Type badges (neutral/brand-aligned) */}
                          {/* {message.type === 'mention' && (
                            <Badge className="bg-[#F1BBAA] text-[#CE6B4E] border-[#E68E71] text-xs">
                              <AtSign className="w-3 h-3 mr-1" />
                              Mention
                            </Badge>
                          )}
                          {message.type === 'system' && (
                            <Badge className="bg-[#EFEAE2] text-[#7D786C] border-[#B6B0A4] text-xs">
                              <Bell className="w-3 h-3 mr-1" />
                              System
                            </Badge>
                          )} */}
                          {/* {message.type === 'comment' && (
                            <Badge className="bg-[#B9C7B7] text-[#6E7A58] border-[#8FA58F] text-xs">
                              <MessageSquare className="w-3 h-3 mr-1" />
                              Comment
                            </Badge>
                          )} */}
                          <div className="flex items-center  flex-shrink-0 gap-2">
                            <Badge variant="outline" className="text-gray-600 bg-white border-gray-300 text-xs">
                              <Mail className="w-3 h-3 mr-1" />
                              Email
                            </Badge>
                            {/* {message.type === 'email' && (
                            <Badge variant="outline" className="text-gray-600 border-gray-300 bg-transparent text-xs">
                              <Mail className="w-3 h-3 mr-1" />
                              Email
                            </Badge>
                          )} */}
                            {/* {message.type === 'ai-note' && (
                            <Badge variant="outline" className="text-gray-600 border-gray-300 bg-transparent text-xs">
                              <Sparkles className="w-3 h-3 mr-1" />
                              AI Note
                            </Badge>
                          )} */}

                            <span className="text-xs text-gray-500">
                              <span>{dayjs(Number(message?.internalDate)).fromNow()}</span>
                            </span>
                          </div>

                          {/* Optional small status chip for AI Note */}
                          {/* {message.type === 'ai-note' && message.noteStatus === 'needs_review' && (
                            <Badge variant="outline" className="text-gray-600 border-gray-300 bg-transparent text-[10px]">
                              Needs review
                            </Badge>
                          )} */}
                        </div>

                        {/* Subject (if email) + snippet/message */}
                        <p className="text-gray-700 text-sm mb-2 line-clamp-2">
                          {/* <span className="font-medium"> {getEmailHeader(message?.payload?.headers, 'Subject')}</span> */}

                          {/* {message.noteTitle ? <span className="font-medium">{message.noteTitle}: </span> : null} */}
                          {decodeHtmlEntities(message?.snippet)}
                        </p>

                        {/* Project line (kept neutral) */}
                        <div className="text-xs text-gray-500">Project: {findProjectInText(message?.subject)}</div>
                      </div>
                    </div>
                  ))}

                {filteredMessages.length === 0 && <div className="p-8 text-center text-sm text-gray-500">No items for this filter.</div>}
              </div>
            </div>
          </div>

          {/* Right Column: Detail View */}
          <div className="col-span-3 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            {selectedMessage ? (
              <>
                {/* Header (unchanged) */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={selectedMessage.avatar} />
                        <AvatarFallback className="bg-gray-100 text-gray-600 text-sm font-bold">
                          {selectedMessage?.from?.email?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {<span className="font-medium"> {selectedMessage?.subject}</span>}
                        {/* {getEmailAddressFromHeader(selectedMessage?.payload?.headers, `From`)}) */}
                      </h3>
                      {/* <p className="text-sm text-gray-500">{selectedMessage.project}</p> */}
                      <p className="text-sm text-gray-500">{selectedMessage?.from?.email}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" aria-label="Star">
                      <Star className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" aria-label="Reply">
                      <Reply className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" aria-label="Forward">
                      <Forward className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" aria-label="More options">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
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
                      {/* {selectedMessage?.conversation?.map(msg => (
                        <div key={msg.id} className="flex gap-3">
                          <div className="flex-shrink-0">
                            {msg.avatar ? (
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={msg.avatar || '/placeholder.svg'} />
                                <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                                  {msg.sender
                                    .split(' ')
                                    .map(n => n[0])
                                    .join('')}
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <Bell className="w-4 h-4 text-gray-500" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-gray-900">{msg.sender}</span>
                              <span className="text-xs text-gray-500">{msg.time}</span>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-sm text-gray-700">{msg.content}</p>
                            </div>
                          </div>
                        </div>
                      ))} */}

                      {selectedMessage?.messages?.map(item => {
                        return (
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-7 h-7 flex items-center justify-center bg-gray-200 rounded-full">
                                <span className="uppercase">
                                  {item?.labelIds?.includes('SENT')
                                    ? item?.to?.name
                                      ? item?.to?.email[0]
                                      : item?.to?.email[0]
                                    : item?.from?.email
                                    ? item?.from?.email[0]
                                    : item?.from?.email[0]}
                                </span>
                              </div>
                              <div>
                                <p className=' flex items-center gap-2 text-gray-900 w-full truncate text-sm"'>
                                  <span className="text-sm font-medium">{item?.labelIds?.includes('SENT') ? 'You' : item?.from?.name}</span>
                                  <span className="text-sm opacity-55">
                                    <span className="text-xs">{dayjs(Number(item?.internalDate)).fromNow()}</span>
                                  </span>
                                </p>
                              </div>
                            </div>
                            <EmailIframe payload={item.payload} />
                            {/* <iframe
                              className="h-full min-h-[300px] max-h-fit"
                              style={{ width: '100%', border: 'none' }}
                              srcDoc={getEmailBody(item.payload)}
                            /> */}
                          </div>
                        );
                      })}
                    </div>

                    {/* Reply Input */}
                    <div className="p-4 border-t border-gray-100">
                      <div className="flex mb-4 items-center justify-between">
                        <Button
                          variant="ghost"
                          disabled={Ailoading}
                          onClick={() => handleAiReply()}
                          className={` border ml-11
  
    ${Ailoading ? 'bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-400/50' : ''}
    relative overflow-hidden
  `}
                        >
                          {/* Animated background shimmer effect */}
                          {Ailoading && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent animate-pulse" />
                          )}

                          {/* Icon with rotation animation */}
                          <Sparkles
                            className={`w-4 h-4 mr-2 transition-transform  duration-600 ${Ailoading ? 'animate-spin text-purple-500' : ''}`}
                          />

                          {/* Text with typing animation */}
                          <span className="relative z-10">
                            {Ailoading ? (
                              <span className="flex items-center">
                                Generating
                                <span className="ml-1 animate-pulse">
                                  <span className="animate-bounce delay-0">.</span>
                                  <span className="animate-bounce delay-150">.</span>
                                  <span className="animate-bounce delay-300">.</span>
                                </span>
                              </span>
                            ) : (
                              'Reply with AI'
                            )}
                          </span>

                          {/* Pulse ring effect */}
                          {Ailoading && <div className="absolute inset-0 rounded-md border-2 border-purple-400/30 animate-ping" />}
                        </Button>

                        <Button onClick={() => setProjectOpen(true)}>
                          <FolderPlus className="w-4 h-4 mr-2" />
                          Share to Project
                        </Button>
                      </div>
                      <div className="flex gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src="/placeholder.svg?height=32&width=32" />
                          <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">JD</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <Textarea
                            placeholder="Type your reply..."
                            rows={reply?.length > 200 ? 20 : 5}
                            value={reply}
                            onChange={e => setReply(e.target.value)}
                            className="min-h-[80px] resize-none border-gray-200 focus:border-gray-300 focus:ring-0"
                          />
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" aria-label="Attach file">
                                <Paperclip className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" aria-label="Insert emoji">
                                <Smile className="w-4 h-4" />
                              </Button>
                            </div>
                            <Button
                              disabled={reply.length < 1}
                              onClick={() => replyEmail()}
                              size="sm"
                              className="bg-gray-900 text-white hover:bg-gray-800"
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Send
                            </Button>
                          </div>
                        </div>
                      </div>
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
          </div>
        </div>
      </div>

      {/* Sent to project drawer */}

      <Drawer lockBackgroundScroll={true} size={550} open={projectOpen} onClose={() => setProjectOpen(false)} direction="right">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-lg font-semibold">Share to Project</h2>
            <button onClick={handleCancel} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-scroll">
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Select a project:</h3>

              {ProjectLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-3 ">
                  {project?.map(proj => (
                    <label
                      key={proj.id}
                      className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      {/* <input
                        type="radio"
                        name="project"
                        value={proj.id}
                        checked={selectedProject?.id === proj?.id.toString()}
                        onChange={() => setSelectedProject(proj)}
                        className="w-4 h-4 text-black bg-black border-gray-300 "
                      /> */}
                      <Checkbox
                        name="project"
                        value={proj.id}
                        checked={selectedProject?.id === proj?.id.toString()}
                        onCheckedChange={() => setSelectedProject(proj)}
                      />
                      <span className="text-sm font-medium text-gray-900">{proj?.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t bg-gray-50">
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              {selectedProject && (
                <button
                  onClick={handleSendToProject}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-black border border-transparent rounded-md  transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              )}
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
