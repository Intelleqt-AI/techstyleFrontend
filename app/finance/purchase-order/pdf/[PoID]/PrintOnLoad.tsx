'use client';

import { useEffect } from 'react';

export default function PrintOnLoad({ title }: { title?: string }) {
  useEffect(() => {
    if (title) {
      document.title = title;
    }
    // Small delay to ensure content is rendered
    const timer = setTimeout(() => {
      window.print();
    }, 1000);

    return () => clearTimeout(timer);
  }, [title]);

  return null;
}
