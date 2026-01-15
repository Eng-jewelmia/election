
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MemberForm } from './components/MemberForm';
import { MemberTable } from './components/MemberTable';
import { Footer } from './components/Footer';
import { Member, AppConfig } from './types';
import { LogIn, Database, LogOut, Printer, PlusSquare } from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('nandail_auth') === 'true';
  });

  const [password, setPassword] = useState('');
  
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('nandail_members_v2');
    return saved ? JSON.parse(saved) : [];
  });

  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem('nandail_config_v2');
    return saved ? JSON.parse(saved) : {
      unionName: '৪ নং চন্ডিপাশা',
      wardNo: '৮',
      selectedCenter: 'বাসাটি',
      allCenters: ['বাসাটি', 'লংপুর', 'বানাইল', 'ফুলবাড়িয়া', 'খামারগাঁও', 'ঘোষপালা'],
      collectorName: '',
      collectorMobile: '',
    };
  });

  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // Sync with LocalStorage permanently
  useEffect(() => {
    localStorage.setItem('nandail_members_v2', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('nandail_config_v2', JSON.stringify(config));
  }, [config]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '123456') {
      setIsAuthenticated(true);
      localStorage.setItem('nandail_auth', 'true');
    } else {
      alert('ভুল পাসওয়ার্ড!');
    }
  };

  const handleLogout = () => {
    if (confirm('লগআউট করতে চান?')) {
      setIsAuthenticated(false);
      localStorage.removeItem('nandail_auth');
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
  };

  const deleteMember = (id: string) => {
    if (confirm('ডিলিট করতে চান?')) {
      setMembers(prev => {
        const filtered = prev.filter(m => m.id !== id);
        return filtered.map((m, idx) => ({ ...m, serial: idx + 1 }));
      });
    }
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `Election_Data_${config.unionName}_Ward_${config.wardNo}`;
    window.print();
    setTimeout(() => { document.title = originalTitle; }, 500);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm border-t-4 border-green-700">
          <div className="flex justify-center mb-6">
            <img src="https://i.postimg.cc/DzC1RqRk/images.jpg" alt="Logo" className="h-16 w-auto" />
          </div>
          <h1 className="text-xl font-black text-center mb-6 text-slate-800">অ্যাডমিন প্রবেশ</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none font-bold text-center"
              placeholder="পাসওয়ার্ড লিখুন"
              autoFocus
            />
            <button type="submit" className="w-full bg-green-700 text-white py-2.5 rounded-lg hover:bg-green-800 transition flex items-center justify-center gap-2 font-black shadow-lg">
              <LogIn size={18} /> লগইন করুন
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col print:bg-white">
      {/* Slim Navbar */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b no-print py-1.5 px-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2 text-green-800 font-black">
          <Database size={20} />
          <span className="text-sm md:text-base">নান্দাইল নির্বাচনী ডাটাবেজ</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handlePrint} 
            className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition flex items-center gap-1.5 text-xs font-bold shadow-sm"
          >
            <Printer size={14} /> প্রিন্ট (PDF)
          </button>
          <button onClick={handleLogout} className="text-slate-500 hover:text-red-600 p-1 transition">
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-[1366px] mx-auto p-2 md:p-4 space-y-2 print:p-0">
        <Header config={config} setConfig={setConfig} />

        <div className="no-print bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-1.5">
            <PlusSquare size={18} className="text-green-700" />
            <h2 className="text-sm font-black text-slate-800">নতুন তথ্য সংযোজন</h2>
          </div>
          <MemberForm 
            onSave={addOrUpdateMember} 
            editingMember={editingMember} 
            setEditingMember={setEditingMember}
            centers={config.allCenters}
          />
        </div>

        <div className="bg-white p-1 rounded-md shadow-md print:shadow-none print:p-0">
          <MemberTable 
            members={members} 
            onEdit={setEditingMember} 
            onDelete={deleteMember} 
          />
        </div>

        <Footer config={config} setConfig={setConfig} />
      </main>
    </div>
  );
};

export default App;
