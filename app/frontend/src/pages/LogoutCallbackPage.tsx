import React, { useEffect } from 'react';

const LogoutCallbackPage: React.FC = () => {
  useEffect(() => {
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface text-text">
      <div className="text-center px-6">
        <h2 className="text-2xl font-bold mb-2">Útskráningu lokið</h2>
        <p className="text-muted">Þú hefur verið skráður út.</p>
        <p className="text-sm text-subtle mt-4">Áframsendi á forsíðu...</p>
      </div>
    </div>
  );
};

export default LogoutCallbackPage;
