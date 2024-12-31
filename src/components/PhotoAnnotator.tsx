import React, { useState } from 'react';
import { supabase } from '../lib/supabase-client';
import ShareButton from './ShareButton';
import type { Tooltip } from '../types';

export default function PhotoAnnotator() {
  const [photo, setPhoto] = useState<any>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [tooltips, setTooltips] = useState<Tooltip[]>([]);
  const [newTooltip, setNewTooltip] = useState<{ x: number; y: number } | null>(null);
  const [tooltipText, setTooltipText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const generateShortId = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      // Upload image to Supabase Storage
      const filename = `${Math.random()}.${file.name.split('.').pop()}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filename, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(filename);

      // Save to database with short_id
      const { data: photo, error: dbError } = await supabase
        .from('photos')
        .insert([{ 
          image_url: publicUrl,
          short_id: generateShortId()
        }])
        .select()
        .single();

      if (dbError) throw dbError;

      setPhoto({ ...photo, url: publicUrl });
    } catch (error) {
      console.error('Error uploading photo:', error);
    }
    setLoading(false);
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (isEditOpen) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setNewTooltip({ x, y });
  };

  const handleTooltipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTooltip || !photo) return;

    try {
      const { data, error } = await supabase
        .from('tooltips')
        .insert([
          {
            photo_id: photo.id,
            x_position: newTooltip.x,
            y_position: newTooltip.y,
            text: tooltipText,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setTooltips([...tooltips, {
        id: data.id.toString(),
        x: data.x_position,
        y: data.y_position,
        text: data.text,
      }]);

      setNewTooltip(null);
      setTooltipText('');
    } catch (error) {
      console.error('Error saving tooltip:', error);
    }
    setIsEditOpen(false);
  };

  const handleTootipClick = async (
    e: React.MouseEvent<HTMLDivElement>,
    tooltip: Tooltip
  ) => {
    e.stopPropagation();
    setIsEditOpen(true);
  
    // Overwrite the new tooltip with the clicked tooltip
    setTooltipText(tooltip.text);
    setNewTooltip({ x: tooltip.x, y: tooltip.y });
  
    // Remove the clicked tooltip from the db
    try {
      const { error } = await supabase
        .from('tooltips')
        .delete()
        .match({ id: tooltip.id });
  
      if (error) throw error;
  
      // Remove it from local state as well
      setTooltips(tooltips.filter((t) => t.id !== tooltip.id));
    } catch (error) {
      console.error('Error deleting tooltip:', error);
    }
  };


  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  if (!photo) {
    return (
      <div className="text-center">
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
          id="photo-upload"
        />
        <label
          htmlFor="photo-upload"
          className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-colors"
        >
          {loading ? 'Uploading...' : 'Upload Photo'}
        </label>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="relative inline-block">
        <img
          src={photo.url}
          alt="Uploaded"
          className="max-w-full h-auto rounded-lg shadow-lg"
          onClick={handleImageClick}
          onLoad={handleImageLoad}
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
              <div className="w-6 h-6 bg-blue-500/60 rounded-full cursor-pointer flex items-center justify-center text-white" onClick={(e) => {handleTootipClick(e, tooltip)}}>
                ?
              </div>
              
              <div className="absolute z-30 invisible group-hover:visible bg-white p-3 rounded-lg shadow-lg -translate-x-1/2 mt-2 w-48">
                <p className="text-sm text-gray-700">{tooltip.text}</p>
              </div>
            </div>
          </div>
        ))}

        {newTooltip && (
          <div
            className="absolute z-20"
            style={{
              left: `${newTooltip.x}%`,
              top: `${newTooltip.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <form onSubmit={handleTooltipSubmit} className="absolute z-30 bg-white p-3 rounded-lg shadow-lg -translate-x-1/2 mt-2 w-48">
              <textarea
                className="w-full p-2 border rounded mb-2"
                value={tooltipText}
                onChange={(e) => setTooltipText(e.target.value)}
                placeholder="Enter tooltip text"
                autoFocus
              />
              <div className="flex justify-between gap-2">
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewTooltip(null);
                    setTooltipText('');
                    setIsEditOpen(false);
                  }}
                  className={`
                    px-3 
                    py-1 
                    text-white 
                    rounded 
                    ${isEditOpen ? "bg-red-500 hover:bg-red-600" : "bg-gray-500 hover:bg-gray-600"}
                  `}
                >
                  {isEditOpen ? 'Delete' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
      
      {!imageLoaded && <div className="mt-4 text-center text-lg">Loading...</div>}

      <div className="mt-4 text-center">
        {imageLoaded && <ShareButton shortId={photo.short_id} />}
      </div>
    </div>
  );
}