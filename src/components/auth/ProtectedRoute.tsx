import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAccount } from '../../context/AccountContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoggedIn, isLoading } = useAccount();

  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7249/ingest/24630c7d-265b-4884-88b6-481174deff54',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProtectedRoute.tsx:render',message:'ProtectedRoute state',data:{isLoggedIn,isLoading,pathname:window.location.pathname},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H11'})}).catch(()=>{});
  }, [isLoggedIn, isLoading]);
  // #endregion

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to account page (login) if not logged in
  if (!isLoggedIn) {
    return <Navigate to="/account" replace />;
  }

  return <>{children}</>;
}
