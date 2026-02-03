import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthCallback: React.FC = () => {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { setAuthenticated } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');

    if (error) {
      setStatus('error');
      if (error === 'unauthorized') {
        setErrorMessage('Your email is not authorized to access this application.');
      } else if (error === 'auth_failed') {
        setErrorMessage('Authentication failed. Please try again.');
      } else {
        setErrorMessage('An error occurred during sign in.');
      }

      // Notify parent window about the error (if in popup)
      if (window.opener) {
        window.opener.postMessage(
          { type: 'AUTH_ERROR', error },
          window.location.origin
        );
        // Close popup after a short delay so user can see the error
        setTimeout(() => window.close(), 2000);
      } else {
        // If not in a popup, redirect to home after showing error
        setTimeout(() => { window.location.href = '/'; }, 3000);
      }
    } else {
      // Success
      setStatus('success');

      if (window.opener) {
        // In popup - notify parent window
        window.opener.postMessage(
          { type: 'AUTH_SUCCESS' },
          window.location.origin
        );
        // Close popup immediately on success
        window.close();
      } else {
        // Not in popup (direct navigation) - set auth state and redirect to home
        setAuthenticated(true);
        window.location.href = '/';
      }
    }
  }, [setAuthenticated]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center">
      <div className="text-center p-8">
        {status === 'processing' && (
          <>
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white text-lg">Completing sign in...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white text-lg">Sign in successful!</p>
            <p className="text-slate-400 text-sm mt-2">Redirecting...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-white text-lg">Sign in failed</p>
            <p className="text-red-400 text-sm mt-2">{errorMessage}</p>
            <p className="text-slate-500 text-xs mt-4">Redirecting to login...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
