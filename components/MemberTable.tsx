
import React from 'react';
import { Member } from '../types';
import { Edit2, Trash2 } from 'lucide-react';

interface MemberTableProps {
  members: Member[];
  onEdit: (member: Member) => void;
  onDelete: (id: string) => void;
}

export const MemberTable: React.FC<MemberTableProps> = ({ members, onEdit, onDelete }) => {
  return (
    <div className="w-full mt-1 overflow-x-auto custom-scrollbar">
      <table className="w-full border-collapse border-[1.2px] border-black text-black">
        <thead className="bg-gray-50 print:bg-white">
          <tr className="h-6">
            <th className="border border-black px-1 text-center w-8 text-[11px] font-black">ক্রমিক</th>
            <th className="border border-black px-1 text-center w-10 text-[11px] font-black">ছবি</th>
            <th className="border border-black px-1 text-left text-[11px] font-black">নাম ও মোবাইল</th>
            <th className="border border-black px-1 text-left text-[11px] font-black">গ্রাম</th>
            <th className="border border-black px-1 text-center text-[11px] font-black w-10">দূরত্ব</th>
            <th className="border border-black px-1 text-center text-[11px] font-black w-10">সংগঠন</th>
            <th className="border border-black px-1 text-left text-[11px] font-black">সংগঠন ও পদ</th>
            <th className="border border-black px-1 text-left text-[11px] font-black">ভোট কেন্দ্র</th>
            <th className="border border-black px-1 text-left text-[11px] font-black max-w-[100px]">মন্তব্য</th>
            <th className="border border-black px-1 text-center w-20 text-[11px] font-black">স্বাক্ষর</th>
            <th className="border border-black px-1 text-center w-14 no-print text-[11px] font-black">অ্যাকশন</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {members.length > 0 ? members.map((member) => (
            <tr key={member.id} className="h-9 hover:bg-blue-50/30 print:hover:bg-transparent">
              <td className="border border-black px-1 text-center text-[12px] font-bold">{member.serial}</td>
              <td className="border border-black p-0.5 text-center">
                <img src={member.photo_url} alt={member.name} className="stamp-photo mx-auto" />
              </td>
              <td className="border border-black px-1 leading-[1.1]">
                <div className="font-extrabold text-[12px]">{member.name}</div>
                <div className="text-[10px] font-mono font-bold text-gray-700">{member.mobile}</div>
              </td>
              <td className="border border-black px-1 text-[11px] font-bold whitespace-nowrap">{member.village}</td>
              <td className="border border-black px-1 text-center text-[11px] font-black">{member.distance}</td>
              <td className="border border-black px-1 text-center">
                <span className={`text-[10px] font-black px-0.5 ${member.org_yes_no === 'হ্যাঁ' ? 'text-green-700' : 'text-red-700'}`}>
                  {member.org_yes_no}
                </span>
              </td>
              <td className="border border-black px-1 leading-none">
                <div className="font-bold text-[10px]">{member.org_name}</div>
                <div className="text-[9px] font-black text-gray-500">{member.position}</div>
              </td>
              <td className="border border-black px-1 text-[11px] font-bold">{member.vote_center}</td>
              <td className="border border-black px-1 text-[10px] leading-tight max-w-[100px] truncate">{member.remarks}</td>
              <td className="border border-black px-1"></td>
              <td className="border border-black px-1 text-center no-print">
                <div className="flex justify-center gap-0.5">
                  <button onClick={() => onEdit(member)} className="p-0.5 text-blue-700 hover:bg-blue-100 rounded">
                    <Edit2 size={12} />
                  </button>
                  <button onClick={() => onDelete(member.id)} className="p-0.5 text-red-700 hover:bg-red-100 rounded">
                    <Trash2 size={12} />
                  </button>
                </div>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={11} className="border border-black p-8 text-center text-gray-300 font-bold italic text-sm">
                কোনো তথ্য খুঁজে পাওয়া যায়নি।
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="mt-1 text-right text-[9px] font-bold text-gray-400 no-print">
        * প্রিন্ট করার সময় অবশ্যই "Landscape" মোড সিলেক্ট করুন
      </div>
    </div>
  );
};
