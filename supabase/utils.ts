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
export const fetchInboxEmails = async ({ token }) => {
  const res = await fetch(
    `https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=20&q=in:inbox&key=${process.env.NEXT_PUBLIC_GMAIL_API_KEY}`,
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

// Emails Formatting Functions

export const getEmailBody = payload => {
  let body = '';
  if (payload?.parts) {
    payload.parts.forEach(part => {
      if (part.mimeType === 'text/html' && part.body.data) {
        // base64 decode first
        const base64Decoded = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        // then quoted-printable decode
        body = quotedPrintable.decode(base64Decoded);
      } else if (part.mimeType === 'text/plain' && part.body.data) {
        const base64Decoded = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        body = quotedPrintable.decode(base64Decoded);
      }
    });
  } else if (payload.body.data) {
    const base64Decoded = atob(payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
    body = quotedPrintable.decode(base64Decoded);
  }
  return body;
};

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
