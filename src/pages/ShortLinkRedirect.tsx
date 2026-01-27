import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShortLinkService } from '@/services/shortLinkService';
import { Loader2 } from 'lucide-react';

const ShortLinkRedirect: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState(false);

  useEffect(() => {
    const redirect = async () => {
      if (!code) {
        navigate('/');
        return;
      }

      try {
        const originalUrl = await ShortLinkService.resolveShortLink(code);

        if (originalUrl) {
          // Redirect to the original URL
          navigate(originalUrl, { replace: true });
        } else {
          setError(true);
          setTimeout(() => navigate('/'), 3000);
        }
      } catch (err) {
        console.error('Redirect error:', err);
        setError(true);
        setTimeout(() => navigate('/'), 3000);
      }
    };

    redirect();
  }, [code, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Link Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The short link you're looking for doesn't exist.
          </p>
          <p className="text-sm text-muted-foreground">Redirecting to home...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
};

export default ShortLinkRedirect;
