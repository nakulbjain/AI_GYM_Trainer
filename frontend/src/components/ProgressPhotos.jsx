// frontend/src/components/ProgressPhotos.jsx
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Upload, Grid, ShieldAlert, Sparkles, Trash2, Camera, Layers } from 'lucide-react';

export default function ProgressPhotos({ userId, setView }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Selection states for comparison
  const [photoA, setPhotoA] = useState(null);
  const [photoB, setPhotoB] = useState(null);
  const [showGrid, setShowGrid] = useState(true);

  const fetchPhotos = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/photos/${userId}`);
      if (!res.ok) throw new Error('Failed to load photos');
      const data = await res.json();
      setPhotos(data);
      
      // Auto select newest photo as Photo B (Current) and older as Photo A (Earlier)
      if (data.length > 0) {
        setPhotoB(data[0]);
      }
      if (data.length > 1) {
        setPhotoA(data[1]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [userId]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/photos/upload/${userId}`, {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Upload failed');
      
      // Reload photos list
      await fetchPhotos();
    } catch (e) {
      alert("Error uploading file: " + e.message);
    } finally {
      setUploading(false);
    }
  };

  const selectPhoto = (photo) => {
    // If already selected, deselect it
    if (photoA && photoA.id === photo.id) {
      setPhotoA(null);
      return;
    }
    if (photoB && photoB.id === photo.id) {
      setPhotoB(null);
      return;
    }
    
    // Assign to first available slot
    if (!photoA) {
      setPhotoA(photo);
    } else if (!photoB) {
      setPhotoB(photo);
    } else {
      // Overwrite the Current (Photo B) slot if both are filled
      setPhotoB(photo);
    }
  };

  const handleDeletePhoto = async (e, photoId) => {
    e.stopPropagation(); // Avoid triggering selection click handler
    if (!window.confirm("Are you sure you want to delete this progress photo?")) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/photos/${photoId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Delete failed');
      
      // If the deleted photo is currently selected in comparison panels, deselect it
      if (photoA && photoA.id === photoId) setPhotoA(null);
      if (photoB && photoB.id === photoId) setPhotoB(null);

      // Refresh list
      await fetchPhotos();
    } catch (e) {
      alert("Error deleting photo: " + e.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] text-[#F7F7F5]">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-[#B7F52A] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-mono tracking-widest text-[#6F7075] uppercase">SYNCING OPTICAL TELEMETRY...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#F7F7F5] pb-16 px-3.5 sm:px-6 md:px-8 relative overflow-hidden select-none font-sans">
      <div className="max-w-6xl mx-auto pt-4 sm:pt-6 md:pt-8 space-y-6 relative z-10">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setView('dashboard')}
              className="w-10 h-10 rounded bg-[#101012] hover:bg-white/5 border border-white/10 transition-colors flex items-center justify-center text-[#F7F7F5] flex-shrink-0"
              title="Return to Dashboard"
              aria-label="Return to Dashboard"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#B7F52A]"></span>
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#6F7075]">MORPHOLOGICAL KINEMATIC TIMELINE</span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold uppercase font-serif tracking-tight break-words">Progress Photo Comparison</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`flex-1 sm:flex-none px-3.5 py-2.5 min-h-[44px] rounded border font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                showGrid 
                  ? 'bg-[#B7F52A]/10 border-[#B7F52A] text-[#B7F52A]' 
                  : 'bg-[#101012] border-white/10 text-[#6F7075] hover:text-[#F7F7F5]'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              Grid: {showGrid ? 'ON' : 'OFF'}
            </button>

            <label className="flex-1 sm:flex-none px-4 py-2.5 min-h-[44px] bg-[#B7F52A] hover:bg-[#a6df24] text-[#050505] font-bold text-xs uppercase tracking-wider rounded flex items-center justify-center gap-2 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              {uploading ? 'Archiving...' : 'Upload Image'}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload} 
                className="hidden" 
                disabled={uploading} 
              />
            </label>
          </div>
        </div>

        {/* COMPARISON PANELS (SIDE-BY-SIDE) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          
          {/* Photo A Box */}
          <div className="bg-[#101012] border border-white/10 p-6 rounded-xl space-y-4 flex flex-col items-center">
            <div className="flex justify-between items-center w-full border-b border-white/10 pb-3 font-mono">
              <span className="font-bold text-xs text-[#6F7075] uppercase tracking-wider">SLOT A // BASELINE REFERENCE</span>
              {photoA && (
                <span className="text-[11px] text-[#B7F52A] font-bold">
                  {new Date(photoA.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                </span>
              )}
            </div>
            
            <div className="relative aspect-[3/4] w-full max-w-[300px] bg-[#0A0A0A] rounded-lg overflow-hidden border border-white/10 flex items-center justify-center">
              {photoA ? (
                <>
                  <img 
                    src={`${import.meta.env.VITE_API_URL}${photoA.photo_path}`} 
                    alt="Progress A" 
                    className="w-full h-full object-cover"
                  />
                  {showGrid && (
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-4 pointer-events-none z-10">
                      {[...Array(12)].map((_, i) => (
                        <div key={i} className="border border-[#B7F52A]/25"></div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <span className="text-xs text-[#6F7075] font-mono uppercase tracking-wider text-center p-4">
                  Select baseline snapshot from archive
                </span>
              )}
            </div>
          </div>

          {/* Photo B Box */}
          <div className="bg-[#101012] border border-white/10 p-6 rounded-xl space-y-4 flex flex-col items-center">
            <div className="flex justify-between items-center w-full border-b border-white/10 pb-3 font-mono">
              <span className="font-bold text-xs text-[#B7F52A] uppercase tracking-wider">SLOT B // CURRENT KINEMATICS</span>
              {photoB && (
                <span className="text-[11px] text-[#B7F52A] font-bold">
                  {new Date(photoB.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                </span>
              )}
            </div>
            
            <div className="relative aspect-[3/4] w-full max-w-[300px] bg-[#0A0A0A] rounded-lg overflow-hidden border border-white/10 flex items-center justify-center">
              {photoB ? (
                <>
                  <img 
                    src={`${import.meta.env.VITE_API_URL}${photoB.photo_path}`} 
                    alt="Progress B" 
                    className="w-full h-full object-cover"
                  />
                  {showGrid && (
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-4 pointer-events-none z-10">
                      {[...Array(12)].map((_, i) => (
                        <div key={i} className="border border-[#B7F52A]/25"></div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <span className="text-xs text-[#6F7075] font-mono uppercase tracking-wider text-center p-4">
                  Select second comparison snapshot
                </span>
              )}
            </div>
          </div>

        </div>

        {/* GALLERY WRAPPER */}
        <div className="bg-[#101012] border border-white/10 p-6 rounded-xl space-y-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <div>
              <span className="text-[10px] font-mono text-[#B7F52A] uppercase tracking-widest block mb-0.5">CHRONOLOGICAL REPOSITORY</span>
              <h2 className="text-base font-bold uppercase font-serif">Optical Capture Archive</h2>
            </div>
            <span className="text-[11px] font-mono text-[#6F7075] uppercase">CLICK TO LOAD INTO SLOTS</span>
          </div>

          {photos.length > 0 ? (
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 sm:gap-3">
              {photos.map((ph) => {
                const isSelectedA = photoA && photoA.id === ph.id;
                const isSelectedB = photoB && photoB.id === ph.id;
                return (
                  <div 
                    key={ph.id}
                    onClick={() => selectPhoto(ph)}
                    className={`aspect-[3/4] rounded overflow-hidden border-2 cursor-pointer transition-all relative group bg-[#0A0A0A] ${
                      isSelectedA ? 'border-[#B7F52A] shadow-md shadow-[#B7F52A]/20' : (isSelectedB ? 'border-[#FFB020] shadow-md shadow-[#FFB020]/20' : 'border-white/10 hover:border-white/30')
                    }`}
                  >
                    <img 
                      src={`${import.meta.env.VITE_API_URL}${ph.photo_path}`} 
                      alt="History item" 
                      className="w-full h-full object-cover"
                    />
                    {/* Delete button (displays on hover) */}
                    <button
                      onClick={(e) => handleDeletePhoto(e, ph.id)}
                      className="absolute top-1.5 right-1.5 p-1 bg-[#FF4D4F] hover:bg-[#e03d3f] text-[#050505] rounded opacity-0 group-hover:opacity-100 transition-opacity z-20"
                      title="Purge Capture"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-[#050505]/80 px-1 py-1 text-center text-[9px] font-mono text-[#F7F7F5] border-t border-white/10">
                      {new Date(ph.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-[#0A0A0A] rounded border border-white/5">
              <Camera className="w-8 h-8 text-[#6F7075] mx-auto mb-2" />
              <span className="text-xs font-mono text-[#6F7075] uppercase tracking-wider block">No morphological captures found</span>
              <span className="text-[11px] text-[#6F7075]/70 block mt-1">Upload athlete progress photographs to perform bilateral geometry comparisons.</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
