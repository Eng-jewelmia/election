
import React, { useState, useEffect, useRef } from 'react';
import { Member } from '../types.ts';
import { Save, RefreshCw, Trash2, X, Languages, Info, MapPin, Users, Crop, Check, ZoomIn, ZoomOut, Image as ImageIcon } from 'lucide-react';
import { transliterateToBangla } from '../utils/transliterate.ts';

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
  
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const DEFAULT_ORG = 'বাংলাদেশ জাতীয়তাবাদী দল - বিএনপি';
  const defaultVillages = ['বাসাটি', 'লংপুর', 'বানাইল', 'ফুলবাড়িয়া', 'খামারগাঁও', 'ঘোষপালা'];
  const associateWings = ['স্বেচ্ছাসেবক দল', 'যুবদল', 'ছাত্রদল', 'কৃষক দল', 'মহিলা দল', 'অন্যান্য'];

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

  const performCrop = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (canvas && img) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const cropSize = 250;
        canvas.width = cropSize;
        canvas.height = cropSize;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, cropSize, cropSize);
        const imgWidth = img.naturalWidth;
        const imgHeight = img.naturalHeight;
        const scale = Math.min(250 / imgWidth, 250 / imgHeight);
        const displayW = imgWidth * scale * zoom;
        const displayH = imgHeight * scale * zoom;
        ctx.drawImage(img, (cropSize/2 - displayW/2 + position.x), (cropSize/2 - displayH/2 + position.y), displayW, displayH);
        setFormData(prev => ({ ...prev, photo_url: canvas.toDataURL('image/jpeg', 0.8) }));
        setIsCropping(false);
        setTempImage(null);
      }
    }
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

  return (
    <div className="space-y-3">
      {/* Cropper Modal for Mobile Comfort */}
      {isCropping && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black bg-opacity-90 p-2">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full">
            <div className="p-3 border-b flex justify-between items-center font-bold">
              <span>ছবি সাজিয়ে নিন</span>
              <button onClick={() => setIsCropping(false)}><X size={24}/></button>
            </div>
            <div className="p-4 flex flex-col items-center">
              <div className="relative w-56 h-56 border-2 border-blue-500 rounded-lg overflow-hidden bg-gray-100 touch-none"
                   onMouseDown={(e) => { setIsDragging(true); setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y }); }}
                   onMouseMove={(e) => { if (isDragging) setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); }}
                   onMouseUp={() => setIsDragging(false)}
                   onTouchStart={(e) => { setIsDragging(true); setDragStart({ x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y }); }}
                   onTouchMove={(e) => { if (isDragging) setPosition({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y }); }}
                   onTouchEnd={() => setIsDragging(false)}>
                <img ref={imgRef} src={tempImage!} alt="Crop" className="absolute" style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`, transformOrigin: 'center', maxWidth: 'none' }} />
              </div>
              <div className="mt-5 w-full space-y-3">
                <input type="range" min="0.5" max="3" step="0.1" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-full h-2 bg-blue-100 rounded-lg accent-blue-600" />
                <div className="flex justify-between text-[10px] font-bold text-gray-500"><span>Zoom Out</span><span>Zoom In</span></div>
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <div className="p-3 border-t flex justify-end gap-2">
              <button onClick={() => setIsCropping(false)} className="px-4 py-2 text-sm font-bold text-gray-500">বাতিল</button>
              <button onClick={performCrop} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg">ক্রপ করুন</button>
            </div>
          </div>
        </div>
      )}

      {/* Form Controls */}
      <div className="flex justify-between items-center h-8 no-print">
        <div className="flex items-center gap-1 text-[11px] text-blue-800 font-bold bg-blue-50 px-2 py-1 rounded">
          <Info size={12} /><span>লিখে Space দিন বাংলা হবে</span>
        </div>
        <button onClick={() => setIsSmartBangla(!isSmartBangla)} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black transition-all border ${isSmartBangla ? 'bg-green-600 text-white border-green-700 shadow-md' : 'bg-white text-gray-400 border-gray-300'}`}>
          <Languages size={14} /> {isSmartBangla ? 'স্মার্ট বাংলা চালু' : 'স্মার্ট বাংলা বন্ধ'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-1 rounded-lg">
        {/* Photo Upload Section */}
        <div className="md:col-span-1 flex flex-col items-center justify-center p-2 border border-gray-100 rounded-lg bg-gray-50/50">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <img src={formData.photo_url} alt="Profile" className="w-24 h-24 md:w-32 md:h-32 rounded-lg object-cover border-2 border-white shadow-md group-hover:opacity-90 transition" />
            <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full shadow-lg border-2 border-white"><ImageIcon size={14} /></div>
            <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" accept="image/*" />
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase mt-3 tracking-tighter">Passport / Stamp Size</p>
        </div>

        {/* Input Fields Grid */}
        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="relative">
            <label className="text-[11px] font-black text-gray-500 uppercase ml-1">পূর্ণ নাম</label>
            <input required name="name" value={formData.name} onChange={handleChange} className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-900" placeholder="যেমন: Rakib Ahmed" />
            {suggestion?.field === 'name' && <button type="button" onClick={() => { const p = formData.name.split(' '); p[p.length-1] = suggestion.text; setFormData({...formData, name: p.join(' ')+' '}); setSuggestion(null); }} className="absolute right-1 top-8 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded shadow-lg animate-pulse">{suggestion.text}</button>}
          </div>

          <div>
            <label className="text-[11px] font-black text-gray-500 uppercase ml-1">মোবাইল নম্বর</label>
            <input required name="mobile" type="tel" value={formData.mobile} onChange={handleChange} className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-sm font-bold font-mono tracking-wider" placeholder="017xxxxxxxx" />
          </div>

          <div className="relative bg-slate-50 p-2 rounded-lg border border-slate-200">
            <label className="text-[11px] font-black text-slate-600 uppercase flex items-center gap-1 mb-1"><MapPin size={12}/> গ্রাম</label>
            <div className="flex flex-wrap gap-1 mb-2">
              {defaultVillages.map(v => (
                <button key={v} type="button" onClick={() => setFormData({...formData, village: v})} className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${formData.village === v ? 'bg-green-600 text-white border-green-700' : 'bg-white text-gray-600 border-gray-300'}`}>{v}</button>
              ))}
            </div>
            <input name="village" value={formData.village} onChange={handleChange} className="w-full h-9 px-3 bg-white border border-gray-300 rounded-lg text-sm font-bold" placeholder="গ্রামের নাম লিখুন" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-black text-gray-500 uppercase ml-1">দূরত্ব (কি.মি.)</label>
              <input name="distance" value={formData.distance} onChange={handleChange} className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-sm font-bold" placeholder="যেমন: ২.৫" />
            </div>
            <div>
              <label className="text-[11px] font-black text-gray-500 uppercase ml-1">সংগঠনে যুক্ত?</label>
              <select name="org_yes_no" value={formData.org_yes_no} onChange={handleChange} className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-sm font-bold">
                <option value="হ্যাঁ">হ্যাঁ</option><option value="না">না</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-black text-gray-500 uppercase ml-1">সংগঠনের নাম</label>
            <input name="org_name" value={formData.org_name} onChange={handleChange} className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-sm font-bold" />
          </div>

          <div className="relative sm:col-span-2 bg-blue-50/50 p-2 rounded-lg border border-blue-100">
            <label className="text-[11px] font-black text-blue-800 uppercase flex items-center gap-1 mb-1"><Users size={12}/> পদবী ও উইং</label>
            <div className="flex flex-wrap gap-1 mb-2">
              {associateWings.map(wing => (
                <button key={wing} type="button" onClick={() => setFormData({...formData, position: wing === 'অন্যান্য' ? '' : wing + ' '})} className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${formData.position.startsWith(wing) ? 'bg-blue-600 text-white border-blue-700' : 'bg-white text-blue-800 border-blue-200'}`}>{wing}</button>
              ))}
            </div>
            <input name="position" value={formData.position} onChange={handleChange} className="w-full h-9 px-3 bg-white border border-blue-200 rounded-lg text-sm font-bold" placeholder="যেমন: সহ-সভাপতি" />
          </div>

          <div>
            <label className="text-[11px] font-black text-gray-500 uppercase ml-1">ভোট কেন্দ্র</label>
            <select name="vote_center" value={formData.vote_center} onChange={handleChange} className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-sm font-bold">
              {centers.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <label className="text-[11px] font-black text-gray-500 uppercase ml-1">মন্তব্য (যদি থাকে)</label>
            <input name="remarks" value={formData.remarks} onChange={handleChange} className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-sm" placeholder="অতিরিক্ত তথ্য..." />
          </div>
        </div>

        {/* Form Actions */}
        <div className="md:col-span-4 flex justify-end gap-3 pt-2 mt-2 border-t border-gray-100">
          <button type="button" onClick={clearForm} className="px-6 h-11 rounded-xl text-sm font-black text-gray-500 hover:bg-gray-100 transition flex items-center gap-2 uppercase tracking-wider">ক্লিয়ার</button>
          <button type="submit" className="flex-1 md:flex-none bg-green-700 hover:bg-green-800 text-white px-10 h-11 rounded-xl text-sm font-black transition-all shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider">
            {editingMember ? <RefreshCw size={18} /> : <Save size={18} />}
            {editingMember ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
          </button>
        </div>
      </form>
    </div>
  );
};
