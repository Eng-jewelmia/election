
import React, { useState, useEffect, useRef } from 'react';
import { Member } from '../types';
import { Save, RefreshCw, Trash2, X, Languages, Info, MapPin, Users, Crop, Check, ZoomIn, ZoomOut } from 'lucide-react';
import { transliterateToBangla } from '../utils/transliterate';

interface MemberFormProps {
  onSave: (member: Omit<Member, 'id' | 'serial' | 'created_at'>) => void;
  editingMember: Member | null;
  setEditingMember: React.Dispatch<React.SetStateAction<Member | null>>;
  centers: string[];
}

export const MemberForm: React.FC<MemberFormProps> = ({ 
  onSave, 
  editingMember, 
  setEditingMember,
  centers
}) => {
  const [isSmartBangla, setIsSmartBangla] = useState(true);
  const [suggestion, setSuggestion] = useState<{ field: string; text: string; original: string } | null>(null);
  
  // Manual Cropping States
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const DEFAULT_ORG = 'বাংলাদেশ জাতীয়তাবাদী দল - বিএনপি';
  
  const [formData, setFormData] = useState<Omit<Member, 'id' | 'serial' | 'created_at'>>({
    photo_url: 'https://picsum.photos/200/200',
    name: '',
    mobile: '',
    village: '',
    distance: '',
    org_yes_no: 'হ্যাঁ',
    org_name: DEFAULT_ORG,
    position: '',
    vote_center: centers[0] || '',
    remarks: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const defaultVillages = ['বাসাটি', 'লংপুর', 'বানাইল', 'ফুলবাড়িয়া', 'খামারগাঁও', 'ঘোষপালা'];
  const associateWings = ['স্বেচ্ছাসেবক দল', 'যুবদল', 'ছাত্রদল', 'কৃষক দল', 'মহিলা দল', 'অন্যান্য'];

  useEffect(() => {
    if (editingMember) {
      const { id, serial, created_at, ...data } = editingMember;
      setFormData(data);
    }
  }, [editingMember]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const banglaFields = ['name', 'village', 'org_name', 'position', 'remarks'];
    
    if (isSmartBangla && banglaFields.includes(name)) {
      const parts = value.split(' ');
      const lastWord = parts[parts.length - 1];
      
      if (value.endsWith(' ')) {
        const wordToConvert = parts[parts.length - 2];
        if (wordToConvert && /^[a-zA-Z]+$/.test(wordToConvert)) {
          const converted = transliterateToBangla(wordToConvert);
          parts[parts.length - 2] = converted;
          const newValue = parts.join(' ');
          setFormData(prev => ({ ...prev, [name]: newValue }));
          setSuggestion(null);
          return;
        }
      }

      if (lastWord && /^[a-zA-Z]+$/.test(lastWord)) {
        const banglaSuggestion = transliterateToBangla(lastWord);
        setSuggestion({ field: name, text: banglaSuggestion, original: lastWord });
      } else {
        setSuggestion(null);
      }
    } else {
      setSuggestion(null);
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImage(reader.result as string);
        setIsCropping(true);
        setZoom(1);
        setPosition({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX - position.x, y: clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setPosition({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const performCrop = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (canvas && img) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const cropSize = 300; // Final output size
        canvas.width = cropSize;
        canvas.height = cropSize;
        
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, cropSize, cropSize);

        const imgWidth = img.naturalWidth;
        const imgHeight = img.naturalHeight;
        
        const scale = Math.min(300 / imgWidth, 300 / imgHeight);
        const displayW = imgWidth * scale * zoom;
        const displayH = imgHeight * scale * zoom;
        
        ctx.drawImage(
          img,
          (cropSize/2 - displayW/2 + position.x),
          (cropSize/2 - displayH/2 + position.y),
          displayW,
          displayH
        );
        
        // 0.7 quality saves significant storage space in localStorage
        const croppedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        setFormData(prev => ({ ...prev, photo_url: croppedBase64 }));
        setIsCropping(false);
        setTempImage(null);
      }
    }
  };

  const applySuggestion = (field: string) => {
    if (!suggestion) return;
    const value = (formData as any)[field];
    const parts = value.split(' ');
    parts[parts.length - 1] = suggestion.text;
    const newValue = parts.join(' ') + ' ';
    setFormData(prev => ({ ...prev, [field]: newValue }));
    setSuggestion(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    clearForm();
  };

  const clearForm = () => {
    setFormData({
      photo_url: 'https://picsum.photos/200/200',
      name: '',
      mobile: '',
      village: '',
      distance: '',
      org_yes_no: 'হ্যাঁ',
      org_name: DEFAULT_ORG,
      position: '',
      vote_center: centers[0] || '',
      remarks: '',
    });
    setEditingMember(null);
    setSuggestion(null);
  };

  const SuggestionBox = ({ field }: { field: string }) => {
    if (suggestion?.field !== field) return null;
    return (
      <button
        type="button"
        onClick={() => applySuggestion(field)}
        className="absolute right-2 top-8 text-[11px] bg-blue-600 text-white px-2 py-0.5 rounded shadow-lg animate-bounce z-10 border border-white hover:bg-blue-700 transition cursor-pointer flex items-center gap-1"
      >
        <span className="opacity-70 font-mono">{suggestion.original} →</span>
        <span className="font-bold">{suggestion.text}</span>
      </button>
    );
  };

  return (
    <div className="space-y-4 text-black">
      {/* Manual Cropper Modal */}
      {isCropping && tempImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-80 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="bg-gray-100 p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold flex items-center gap-2 text-black">
                <Crop size={20} className="text-blue-600" /> ছবি ক্রপ করুন
              </h3>
              <button onClick={() => setIsCropping(false)} className="text-gray-500 hover:text-black">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 flex flex-col items-center select-none">
              <div 
                ref={containerRef}
                className="relative w-64 h-64 border-4 border-blue-500 bg-gray-200 overflow-hidden cursor-move rounded"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleMouseDown}
                onTouchMove={handleMouseMove}
                onTouchEnd={handleMouseUp}
              >
                <img 
                  ref={imgRef}
                  src={tempImage} 
                  alt="To crop" 
                  draggable={false}
                  style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                    transformOrigin: 'center',
                    maxWidth: '100%',
                    display: 'block',
                    margin: 'auto',
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0
                  }}
                />
                <div className="absolute inset-0 border-2 border-white border-opacity-30 pointer-events-none flex items-center justify-center">
                   <div className="w-full h-full border border-dashed border-white border-opacity-50"></div>
                </div>
              </div>

              <div className="mt-6 w-full space-y-4">
                <div className="flex items-center gap-3">
                  <ZoomOut size={18} className="text-gray-500" />
                  <input 
                    type="range" 
                    min="0.5" 
                    max="4" 
                    step="0.1" 
                    value={zoom} 
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <ZoomIn size={18} className="text-gray-500" />
                </div>
                <p className="text-center text-xs font-bold text-gray-500">
                  ছবিটি ড্র্যাগ করে পজিশন করুন এবং স্লাইডার দিয়ে জুম ইন/আউট করুন।
                </p>
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="bg-gray-50 p-4 border-t flex justify-end gap-3">
              <button 
                onClick={() => setIsCropping(false)}
                className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded transition"
              >
                বাতিল
              </button>
              <button 
                onClick={performCrop}
                className="bg-blue-600 text-white px-8 py-2 rounded font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-lg"
              >
                <Check size={18} /> ক্রপ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-2 no-print">
        <div className="flex items-center gap-1 text-xs text-blue-800 font-bold">
          <Info size={14} />
          <span>ইংরেজিতে লিখে Space দিন অটো বাংলা হবে</span>
        </div>
        <label className="text-xs font-bold text-black flex items-center gap-1 cursor-pointer bg-white px-3 py-1 rounded-full border border-gray-400 shadow-sm hover:bg-gray-50 transition">
          <input 
            type="checkbox" 
            checked={isSmartBangla} 
            onChange={(e) => setIsSmartBangla(e.target.checked)}
            className="rounded border-gray-400 text-green-700 focus:ring-green-600"
          />
          <Languages size={14} className="text-green-700" />
          স্মার্ট বাংলা চালু
        </label>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col items-center justify-center border-r border-gray-300 pr-6 space-y-4">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <img 
              src={formData.photo_url} 
              alt="Preview" 
              className="w-32 h-32 object-cover border-4 border-gray-200 rounded shadow-inner group-hover:opacity-75 transition"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
               <div className="bg-black bg-opacity-50 text-white p-2 rounded-full"><RefreshCw size={20} /></div>
            </div>
            <button 
              type="button"
              className="absolute bottom-0 right-0 bg-blue-700 text-white p-2 rounded-full shadow-lg hover:bg-blue-800 transition"
            >
              <RefreshCw size={16} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handlePhotoUpload} 
              className="hidden" 
              accept="image/*"
            />
          </div>
          <p className="text-[10px] text-black font-bold uppercase tracking-wider">Stamp Size 1:1</p>
        </div>

        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-sm font-bold text-black">নাম (Name)</label>
            <input 
              required name="name" value={formData.name} onChange={handleChange}
              placeholder="যেমন: Rakib"
              className="w-full border-2 border-gray-300 rounded px-3 py-2 mt-1 focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none transition text-black font-semibold"
            />
            <SuggestionBox field="name" />
          </div>

          <div>
            <label className="block text-sm font-bold text-black">মোবাইল নম্বর</label>
            <input 
              required name="mobile" value={formData.mobile} onChange={handleChange}
              placeholder="017XXXXXXXX"
              className="w-full border-2 border-gray-300 rounded px-3 py-2 mt-1 focus:ring-2 focus:ring-green-600 outline-none transition text-black font-mono font-bold"
            />
          </div>

          <div className="relative md:col-span-2 bg-gray-100 p-3 rounded-lg border-2 border-gray-300">
            <label className="block text-sm font-bold text-black flex items-center gap-1 mb-2">
              <MapPin size={14} className="text-red-700" /> গ্রাম সিলেক্ট করুন (বা লিখুন)
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {defaultVillages.map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setFormData(prev => ({...prev, village: v}))}
                  className={`px-3 py-1 text-xs font-bold rounded-full border-2 transition-all ${
                    formData.village === v 
                      ? 'bg-green-700 text-white border-green-800 shadow-md' 
                      : 'bg-white text-black border-gray-400 hover:border-green-700 shadow-sm'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            <div className="relative">
              <input 
                name="village" value={formData.village} onChange={handleChange}
                placeholder="গ্রামের নাম..."
                className="w-full border-2 border-gray-400 rounded px-3 py-2 focus:ring-2 focus:ring-green-600 outline-none transition bg-white text-black font-semibold"
              />
              <SuggestionBox field="village" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-black">ভোট কেন্দ্র থেকে দূরত্ব</label>
            <input 
              name="distance" value={formData.distance} onChange={handleChange}
              placeholder="যেমন: ২ কি.মি."
              className="w-full border-2 border-gray-300 rounded px-3 py-2 mt-1 focus:ring-2 focus:ring-green-600 outline-none transition text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-black">সংগঠনে যুক্ত কি?</label>
            <select 
              name="org_yes_no" value={formData.org_yes_no} onChange={handleChange}
              className="w-full border-2 border-gray-300 rounded px-3 py-2 mt-1 focus:ring-2 focus:ring-green-600 outline-none transition cursor-pointer font-bold text-black"
            >
              <option value="হ্যাঁ">হ্যাঁ</option>
              <option value="না">না</option>
            </select>
          </div>

          <div className="relative md:col-span-2">
            <label className="block text-sm font-bold text-black">সংগঠনের নাম</label>
            <input 
              name="org_name" value={formData.org_name} onChange={handleChange}
              placeholder="সংগঠনের নাম লিখুন..."
              className="w-full border-2 border-gray-300 rounded px-3 py-2 mt-1 focus:ring-2 focus:ring-green-600 outline-none transition font-bold text-black"
            />
            <SuggestionBox field="org_name" />
          </div>

          <div className="relative md:col-span-2 bg-blue-50 p-3 rounded-lg border-2 border-blue-200">
            <label className="block text-sm font-bold text-black flex items-center gap-1 mb-2">
              <Users size={14} className="text-blue-800" /> পদবী ও সংগঠন (সহজে সিলেক্ট করুন)
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {associateWings.map(wing => (
                <button
                  key={wing}
                  type="button"
                  onClick={() => setFormData(prev => ({...prev, position: wing === 'অন্যান্য' ? '' : wing + ' '}))}
                  className={`px-3 py-1 text-xs font-bold rounded-full border-2 transition-all ${
                    formData.position.startsWith(wing) 
                      ? 'bg-blue-700 text-white border-blue-800 shadow-md' 
                      : 'bg-white text-black border-gray-400 hover:border-blue-700 shadow-sm'
                  }`}
                >
                  {wing}
                </button>
              ))}
            </div>
            <div className="relative">
              <input 
                name="position" value={formData.position} onChange={handleChange}
                placeholder="পদবী (যেমন: সভাপতি / সাধারণ সম্পাদক)"
                className="w-full border-2 border-gray-400 rounded px-3 py-2 focus:ring-2 focus:ring-green-600 outline-none transition bg-white text-black font-semibold"
              />
              <SuggestionBox field="position" />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-black">ভোট কেন্দ্র</label>
            <select 
              name="vote_center" value={formData.vote_center} onChange={handleChange}
              className="w-full border-2 border-gray-300 rounded px-3 py-2 mt-1 focus:ring-2 focus:ring-green-600 outline-none transition cursor-pointer font-bold text-black"
            >
              {centers.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="md:col-span-2 relative">
            <label className="block text-sm font-bold text-black">মন্তব্য</label>
            <textarea 
              name="remarks" value={formData.remarks} onChange={handleChange}
              className="w-full border-2 border-gray-300 rounded px-3 py-2 mt-1 focus:ring-2 focus:ring-green-600 outline-none transition h-20 text-black font-medium"
            />
            <SuggestionBox field="remarks" />
          </div>
        </div>

        <div className="md:col-span-3 flex justify-end gap-3 pt-4 border-t border-gray-300">
          <button 
            type="button" 
            onClick={clearForm}
            className="bg-gray-200 text-black border-2 border-gray-400 px-6 py-2 rounded-lg hover:bg-gray-300 transition flex items-center gap-2 font-bold shadow-sm"
          >
            <X size={18} /> ক্লিয়ার
          </button>
          <button 
            type="submit"
            className="bg-green-700 text-white border-2 border-green-800 px-8 py-2 rounded-lg hover:bg-green-800 transition shadow-lg flex items-center gap-2 font-bold"
          >
            {editingMember ? <RefreshCw size={18} /> : <Save size={18} />}
            {editingMember ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
          </button>
        </div>
      </form>
    </div>
  );
};
