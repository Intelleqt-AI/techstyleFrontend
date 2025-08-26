import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';

const GmailIntegration = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  // Configuration - Replace with your actual values
  const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest';
  const SCOPES =
    'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.modify';

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
    if (savedToken) {
      setAccessToken(savedToken);
      setIsSignedIn(true);
      loadUserProfile(savedToken);
    }
  }, []);

  const initGoogleAuth = () => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GMAIL_CLIENT_ID,
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
        apiKey: process.env.NEXT_PUBLIC_GMAIL_API_KEY,
        discoveryDocs: [DISCOVERY_DOC],
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

  const signInWithOAuth = async () => {
    try {
      setError(null);
      const authUrl =
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${process.env.NEXT_PUBLIC_GMAIL_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(`${window.location.origin}/oauth-callback.html`)}&` +
        `response_type=token&` +
        `scope=${encodeURIComponent(SCOPES)}&` +
        `include_granted_scopes=true&` +
        `state=gmail_integration`;

      const popup = window.open(authUrl, 'oauth', 'width=500,height=600,scrollbars=yes,resizable=yes');

      if (!popup) {
        setError('Popup blocked! Please allow popups and try again.');
      }
    } catch (err) {
      setError(`OAuth sign-in error: ${err.message}`);
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
        // window.location.href = '/settings/integration';
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
        throw new Error(`Profile fetch failed: ${response.status}`);
      }

      const profile = await response.json();
      setUserProfile(profile);
    } catch (err) {
      signOut();
      setError(`Profile loading error: ${err.message}`);
    }
  };

  const signOut = () => {
    setIsSignedIn(false);
    setAccessToken(null);
    setUserProfile(null);
    setError(null);
    localStorage.removeItem('gmail_access_token');
  };

  return (
    <Card className="border-gray-200">
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center justify-between">
          <span className="text-gray-900">Google</span>
          <Badge variant={isSignedIn ? 'default' : 'secondary'} className="capitalize">
            {isSignedIn ? 'Connected' : 'Disconnected'}
          </Badge>
        </CardTitle>
        <CardDescription className="text-gray-600">Sync emails</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        {isSignedIn ? (
          <>
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm">Connected</span>
            </div>
            <Button onClick={() => signOut()} variant="outline">
              Disconnect
            </Button>
          </>
        ) : (
          <Button onClick={() => signInWithOAuth()}>Connect</Button>
        )}
      </CardContent>
    </Card>
  );
};

export default GmailIntegration;
