
import React from 'react';
import { Member } from '../types.ts';
import { Edit2, Trash2, MapPin, Phone, User, Briefcase } from 'lucide-react';

interface MemberTableProps {
  members: Member[];
  onEdit: (member: Member) => void;
  onDelete: (id: string) => void;
}

export const MemberTable: React.FC<MemberTableProps> = ({ members, onEdit, onDelete }) => {
  if (members.length === 0) {
    return (
      <div className="p-10 text-center text-gray-400 font-bold bg-white rounded-lg border-2 border-dashed border-gray-200">
        কোনো তথ্য খুঁজে পাওয়া যায়নি।
      </div>
    );
  }

  return (
    <div className="w-full mt-2">
      {/* Mobile View: Comfortable Cards */}
      <div className="md:hidden space-y-3 no-print">
        {members.map((member) => (
          <div key={member.id} className="mobile-card border border-gray-200">
            <div className="flex gap-3">
              <img src={member.photo_url} alt={member.name} className="w-16 h-16 rounded object-cover border border-gray-300" />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-black text-sm text-green-900 leading-tight">{member.name}</h3>
                  <div className="flex gap-2">
                    <button onClick={() => onEdit(member)} className="p-1 text-blue-600 bg-blue-50 rounded"><Edit2 size={14} /></button>
                    <button onClick={() => onDelete(member.id)} className="p-1 text-red-600 bg-red-50 rounded"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600 mt-1 font-mono font-bold">
                  <Phone size={10} /> {member.mobile}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
                  <MapPin size={10} /> {member.village} ({member.distance})
                </div>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-100 grid grid-cols-2 gap-2">
              <div>
                <span className="text-[9px] font-black uppercase text-gray-400 block">পদবী ও সংগঠন</span>
                <span className="text-[10px] font-bold leading-tight line-clamp-1">{member.position || 'সাধারণ সদস্য'}</span>
                <span className="text-[9px] text-gray-500 block">{member.org_name}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-black uppercase text-gray-400 block">ভোট কেন্দ্র</span>
                <span className="text-[10px] font-bold block">{member.vote_center}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop/Print View: Slim Table */}
      <div className="hidden md:block overflow-x-auto custom-scrollbar">
        <table className="w-full border-collapse border-[1px] border-black text-black table-fixed">
          <thead className="bg-slate-100 print:bg-white">
            <tr className="h-6">
              <th className="border border-black w-7 text-[10px] font-black">#</th>
              <th className="border border-black w-9 text-[10px] font-black">ছবি</th>
              <th className="border border-black w-40 text-left px-1 text-[10px] font-black">নাম ও মোবাইল</th>
              <th className="border border-black w-24 text-left px-1 text-[10px] font-black">গ্রাম</th>
              <th className="border border-black w-12 text-center text-[10px] font-black">দূরত্ব</th>
              <th className="border border-black w-14 text-center text-[10px] font-black">সংগঠন</th>
              <th className="border border-black text-left px-1 text-[10px] font-black">সংগঠন ও পদবী</th>
              <th className="border border-black w-32 text-left px-1 text-[10px] font-black">কেন্দ্র</th>
              <th className="border border-black w-24 text-center text-[10px] font-black">স্বাক্ষর</th>
              <th className="border border-black w-14 no-print text-[10px] font-black">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {members.map((member) => (
              <tr key={member.id} className="h-9 hover:bg-slate-50 transition-colors">
                <td className="border border-black text-center text-[11px] font-bold">{member.serial}</td>
                <td className="border border-black p-0.5 text-center">
                  <img src={member.photo_url} alt={member.name} className="stamp-photo mx-auto" />
                </td>
                <td className="border border-black px-1 leading-none">
                  <div className="font-extrabold text-[11px] truncate">{member.name}</div>
                  <div className="text-[9px] font-mono font-bold text-gray-600">{member.mobile}</div>
                </td>
                <td className="border border-black px-1 text-[10px] font-bold truncate">{member.village}</td>
                <td className="border border-black text-center text-[10px] font-black">{member.distance}</td>
                <td className="border border-black text-center">
                  <span className={`text-[9px] font-black px-1 rounded ${member.org_yes_no === 'হ্যাঁ' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {member.org_yes_no}
                  </span>
                </td>
                <td className="border border-black px-1 leading-tight">
                  <div className="font-bold text-[9px] line-clamp-1">{member.org_name}</div>
                  <div className="text-[8px] font-black text-gray-500 uppercase line-clamp-1">{member.position}</div>
                </td>
                <td className="border border-black px-1 text-[10px] font-bold truncate">{member.vote_center}</td>
                <td className="border border-black px-1"></td>
                <td className="border border-black text-center no-print">
                  <div className="flex justify-center gap-1">
                    <button onClick={() => onEdit(member)} className="p-1 text-blue-700 hover:bg-blue-100 rounded transition">
                      <Edit2 size={12} />
                    </button>
                    <button onClick={() => onDelete(member.id)} className="p-1 text-red-700 hover:bg-red-100 rounded transition">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
