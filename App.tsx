
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { MemberForm } from './components/MemberForm.tsx';
import { MemberTable } from './components/MemberTable.tsx';
import { Footer } from './components/Footer.tsx';
import { Member, AppConfig } from './types.ts';
import { LogIn, Database, LogOut, Printer, LayoutDashboard, UserPlus, Info } from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('nandail_auth') === 'true';
    } catch (e) {
      return false;
    }
  });

  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'form' | 'table'>('form');
  
  const [members, setMembers] = useState<Member[]>(() => {
    try {
      const saved = localStorage.getItem('nandail_members_v3');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [config, setConfig] = useState<AppConfig>(() => {
    try {
      const saved = localStorage.getItem('nandail_config_v3');
      return saved ? JSON.parse(saved) : {
        unionName: '৪ নং চন্ডিপাশা',
        wardNo: '৮',
        selectedCenter: 'বাসাটি',
        allCenters: ['বাসাটি', 'লংপুর', 'বানাইল', 'ফুলবাড়িয়া', 'খামারগাঁও', 'ঘোষপালা', 'ঘোষপালা আলিয়া মাদ্রাসা'],
        collectorName: '',
        collectorMobile: '',
      };
    } catch (e) {
      return {
        unionName: '৪ নং চন্ডিপাশা',
        wardNo: '৮',
        selectedCenter: 'বাসাটি',
        allCenters: ['বাসাটি', 'লংপুর', 'বানাইল', 'ফুলবাড়িয়া', 'খামারগাঁও', 'ঘোষপালা', 'ঘোষপালা আলিয়া মাদ্রাসা'],
        collectorName: '',
        collectorMobile: '',
      };
    }
  });

  const [editingMember, setEditingMember] = useState<Member | null>(null);

  useEffect(() => {
    localStorage.setItem('nandail_members_v3', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('nandail_config_v3', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    if (editingMember) setActiveTab('form');
  }, [editingMember]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '123456') {
      setIsAuthenticated(true);
      localStorage.setItem('nandail_auth', 'true');
    } else {
      alert('ভুল পাসওয়ার্ড!');
    }
  };

  const addOrUpdateMember = (memberData: Omit<Member, 'id' | 'serial' | 'created_at'>) => {
    if (editingMember) {
      setMembers(prev => prev.map(m => m.id === editingMember.id ? { ...m, ...memberData } : m));
      setEditingMember(null);
    } else {
      const newMember: Member = {
        ...memberData,
        id: crypto.randomUUID(),
        serial: members.length + 1,
        created_at: new Date().toISOString(),
      };
      setMembers(prev => [...prev, newMember]);
    }
    setActiveTab('table');
  };

  const deleteMember = (id: string) => {
    if (confirm('আপনি কি নিশ্চিত যে এই তথ্যটি ডিলিট করতে চান?')) {
      setMembers(prev => {
        const filtered = prev.filter(m => m.id !== id);
        return filtered.map((m, idx) => ({ ...m, serial: idx + 1 }));
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm border-t-[6px] border-green-700">
          <div className="flex justify-center mb-6">
            <img src="https://i.postimg.cc/DzC1RqRk/images.jpg" alt="Logo" className="h-20 w-auto rounded-lg shadow-sm" />
          </div>
          <h1 className="text-2xl font-black text-center mb-2 text-slate-800 tracking-tighter">অ্যাডমিন প্রবেশ</h1>
          <p className="text-center text-gray-500 text-xs mb-8 font-bold">নান্দাইল নির্বাচনী ব্যবস্থাপনা সিস্টেম</p>
          <form onSubmit={handleLogin} className="space-y-5">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 h-12 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-green-600 outline-none font-black text-center text-lg transition-all"
              placeholder="পাসওয়ার্ড"
              autoFocus
            />
            <button type="submit" className="w-full bg-green-700 hover:bg-green-800 text-white h-12 rounded-xl transition-all flex items-center justify-center gap-2 font-black shadow-lg">
              <LogIn size={20} /> প্রবেশ করুন
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col print:bg-white pb-20 md:pb-0">
      <nav className="bg-white/95 backdrop-blur-sm shadow-sm border-b no-print py-1.5 px-4 flex justify-between items-center sticky top-0 z-[100] h-12">
        <div className="flex items-center gap-2 text-green-800 font-black">
          <Database size={20} className="hidden sm:block" />
          <span className="text-sm md:text-base leading-none">নান্দাইল নির্বাচনী ডাটাবেজ</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-xs font-black shadow-md">
            <Printer size={14} /> প্রিন্ট
          </button>
          <button onClick={() => { if(confirm('লগআউট করতে চান?')) { setIsAuthenticated(false); localStorage.removeItem('nandail_auth'); } }} className="text-slate-400 hover:text-red-600 p-1 transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-[1400px] mx-auto p-2 sm:p-4 md:p-6 space-y-4 print:p-0">
        <Header config={config} setConfig={setConfig} />

        <div className={`no-print transition-all ${activeTab === 'form' ? 'block' : 'hidden md:block'} bg-white p-3 md:p-5 rounded-2xl border border-slate-200 shadow-sm`}>
          <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-2">
            <UserPlus size={20} className="text-green-700" />
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">তথ্য সংযোজন ও পরিবর্তন</h2>
          </div>
          <MemberForm onSave={addOrUpdateMember} editingMember={editingMember} setEditingMember={setEditingMember} centers={config.allCenters} />
        </div>

        <div className={`bg-white p-1 md:p-2 rounded-2xl shadow-sm border border-slate-200 print:border-none print:shadow-none print:p-0 ${activeTab === 'table' ? 'block' : 'hidden md:block'}`}>
          <div className="no-print hidden md:flex items-center gap-2 mb-2 p-2 border-b border-slate-50">
            <LayoutDashboard size={18} className="text-blue-700" />
            <h2 className="text-xs font-black text-slate-700 uppercase tracking-widest">বর্তমান নেতৃত্ববৃন্দ ({members.length})</h2>
          </div>
          <MemberTable members={members} onEdit={setEditingMember} onDelete={deleteMember} />
        </div>

        <Footer config={config} setConfig={setConfig} />
      </main>

      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex items-center justify-around no-print md:hidden z-[100] px-4">
        <button onClick={() => setActiveTab('form')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'form' ? 'text-green-700 font-black' : 'text-slate-400'}`}>
          <UserPlus size={22} />
          <span className="text-[10px]">তথ্য ফরম</span>
        </button>
        <button onClick={() => setActiveTab('table')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'table' ? 'text-green-700 font-black' : 'text-slate-400'}`}>
          <div className="relative">
            <LayoutDashboard size={22} />
            {members.length > 0 && <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[8px] rounded-full w-4 h-4 flex items-center justify-center font-black">{members.length}</span>}
          </div>
          <span className="text-[10px]">তালিকা দেখুন</span>
        </button>
        <button onClick={() => alert('অ্যাপ ভার্সন: ৪.০ (প্রো)')} className="flex flex-col items-center gap-1 text-slate-400">
          <Info size={22} />
          <span className="text-[10px]">ইনফো</span>
        </button>
      </div>
    </div>
  );
};

export default App;
