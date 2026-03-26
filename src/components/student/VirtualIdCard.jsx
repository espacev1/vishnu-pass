import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Download, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const VirtualIdCard = ({ studentData }) => {
    const cardRef = useRef(null);
    const [downloading, setDownloading] = useState(false);
    const [localPhotoUrl, setLocalPhotoUrl] = useState(null);

    React.useEffect(() => {
        const loadPhoto = async () => {
            if (!studentData?.photo_url) return;
            
            try {
                // Extract path from public URL to use the native Supabase SDK (handles CORS implicitly)
                const match = studentData.photo_url.match(/\/object\/public\/students\/(.+)$/);
                
                if (match && match[1]) {
                    const path = match[1];
                    const { data, error } = await supabase.storage.from('students').download(path);
                    if (error) throw error;
                    setLocalPhotoUrl(URL.createObjectURL(data));
                } else {
                    // Fallback proxy fetch
                    const res = await fetch(studentData.photo_url);
                    if (!res.ok) throw new Error("Fetch failed");
                    const blob = await res.blob();
                    setLocalPhotoUrl(URL.createObjectURL(blob));
                }
            } catch (err) {
                console.error("Failed to load local blob:", err);
                // CRITICAL: Do NOT fallback to the raw cross-origin URL!
                // It will silently taint the canvas and crash the download.
                // Leave it null to render the initials placeholder instead.
                setLocalPhotoUrl(null);
            }
        };

        loadPhoto();
    }, [studentData?.photo_url]);

    const handleDownload = async () => {
        if (!cardRef.current || downloading) return;
        setDownloading(true);
        
        try {
            const canvas = await html2canvas(cardRef.current, {
                scale: 2, 
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
                ignoreElements: (el) => el.classList.contains('hide-on-print')
            });
            
            const image = canvas.toDataURL('image/png');
            const fileName = `Vishnu_VID_${studentData?.student_id || 'Student'}.png`;

            // 1. Try Native Web Share API first (Most reliable on Mobile Browsers)
            if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
                try {
                    const res = await fetch(image);
                    const blob = await res.blob();
                    const file = new File([blob], fileName, { type: 'image/png' });
                    await navigator.share({
                        title: 'My Virtual ID',
                        files: [file]
                    });
                    setDownloading(false);
                    return; // Early exit on success
                } catch (shareError) {
                    console.log("Share API skipped or cancelled, falling back to standard download...", shareError);
                }
            }
            
            // 2. Standard DOM Anchor Fallback
            const link = document.createElement('a');
            link.href = image;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error downloading ID card:", error);
            alert("Failed to download Virtual ID. If you have an ad blocker or strict privacy settings, please disable them and try again.");
        } finally {
            setDownloading(false);
        }
    };

    const initials = studentData?.full_name
        ? studentData.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : 'ST';

    // Parse names
    const fullName = studentData?.full_name || 'Vishnu Student';
    const names = fullName.split(' ');
    const firstName = names[0];
    const lastName = names.length > 1 ? names.slice(1).join(' ') : '';

    const deptShort = studentData?.departments?.name
        ? studentData.departments.name.split(' ').map(w => w[0]).join('').toUpperCase()
        : 'DEPT';
    
    const yearLabel = `${studentData?.year_of_study || '1'}${
        studentData?.year_of_study == 1 ? 'st' :
        studentData?.year_of_study == 2 ? 'nd' :
        studentData?.year_of_study == 3 ? 'rd' : 'th'
    } Year Student`;

    return (
        <div className="w-full flex justify-center py-4 mb-4">
            <div 
                ref={cardRef} 
                className="w-full max-w-[340px] bg-white rounded-3xl overflow-hidden relative"
                style={{
                    boxShadow: '0 10px 40px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.02)',
                    border: '1px solid rgba(0,0,0,0.03)'
                }}
            >
                {/* Background Decor */}
                <div className="hide-on-print absolute top-0 right-0 w-48 h-48 bg-orange-50/60 rounded-full blur-3xl -translate-y-24 translate-x-12 pointer-events-none" />
                
                <div className="p-6 relative z-10">
                    {/* Top Section */}
                    <div className="flex items-start gap-4 mb-6">
                        {/* Profile Photo */}
                        <div className="w-20 h-20 rounded-2xl bg-[#fad6bd] overflow-hidden flex-shrink-0 shadow-sm border-2 border-white/50 relative">
                            {localPhotoUrl || studentData?.photo_url ? (
                                <img src={localPhotoUrl || studentData.photo_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#f47c20] font-black text-xl">
                                    {initials}
                                </div>
                            )}
                        </div>

                        {/* Name and Basic Info */}
                        <div className="flex-1 min-w-0 pt-0.5">
                            <h2 className="text-xl font-black text-[#1a2b3c] leading-tight break-words">
                                {firstName}
                                {lastName && <><br />{lastName}</>}
                            </h2>
                            <p className="text-gray-400 font-bold text-[11px] uppercase tracking-widest mt-1">
                                ID: {studentData?.student_id || 'N/A'}
                            </p>
                        </div>

                        {/* Year Badge */}
                        <div className="text-right flex-shrink-0 pt-1">
                            <p className="text-[#f47c20] font-black text-[11px] leading-tight">{yearLabel}</p>
                            <p className="text-purple-700 font-black text-[10px] uppercase mt-0.5">{studentData?.batch ? `Batch ${studentData.batch}` : 'Current'}</p>
                        </div>
                    </div>

                    {/* Divider Grid */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 pt-4 border-t border-gray-100">
                        {/* Dept */}
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Dept</p>
                            <p className="text-[13px] font-black text-[#1a2b3c] truncate">{deptShort}</p>
                            <p className="text-[9px] font-medium text-gray-400 italic truncate" title={studentData?.departments?.name}>
                                {studentData?.departments?.name || 'Department'}
                            </p>
                        </div>

                        {/* Contact */}
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Contact</p>
                            <p className="text-[13px] font-black text-[#1a2b3c] truncate">
                                {studentData?.contact_number || 'N/A'}
                            </p>
                            <p className="text-[9px] font-medium text-gray-400 italic">Verified Phone</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 pt-4 mt-4 border-t border-gray-100">
                        {/* Campus */}
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Campus</p>
                            <p className="text-[11px] font-bold text-gray-600 leading-snug">
                                {studentData?.campus || 'VITB, SVECW, Degree, Polytech, Dental, Pharmacy'}
                            </p>
                        </div>

                        {/* Download VID */}
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">VID</p>
                            <button 
                                onClick={handleDownload}
                                disabled={downloading}
                                className="hide-on-print flex flex-col items-start group disabled:opacity-50"
                            >
                                <span className="text-[12px] font-black text-purple-700 group-hover:text-purple-800 transition-colors flex items-center gap-1">
                                    {downloading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Download (VID)'}
                                </span>
                                <span className="text-[9px] font-medium text-gray-400 flex items-center gap-1 mt-0.5">
                                    Virtual Id <Download className="w-2.5 h-2.5" />
                                </span>
                            </button>
                            <div className="hidden print:block text-[12px] font-black text-purple-700">
                                Digital Verified
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VirtualIdCard;
