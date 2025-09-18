'use client';
import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, Clock, RefreshCw, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function VerifyEmailPage() {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const [email, setEmail] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  // Check if user came from registration
  useEffect(() => {
    const checkAuthorization = () => {
      // Check if there's registration data in browser state
      const registrationData = window.history.state?.fromRegister;
      const sessionEmail = window.history.state?.email;

      // Check if user navigated here from register page via referrer
      const referrer = document.referrer;
      const isFromRegisterReferrer = referrer.includes('/register');

      // Check for a temporary session marker (would be set by register page)
      const tempRegisterSession = sessionStorage.getItem('pendingEmailVerification');
      const tempEmail = sessionStorage.getItem('pendingVerificationEmail');

      // User is authorized if ANY of these conditions are met:
      // 1. They have proper history state from register page
      // 2. They came from register page (referrer check)
      // 3. They have a temporary session marker (for demo)
      const hasValidState = registrationData && sessionEmail;
      const hasValidSession = tempRegisterSession && tempEmail;

      if (hasValidState) {
        setIsAuthorized(true);
        setEmail(sessionEmail);
        setIsCheckingAuth(false);
      } else if (isFromRegisterReferrer && hasValidSession) {
        setIsAuthorized(true);
        setEmail(tempEmail);
        setIsCheckingAuth(false);
      } else if (hasValidSession) {
        // Allow access if there's a pending verification session
        setIsAuthorized(true);
        setEmail(tempEmail);
        setIsCheckingAuth(false);
      } else {
        // No valid authorization - deny access
        setIsAuthorized(false);
        setIsCheckingAuth(false);

        // Clear any invalid session data
        sessionStorage.removeItem('pendingEmailVerification');
        sessionStorage.removeItem('pendingVerificationEmail');
      }
    };

    checkAuthorization();
  }, []);

  // Countdown timer for resend
  useEffect(() => {
    if (timeLeft > 0 && !canResend) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setCanResend(true);
    }
  }, [timeLeft, canResend]);

  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResend = async () => {
    setIsLoading(true);
    // Simulate resend API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setTimeLeft(300);
    setCanResend(false);
    setIsLoading(false);
  };

  const handleBackToRegister = () => {
    // Clear any session data
    sessionStorage.removeItem('pendingEmailVerification');
    sessionStorage.removeItem('pendingVerificationEmail');

    // In a real app, this would use router.push('/register')
    window.location.href = '/register';
  };

  const handleVerify = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsVerified(true);

    // Clear session data after successful verification
    sessionStorage.removeItem('pendingEmailVerification');
    sessionStorage.removeItem('pendingVerificationEmail');

    setIsLoading(false);
  };

  // Show loading while checking authorization
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 text-center">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Checking authorization...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show unauthorized access page
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 text-center transform animate-in fade-in duration-700">
            <div className="mb-6">
              <div className="w-20 h-20 bg-black/60 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-black bg-clip-text text-transparent mb-2">Access Restricted</h1>
              <p className="text-gray-600 mb-6">You need to complete the registration process first to access this page.</p>
            </div>

            <button
              onClick={handleBackToRegister}
              className="w-full bg-black text-white font-medium py-2 px-5 rounded-md transform  transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go to Registration</span>
            </button>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-2">Already have an account?</p>
              <button
                onClick={() => router.push('/login')}
                className="text-black hover:text-blue-700 font-medium text-sm transition-colors duration-200"
              >
                Sign in instead
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 text-center transform animate-in fade-in duration-700">
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                Email Verified!
              </h1>
              <p className="text-gray-600">Your email has been successfully verified. You can now access all features.</p>
            </div>

            <button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-emerald-600 hover:to-teal-600 transform hover:scale-105 transition-all duration-200 shadow-lg">
              Continue to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back button */}
        <button
          onClick={handleBackToRegister}
          className="flex items-center text-gray-600 hover:text-gray-800 text-sm mb-6 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to registration
        </button>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 transform animate-in slide-in-from-bottom duration-500">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-gray-500 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Mail className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-semibold bg-black  bg-clip-text text-transparent mb-2">Verify Your Email</h1>
            <p className="text-gray-600">We've sent a verification link to</p>
            <p className="font-semibold text-gray-800 break-all">{email}</p>
          </div>

          {/* Instructions */}
          <div className="mb-8">
            <div className="bg-gray-100 border border-gray-200 rounded-xl p-4 mb-6">
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm ">
                  <p className="font-medium mb-1">Check your email</p>
                  <p>Click the verification link in the email we just sent you. If you don't see it, check your spam folder.</p>
                </div>
              </div>
            </div>

            {/* Mock verify button for demo */}
            {/* <button
              onClick={handleVerify}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Click here to simulate verification</span>
              )}
            </button> */}
          </div>

          {/* Resend section */}
          {/* <div className="border-t border-gray-200 pt-6">
            <p className="text-center text-gray-600 mb-4">Didn't receive the email?</p>

            {!canResend ? (
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">You can request a new email in</p>
                <div className="text-2xl font-mono font-bold text-blue-600">{formatTime(timeLeft)}</div>
              </div>
            ) : (
              <button
                onClick={handleResend}
                disabled={isLoading}
                className="w-full bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Resend verification email</span>
                  </>
                )}
              </button>
            )}
          </div> */}

          {/* Help section */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500 mb-2">Having trouble?</p>
            <button className=" font-medium text-sm transition-colors duration-200">Contact support</button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            By verifying your email, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 transition-colors duration-200">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 transition-colors duration-200">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
