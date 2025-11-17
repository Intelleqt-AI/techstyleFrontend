import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';

const XeroIntegration = () => {
  const [xeroConnected, setXeroConnected] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const handleConnect = () => {
    const clientId = '640C611FE83942D7B3A1DF43E410FCD5';
    // const redirectUri = 'https://xero-backend-pi.vercel.app/api/xero-callback';
    const redirectUri = 'https://be.techstyles.ai/api/xero/connect/';
    const scope = 'openid profile email accounting.transactions accounting.contacts offline_access';
    const state = 'random_xyz';

    // const authUrl = `https://login.xero.com/identity/connect/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${encodeURIComponent(
    //   scope
    // )}&state=${state}`;

    const authUrl = 'https://be.techstyles.ai/api/xero/connect/';

    const popup = window.open(authUrl, 'XeroAuth', 'width=600,height=700');

    const handleMessage = event => {
      const { access_token, refresh_token, tenantId } = event.data;

      if (access_token && tenantId) {
        localStorage.setItem('xero_access_token', access_token);
        localStorage.setItem('xero_refresh_token', refresh_token);
        localStorage.setItem('xero_tenant_id', tenantId);

        popup.close();
        window.removeEventListener('message', handleMessage);
        window.location.reload();
      }
    };

    window.addEventListener('message', handleMessage);
  };

  // useEffect(() => {
  //   const token = localStorage.getItem('xero_access_token');
  //   async function checkXeroConnection(accessToken) {
  //     if (!accessToken) return;

  //     try {
  //       const res = await fetch('https://xero-backend-pi.vercel.app/api/check-xero-connection', {
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem('xero_access_token')}`,
  //         },
  //       });
  //       const result = await res.json();
  //       if (!res.ok) {
  //         console.error('Xero API error:', res.status);
  //         return false;
  //       }

  //       if (result?.connected) {
  //         setUserProfile(result.tenants);
  //         setXeroConnected(true);
  //       }
  //     } catch (err) {
  //       console.error('Fetch/network error:', err.message);
  //       return false;
  //     }
  //   }

  //   checkXeroConnection(token);
  // }, []);

  const disconnectXero = async () => {
    const accessToken = localStorage.getItem('xero_access_token');
    const tenantId = localStorage.getItem('xero_tenant_id');

    if (!accessToken || !tenantId) return;

    const res = await fetch(`https://xero-backend-pi.vercel.app/api/disconnect-xero?tenantId=${tenantId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const result = await res.json();

    if (result.success) {
      // Clear local tokens
      localStorage.removeItem('xero_access_token');
      localStorage.removeItem('xero_refresh_token');
      localStorage.removeItem('xero_tenant_id');
    } else {
      console.error('Failed to disconnect:', result.error);
    }
  };

  return (
    <Card className="border-gray-200">
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center justify-between">
          <span className="text-gray-900">Xero</span>
          <Badge variant={xeroConnected ? 'default' : 'secondary'} className="capitalize">
            {xeroConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </CardTitle>
        <CardDescription className="text-gray-600">Sync Xero</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        {xeroConnected ? (
          <>
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm">Connected</span>
            </div>
            <Button onClick={() => disconnectXero()} variant="outline">
              Disconnect
            </Button>
          </>
        ) : (
          <Button onClick={() => handleConnect()}>Connect</Button>
        )}
      </CardContent>
    </Card>
  );
};

export default XeroIntegration;
