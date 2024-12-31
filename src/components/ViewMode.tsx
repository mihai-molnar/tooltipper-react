import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase-client';
import type { Tooltip } from '../types';

// Add this CSS animation at the top of your component
const pulsingStyle = `
  @keyframes pulse-opacity {
    0%, 100% { opacity: 0; }
    50% { opacity: 0.6; }
  }
`;

export default function ViewMode() {
  const { shortId } = useParams();
  const [photo, setPhoto] = useState<any>(null);
  const [tooltips, setTooltips] = useState<Tooltip[]>([]);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const fetchPhoto = async () => {
      const { data: photos, error } = await supabase
        .from('photos')
        .select('*')
        .eq('short_id', shortId)
        .single();

      if (error) {
        console.error('Error fetching photo:', error);
        return;
      }

      // Just use the image_url directly since it's already a full URL
      setPhoto({
        ...photos,
        url: photos.image_url
      });

      // Fetch tooltips for this photo
      const { data: tooltipsData, error: tooltipsError } = await supabase
        .from('tooltips')
        .select('*')
        .eq('photo_id', photos.id);

      if (tooltipsError) {
        console.error('Error fetching tooltips:', tooltipsError);
        return;
      }

      setTooltips(tooltipsData.map(t => ({
        id: t.id.toString(),
        x: t.x_position,
        y: t.y_position,
        text: t.text
      })));
    };

    if (shortId) {
      fetchPhoto();
    }
  }, [shortId]);

  if (!photo) {
    return <div className="mt-4 text-center text-lg">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <style>{pulsingStyle}</style>
      <div className="relative inline-block">
        <img
          ref={imageRef}
          src={photo.url}
          alt="Shared photo"
          className="max-w-full h-auto rounded-lg shadow-lg"
        />
        
        {tooltips.map((tooltip) => (
          <div
            key={tooltip.id}
            className="absolute z-20"
            style={{ 
              left: `${tooltip.x}%`, 
              top: `${tooltip.y}%`, 
              transform: 'translate(-50%, -50%)' 
            }}
          >
            <div className="relative group">
              <div 
                className="w-6 h-6 bg-blue-500 rounded-full cursor-pointer flex items-center justify-center text-white"
                style={{
                  animation: 'pulse-opacity 2s infinite',
                }}
              >
                ?
              </div>
              
              <div className="absolute z-30 invisible group-hover:visible bg-white p-3 rounded-lg shadow-lg -translate-x-1/2 mt-2 w-48">
                <p className="text-sm text-gray-700">{tooltip.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}