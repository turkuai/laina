import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getApiBase } from '../config';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Checking...');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('Missing link.');
      return;
    }
    fetch(`${getApiBase()}/api/users/verify-email?token=${encodeURIComponent(token)}`, {
      method: 'GET',
      credentials: 'include',
    })
      .then((r) => r.json())
      .then((data) => {
        setStatus(data.success ? 'Email verified!' : (data.error || 'Invalid or expired link.'));
        if (data.success) setTimeout(() => navigate('/home', { replace: true }), 1500);
      })
      .catch(() => setStatus('Error.'));
  }, [searchParams, navigate]);

  return (
    <div style={{ padding: 24, textAlign: 'center' }}>
      <p>{status}</p>
    </div>
  );
}
