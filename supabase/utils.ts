import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import quotedPrintable from 'quoted-printable';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: string | number): string {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericValue);
}

// For Fetching Emails ///////////////

// For inbox
// export const fetchInboxEmails = async ({ token }) => {
//   const res = await fetch(
//     `https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=20&q=in:inbox&key=${process.env.NEXT_PUBLIC_GMAIL_API_KEY}`,
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//     }
//   );

//   if (!res.ok) {
//     throw new Error(`Email fetch failed: ${res.status}`);
//   }

//   const data = await res.json();
//   const messages = data.messages || [];

//   const emailDetails = await Promise.all(
//     messages.map(async message => {
//       const messageRes = await fetch(
//         `https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}?key=${process.env.NEXT_PUBLIC_GMAIL_API_KEY}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         }
//       );
//       return await messageRes.json();
//     })
//   );

//   return emailDetails;
// };

// Helper to get a header value by name
const getHeader = (headers, name) => {
  const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
  return header ? header.value : null;
};

// Parse "Name <email>" or just "email" into { name, email }
const parseEmail = str => {
  if (!str) return { name: null, email: null };
  const match = str.match(/(.*)<(.+)>/);
  if (match) {
    return { name: match[1].trim(), email: match[2].trim() };
  }
  return { name: null, email: str.trim() };
};

export const fetchInboxEmails = async ({ token }) => {
  // 1. Fetch inbox message IDs
  const res = await fetch(
    `https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=50&q=in:inbox&key=${process.env.NEXT_PUBLIC_GMAIL_API_KEY}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Email fetch failed: ${res.status}`);
  }

  const data = await res.json();
  const messages = data.messages || [];

  // 2. Fetch message details to get threadIds
  const messageDetails = await Promise.all(
    messages.map(async message => {
      const messageRes = await fetch(
        `https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}?key=${process.env.NEXT_PUBLIC_GMAIL_API_KEY}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return await messageRes.json();
    })
  );

  // 3. Deduplicate threadIds
  const uniqueThreadIds = [...new Set(messageDetails.map(m => m.threadId))];

  // 4. Fetch full threads, sort messages, enrich metadata
  const threads = await Promise.all(
    uniqueThreadIds.map(async threadId => {
      const threadRes = await fetch(
        `https://www.googleapis.com/gmail/v1/users/me/threads/${threadId}?key=${process.env.NEXT_PUBLIC_GMAIL_API_KEY}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const thread = await threadRes.json();

      // Sort messages oldest → newest
      const sortedMessages = (thread.messages || []).sort((a, b) => Number(a.internalDate) - Number(b.internalDate));

      // Enrich each message
      const enrichedMessages = sortedMessages.map(msg => {
        const headers = msg.payload.headers || [];
        return {
          ...msg, // keep full payload for body parsing
          from: parseEmail(getHeader(headers, 'From')),
          to: parseEmail(getHeader(headers, 'To')),
          subject: getHeader(headers, 'Subject'),
          date: getHeader(headers, 'Date'),
        };
      });

      const firstMsg = enrichedMessages[0];
      const lastMsg = enrichedMessages[enrichedMessages.length - 1];

      return {
        id: thread.id,
        historyId: thread.historyId,
        from: firstMsg?.from || null, // latest sender
        to: firstMsg?.to || null, // latest recipient
        subject: firstMsg?.subject || null, // first message subject
        snippet: lastMsg?.snippet || null, // latest message snippet
        internalDate: lastMsg ? Number(lastMsg.internalDate) : null,
        labelIds: lastMsg?.labelIds || [],
        messages: enrichedMessages, // full conversation
      };
    })
  );

  return threads;
};

//For Sent
export const fetchSentEmails = async ({ token }) => {
  const res = await fetch(
    `https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=20&q=in:sent&key=${process.env.NEXT_PUBLIC_GMAIL_API_KEY}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Sent email fetch failed: ${res.status}`);
  }

  const data = await res.json();
  const messages = data.messages || [];

  const emailDetails = await Promise.all(
    messages.map(async message => {
      const messageRes = await fetch(
        `https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}?key=${process.env.NEXT_PUBLIC_GMAIL_API_KEY}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return await messageRes.json();
    })
  );

  return emailDetails;
};

// Dfarts Emails
export const fetchDraftEmails = async ({ token }) => {
  const res = await fetch(
    `https://www.googleapis.com/gmail/v1/users/me/drafts?maxResults=10&key=${process.env.NEXT_PUBLIC_GMAIL_API_KEY}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Draft email fetch failed: ${res.status}`);
  }

  const data = await res.json();
  const drafts = data.drafts || [];

  const draftDetails = await Promise.all(
    drafts.map(async draft => {
      const draftRes = await fetch(
        `https://www.googleapis.com/gmail/v1/users/me/drafts/${draft.id}?key=${process.env.NEXT_PUBLIC_GMAIL_API_KEY}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return await draftRes.json();
    })
  );

  return draftDetails;
};

const base64ToUtf8 = b64 => {
  const binary = atob(b64.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  return new TextDecoder('utf-8').decode(bytes);
};

const decodePart = part => {
  if (!part.body?.data) {
    return '';
  }

  let decoded = base64ToUtf8(part.body.data);
  try {
    decoded = quotedPrintable.decode(decoded);
  } catch (e) {
    // not quoted-printable
  }
  return decoded;
};

const findAlternativePart = parts => {
  let htmlPart = null;
  let textPart = null;

  for (const part of parts) {
    if (part.mimeType === 'text/html' && part.body?.data) {
      htmlPart = part;
    } else if (part.mimeType === 'text/plain' && part.body?.data) {
      textPart = part;
    } else if (part.mimeType === 'multipart/alternative' && part.parts) {
      const found = findAlternativePart(part.parts);
      if (found.html) {
        return { html: found.html, text: found.text || textPart };
      }
      if (found.text) {
        textPart = found.text;
      }
    }
  }

  return { html: htmlPart, text: textPart };
};

export const getEmailBody = payload => {
  let body = '';
  if (payload?.parts) {
    const { html: htmlPart, text: textPart } = findAlternativePart(payload.parts);
    const partToUse = htmlPart || textPart;
    if (partToUse) {
      body = decodePart(partToUse);
    }
  } else if (payload?.body?.data) {
    body = decodePart(payload);
  }

  return `
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          html, body {
            margin: 0;
            padding: 0 0 0 18px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
            font-size: 14px;
            line-height: 1.5;
            color: #333;
            overflow: hidden;
          }
          ::-webkit-scrollbar { display: none; }
          body {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        </style>
      </head>
      <body>
        ${body}
      </body>
    </html>
  `;
};

// export const getEmailBody = payload => {
//   const base64ToUtf8 = b64 => {
//     const binary = atob(b64.replace(/-/g, '+').replace(/_/g, '/'));
//     const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
//     return new TextDecoder('utf-8').decode(bytes);
//   };

//   let body = '';
//   if (payload?.parts) {
//     for (const part of payload.parts) {
//       if ((part.mimeType === 'text/html' || part.mimeType === 'text/plain') && part.body?.data) {
//         let decoded = base64ToUtf8(part.body.data);
//         try {
//           decoded = quotedPrintable.decode(decoded);
//         } catch (e) {
//           // not quoted-printable
//         }
//         body = decoded;
//       }
//     }
//   } else if (payload?.body?.data) {
//     let decoded = base64ToUtf8(payload.body.data);
//     try {
//       decoded = quotedPrintable.decode(decoded);
//     } catch (e) {}
//     body = decoded;
//   }

//   return `
//     <html>
//       <head>
//         <meta charset="UTF-8" />
//         <style>
//           html, body {
//             margin: 0;
//             padding: 0 0 0 18px;
//             font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
//             font-size: 14px;
//             line-height: 1.5;
//             color: #333;
//             overflow: hidden;
//           }
//           ::-webkit-scrollbar { display: none; }
//           body {
//             -ms-overflow-style: none;
//             scrollbar-width: none;
//           }
//         </style>
//       </head>
//       <body>
//         ${body}
//       </body>
//     </html>
//   `;
// };

export const getEmailHeader = (headers, name) => {
  const header = headers?.find(h => h.name === name);
  return header ? header.value : '';
};

export const getSenderName = (headers, name) => {
  const header = headers?.find(h => h.name === name);
  if (!header || !header.value) return '';

  const value = header.value;

  // If format is: Name <email@example.com>
  const match = value.match(/^(.+?)\s*</);
  return match ? match[1].trim() : value;
};

export const formatDate = timestamp => {
  return new Date(parseInt(timestamp)).toLocaleString();
};

export const getEmailAddressFromHeader = (headers, name) => {
  const header = headers?.find(h => h.name === name);
  if (!header || !header.value) return '';

  // Extract email from: "Name <email@example.com>"
  const match = header?.value.match(/<(.+?)>/);
  return match ? match[1] : header.value;
};
