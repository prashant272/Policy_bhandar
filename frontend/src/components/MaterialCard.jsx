import React, { useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { watermarkImage } from '../utils/watermark';
import { Download, Eye, ShieldAlert, Sparkles, FileText, Video, Image as ImageIcon, FileCheck, X } from 'lucide-react';

export default function MaterialCard({ material, onOpenAuthModal, onDownloadSuccess }) {
  const { user } = useContext(AuthContext);
  const [downloading, setDownloading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(material.fileUrl);
  const [upgradePrompt, setUpgradePrompt] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  React.useEffect(() => {
    if (previewOpen && material.type === 'Banner' && user) {
      watermarkImage(material.fileUrl, user, material.watermarkTemplateId)
        .then(url => setPreviewUrl(url))
        .catch(err => {
          console.error("Failed to generate watermarked preview:", err);
          setPreviewUrl(material.fileUrl);
        });
    } else {
      setPreviewUrl(material.fileUrl);
    }
  }, [previewOpen, user, material.fileUrl, material.type]);

  const getIcon = () => {
    switch (material.type) {
      case 'Banner': return <ImageIcon className="text-blue-400" size={16} />;
      case 'Reel': return <Video className="text-pink-400" size={16} />;
      case 'PDF': return <FileText className="text-red-400" size={16} />;
      default: return <FileCheck className="text-indigo-400" size={16} />;
    }
  };

  const handleDownload = async () => {
    if (!user) {
      onOpenAuthModal();
      return;
    }

    setDownloading(true);

    try {
      // 1. Call API to check/increment download count
      const response = await API.post(`/materials/${material._id}/download`);
      
      if (response.data.success) {
        const fileUrl = response.data.data.fileUrl;
        
        // 2. Perform Watermarking for Banners (Images)
        if (material.type === 'Banner') {
          try {
            // Apply canvas overlay with template
            const watermarkedDataUrl = await watermarkImage(material.fileUrl, user, material.watermarkTemplateId);
            triggerDownload(watermarkedDataUrl, `${material.title}-watermarked.jpg`);
          } catch (err) {
            console.error('Watermarking failed, downloading raw file', err);
            triggerDownload(material.fileUrl, `${material.title}.jpg`);
          }
        } else {
          // For Reel or PDF: Download raw file URL directly (MVP)
          triggerDownload(fileUrl, `${material.title}-${material.type}`);
        }

        if (onDownloadSuccess) {
          onDownloadSuccess(response.data.data.downloadCount);
        }
      }
    } catch (error) {
      console.error('Download error:', error);
      if (error.response?.data?.needsUpgrade) {
         setErrorMessage(error.response.data.error);
         setUpgradePrompt(true);
      } else {
         alert(error.response?.data?.error || 'Download failed');
      }
    } finally {
      setDownloading(false);
    }
  };

  const triggerDownload = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderHTMLOverlay = (isMini = false) => {
    if (!user || (material.type !== 'Banner' && material.type !== 'Reel')) return null;

    const tpl = material.watermarkTemplateId || {
      layoutType: 'bottom-bar',
      backgroundColor: 'rgba(15, 23, 42, 0.8)',
      textColor: '#ffffff',
      accentColor: '#a855f7',
      borderColor: 'rgba(99, 102, 241, 0.3)',
      showUserPhoto: true,
      showUserName: true,
      showUserDetails: true,
      showUserMobile: true,
      sizeScale: 100,
      imageScale: 100,
      showSocialIcons: true
    };

    const scaleFactor = (tpl.sizeScale || 100) / 100;
    const imgScale = (tpl.imageScale || 100) / 100;

    let wrapperClasses = isMini 
      ? "absolute z-10 pointer-events-none opacity-90 " 
      : "absolute z-10 pointer-events-none ";
      
    if (tpl.appendMode) {
      wrapperClasses = wrapperClasses.replace('absolute', 'relative').replace('z-10', 'z-0');
    }
    
    let innerClasses = isMini 
      ? "backdrop-blur-sm border rounded-md p-1.5 flex items-center gap-1.5 shadow-xl scale-[0.95] origin-bottom " 
      : "backdrop-blur-sm border rounded-xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 shadow-xl ";

    switch (tpl.layoutType) {
      case 'bottom-bar':
        wrapperClasses += isMini ? "bottom-1 inset-x-1" : "bottom-16 inset-x-2 sm:inset-x-6";
        break;
      case 'top-bar':
        wrapperClasses += isMini ? "top-1 inset-x-1" : "top-16 inset-x-2 sm:inset-x-6";
        break;
      case 'bottom-right-box':
        wrapperClasses += isMini ? "bottom-1 right-1 max-w-[60%]" : "bottom-16 right-2 sm:right-6 max-w-sm";
        break;
      case 'bottom-left-box':
        wrapperClasses += isMini ? "bottom-1 left-1 max-w-[60%]" : "bottom-16 left-2 sm:left-6 max-w-sm";
        break;
      case 'top-right-box':
        wrapperClasses += isMini ? "top-1 right-1 max-w-[60%]" : "top-16 right-2 sm:right-6 max-w-sm";
        break;
      case 'top-left-box':
        wrapperClasses += isMini ? "top-1 left-1 max-w-[60%]" : "top-16 left-2 sm:left-6 max-w-sm";
        break;
      default:
        wrapperClasses += isMini ? "bottom-1 inset-x-1" : "bottom-16 inset-x-2 sm:inset-x-6";
    }

    if (tpl.layoutType === 'professional-bottom') {
      return (
        <div className="absolute bottom-0 inset-x-0 bg-white z-10 w-full p-2 sm:p-4 flex items-center shadow-[0_-4px_10px_rgba(0,0,0,0.1)]" style={{ backgroundColor: tpl.backgroundColor || '#fff', borderTop: `2px solid ${tpl.borderColor || '#eee'}` }}>
          {(tpl.showUserPhoto || tpl.logoUrl) && (
            <div 
              className="rounded-xl border-4 overflow-hidden shrink-0 flex items-center justify-center bg-white"
              style={{ 
                borderColor: tpl.accentColor || '#000',
                width: isMini ? `${30 * imgScale}px` : `${70 * imgScale}px`,
                height: isMini ? `${30 * imgScale}px` : `${70 * imgScale}px`,
              }}
            >
              {tpl.logoUrl ? (
                <img 
                  src={tpl.logoUrl.startsWith('/uploads') ? `${window.location.protocol}//${window.location.hostname}:5000${tpl.logoUrl}` : tpl.logoUrl} 
                  className="w-full h-full object-contain p-0.5" 
                  alt="Logo" 
                />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center font-bold bg-slate-100"
                  style={{ color: tpl.textColor, fontSize: isMini ? `${12 * imgScale}px` : `${28 * imgScale}px` }}
                >
                  {user.name.charAt(0)}
                </div>
              )}
            </div>
          )}
          
          <div className="flex-1 ml-3 flex flex-col justify-center leading-tight">
            <span className={isMini ? "text-[5px]" : "text-[10px] sm:text-xs"} style={{ color: tpl.textColor }}>With Best Regards,</span>
            {tpl.showUserName && (
              <h4 className={isMini ? "font-extrabold text-[7px] uppercase" : "font-extrabold text-sm sm:text-base uppercase tracking-wide my-0.5"} style={{ color: tpl.textColor }}>{user.name}</h4>
            )}
            {tpl.showUserDetails && (
              <p className={isMini ? "text-[5px] font-medium" : "text-[10px] sm:text-xs font-medium"} style={{ color: tpl.textColor }}>
                {user.agentType}
              </p>
            )}
            {tpl.showUserMobile && (
              <p className={isMini ? "text-[5px]" : "text-[10px] sm:text-xs"} style={{ color: tpl.textColor }}>
                {user.mobile}
              </p>
            )}
            <p className={isMini ? "text-[5px]" : "text-[10px] sm:text-xs"} style={{ color: tpl.textColor }}>
              {user.email || 'user@example.com'}
            </p>
            {tpl.showUserDetails && (
              <p className={isMini ? "text-[5px]" : "text-[10px] sm:text-xs"} style={{ color: tpl.textColor }}>
                {user.company}
              </p>
            )}
          </div>
        </div>
      );
    }

    const transformOrigin = tpl.layoutType.includes('bottom') ? 'bottom center' : 'top center';
    const dynamicStyle = isMini ? {} : { transform: `scale(${scaleFactor})`, transformOrigin };

    if (tpl.appendMode) {
      return (
        <div className="w-full flex flex-col bg-white">
          <div className={wrapperClasses.replace(/bottom-\d+|top-\d+|inset-x-\d+|left-\d+|right-\d+/g, '') + ' w-full relative'} style={{ ...dynamicStyle, transformOrigin: 'top center' }}>
            {/* The watermark content is rendered here inline */}
            <div className="w-full shadow-md" style={{ backgroundColor: tpl.backgroundColor || '#fff', borderTop: `2px solid ${tpl.borderColor || '#eee'}` }}>
               {/* Note: In appendMode, we just render the basic template UI without absolute positioning */}
               <div className="p-2 flex items-center justify-center text-xs font-bold text-gray-500 italic">
                  [Appended Below Image]
               </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={wrapperClasses} style={dynamicStyle}>
        <div 
          className={innerClasses}
          style={{ backgroundColor: tpl.backgroundColor, borderColor: tpl.borderColor }}
        >
          {tpl.logoUrl && (
            <img 
              src={tpl.logoUrl.startsWith('/uploads') ? `${window.location.protocol}//${window.location.hostname}:5000${tpl.logoUrl}` : tpl.logoUrl} 
              className={isMini ? "object-contain" : "object-contain"} 
              style={{ height: isMini ? `${16 * imgScale}px` : `${40 * imgScale}px` }} 
              alt="Logo" 
            />
          )}

          {tpl.showUserPhoto && (user.profilePhoto ? (
            <img 
              src={user.profilePhoto.startsWith('/uploads') ? `${window.location.protocol}//${window.location.hostname}:5000${user.profilePhoto}` : user.profilePhoto} 
              className="rounded-full object-cover shrink-0"
              style={{ 
                borderColor: tpl.accentColor, 
                borderWidth: isMini ? '1px' : '2px',
                width: isMini ? `${24 * imgScale}px` : `${56 * imgScale}px`,
                height: isMini ? `${24 * imgScale}px` : `${56 * imgScale}px`
              }} 
            />
          ) : (
            <div 
              className="rounded-full flex items-center justify-center font-bold shrink-0 bg-slate-800" 
              style={{ 
                borderColor: tpl.accentColor, 
                borderWidth: isMini ? '1px' : '2px',
                color: tpl.textColor, 
                width: isMini ? `${24 * imgScale}px` : `${56 * imgScale}px`,
                height: isMini ? `${24 * imgScale}px` : `${56 * imgScale}px`,
                fontSize: isMini ? `${9 * imgScale}px` : `${16 * imgScale}px`
              }}>
                {user.name.charAt(0)}
            </div>
          ))}
          
          <div className="flex-1 min-w-0">
            {tpl.showUserName && <h4 className={isMini ? "font-bold text-[8px] truncate leading-tight" : "font-bold text-sm sm:text-base truncate"} style={{ color: tpl.textColor, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>{user.name}</h4>}
            {tpl.showUserDetails && <p className={isMini ? "text-[6px] truncate leading-tight opacity-90" : "text-[10px] sm:text-xs truncate opacity-90"} style={{ color: tpl.textColor, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>{user.agentType || 'Advisor'} | {user.company || 'Policybhandar'}</p>}
            
            {tpl.showSocialIcons && !isMini && (
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-3.5 h-3.5 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[7px] font-bold pb-px">f</span>
                <span className="w-3.5 h-3.5 rounded-full bg-[#E4405F] text-white flex items-center justify-center text-[6px] font-bold pb-px">ig</span>
                <span className="w-3.5 h-3.5 rounded-full bg-black text-white flex items-center justify-center text-[7px] font-bold pb-px">X</span>
                <span className="w-3.5 h-3.5 rounded-full bg-[#0A66C2] text-white flex items-center justify-center text-[6px] font-bold pb-px">in</span>
              </div>
            )}
          </div>
          
          {tpl.showUserMobile && (
            <div className="text-right shrink-0">
              <p className={isMini ? "font-bold text-[7px] whitespace-nowrap" : "font-bold text-xs sm:text-sm whitespace-nowrap"} style={{ color: tpl.accentColor, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>Mob: +91 {user.mobile}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="glass-effect rounded-2xl overflow-hidden border border-white/5 shadow-lg group hover:border-indigo-500/20 hover:shadow-indigo-500/5 transition-all duration-300">
      {/* Thumbnail Container (Click to Preview) */}
      <div 
        onClick={() => setPreviewOpen(true)}
        className="relative aspect-video w-full overflow-hidden bg-slate-950 cursor-pointer group/thumb"
      >
        <img
          src={material.thumbnail}
          alt={material.title}
          className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-500"
        />

        {/* Premium Tag */}
        {material.isPremium && (
          <span className="absolute top-2 left-2 bg-gradient-premium text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center space-x-1 shadow-lg shadow-purple-500/30">
            <Sparkles size={10} />
            <span>PRO</span>
          </span>
        )}

        {/* Type Tag */}
        <span className="absolute top-2 right-2 bg-black/60 backdrop-blur-md !text-white text-[9px] font-semibold px-1.5 py-0.5 rounded flex items-center space-x-1 border border-white/10">
          {getIcon()}
          <span>{material.type}</span>
        </span>

        {/* Mini Thumbnail Watermark Overlay */}
        {renderHTMLOverlay(true)}

        {/* Hover Overlay Icon */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
          <Eye size={32} className="text-white drop-shadow-lg" />
        </div>
      </div>

      {/* Info Body */}
      <div className="p-4 space-y-3">
        <div>
          <span className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase">
            {material.companyName || 'General'}
          </span>
          <h4 className="text-sm font-bold text-white leading-snug line-clamp-1 mt-0.5">
            {material.title}
          </h4>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full bg-gradient-premium hover:bg-gradient-premium-hover rounded-xl py-2.5 text-xs font-semibold text-white flex items-center justify-center space-x-1.5 shadow-lg shadow-indigo-500/10 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            {downloading ? (
              <span className="w-4 h-4 border border-white/35 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <Download size={16} />
                <span>Get Watermarked File</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preview Modal rendered via Portal to break out of overflow: hidden */}
      {previewOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-6 bg-slate-950/95 backdrop-blur-md">
          <div className="relative w-[95vw] sm:w-[90vw] max-w-6xl h-[85vh] bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            
            {/* Top Bar */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/50">
              <h3 className="text-lg font-bold text-white line-clamp-1">{material.title}</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="bg-gradient-premium hover:bg-gradient-premium-hover text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2"
                >
                  {downloading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <Download size={16} />}
                  Download
                </button>
                <button
                  onClick={() => setPreviewOpen(false)}
                  className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Media Rendering */}
            <div className="relative flex-1 w-full bg-black flex items-center justify-center overflow-hidden p-4">
              {material.type === 'Banner' && (
                <img src={previewUrl} alt={material.title} className="max-w-full max-h-full object-contain drop-shadow-2xl" />
              )}
              {material.type === 'Reel' && (
                <div className="relative h-full max-w-full inline-block">
                  <video src={material.fileUrl} controls autoPlay loop className="max-h-full object-contain" />
                  
                  {/* HTML Overlay Watermark for Reels (Preview Only) */}
                  {renderHTMLOverlay(false)}
                </div>
              )}
              {material.type === 'PDF' && (
                <div className="text-center p-6 space-y-4">
                  <FileText className="mx-auto text-indigo-500" size={80} />
                  <p className="text-base text-gray-300 max-w-md">Brochure / PDF document.</p>
                </div>
              )}
            </div>

            {/* Bottom details */}
            <div className="p-3 border-t border-white/10 bg-slate-900 flex items-center justify-between text-xs text-gray-400">
              <span>Type: {material.type}</span>
              <span>
                {material.type === 'Reel' ? 'Watermark shown in preview is for demo.' : 'Watermark is applied automatically on download.'}
              </span>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Upgrade Prompt Modal */}
      {upgradePrompt && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md">
          <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl shadow-indigo-500/20">
            <ShieldAlert size={48} className="text-orange-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Premium Content</h3>
            <p className="text-gray-400 text-sm mb-6">{errorMessage}</p>
            <div className="flex flex-col gap-3">
              <a href="/pricing" className="w-full bg-gradient-premium hover:bg-gradient-premium-hover py-3 rounded-xl font-bold text-white shadow-lg shadow-indigo-500/20 cursor-pointer block">
                View Pricing Plans
              </a>
              <button onClick={() => setUpgradePrompt(false)} className="w-full py-3 text-gray-400 hover:text-white font-semibold cursor-pointer">
                Maybe Later
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
