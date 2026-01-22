import React, { useEffect, useState } from 'react';
import { authService } from '../../services/authService';
import { CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react';

interface VerifyEmailProps {
  token: string;
  onSuccess: () => void;
  onBackToLogin: () => void;
}

const VerifyEmail: React.FC<VerifyEmailProps> = ({ token, onSuccess, onBackToLogin }) => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        await authService.verifyEmail(token);
        setStatus('success');
        setMessage('Your email has been verified successfully!');
        setTimeout(() => {
          onSuccess();
        }, 3000);
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'Email verification failed. The link may be invalid or expired.');
      }
    };

    if (token) {
      verify();
    } else {
      setStatus('error');
      setMessage('Invalid verification token.');
    }
  }, [token, onSuccess]);

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg text-center">
      {status === 'loading' && (
        <>
          <div className="flex justify-center mb-4">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Email</h2>
          <p className="text-gray-600">Please wait while we verify your email address...</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Successful</h2>
          <p className="text-gray-600 mb-8">{message}</p>
          <button
            onClick={onSuccess}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all"
          >
            Go to Dashboard
          </button>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
          <p className="text-gray-600 mb-8">{message}</p>
          <button
            onClick={onBackToLogin}
            className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </button>
        </>
      )}
    </div>
  );
};

export default VerifyEmail;
