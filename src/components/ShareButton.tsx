import React from 'react';
import { Share2, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

interface ShareButtonProps {
  shortId: string;
}

export default function ShareButton({ shortId }: ShareButtonProps) {
  const shareUrl = `${window.location.origin}/view/${shortId}`;

  const handleShare = async () => {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
      } catch (err) {
        console.error('Error copying:', err);
        toast.error('Failed to copy link');
      }
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
    >
      {
        <>
          <Copy size={18} />
          Copy Link
        </>
      }
    </button>
  );
}