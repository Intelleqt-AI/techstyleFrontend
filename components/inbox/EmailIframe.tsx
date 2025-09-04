import { getEmailBody } from '@/supabase/utils';
import { useState, useRef, useEffect } from 'react';

function EmailIframe({ payload }) {
  const [height, setHeight] = useState('100px');
  const iframeRef = useRef(null);

  const handleLoad = () => {
    if (iframeRef.current) {
      try {
        const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
        const newHeight = iframeDoc.body.scrollHeight + 30; // actual content height
        setHeight(newHeight + 'px');
      } catch (err) {
        console.error('Error resizing iframe:', err);
      }
    }
  };

  return (
    <iframe
      ref={iframeRef}
      onLoad={handleLoad}
      srcDoc={getEmailBody(payload)}
      style={{
        width: '100%',
        border: 'none',
        height,
      }}
    />
  );
}

export default EmailIframe;
