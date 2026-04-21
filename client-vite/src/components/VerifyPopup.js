import { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

export default function VerifyPopup() {
  const { emailVerified, fetchVerify, resendVerification, logout } = useAuth();
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (emailVerified) return;
    const t = setInterval(async () => {
      const data = await fetchVerify();
      if (data?.email_verified) clearInterval(t);
    }, 8000);
    return () => clearInterval(t);
  }, [emailVerified, fetchVerify]);

  if (emailVerified) return null;

  const handleResend = async () => {
    await resendVerification();
    setSent(true);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: 24,
          borderRadius: 8,
          maxWidth: 320,
          textAlign: "center",
        }}
      >
        <p style={{ margin: "0 0 16px" }}>
          Please verify your email to continue.
        </p>
        <button
          type="button"
          onClick={handleResend}
          style={{ padding: "8px 16px" }}
        >
          Send verification again
        </button>

        {sent && (
          <p style={{ margin: "12px 0 0", fontSize: 14, color: "green" }}>
            Email sent.
          </p>
        )}

        <div style={{ marginTop: 16 }}>
          <button
            type="button"
            onClick={logout}
            style={{ padding: "8px 16px" }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
