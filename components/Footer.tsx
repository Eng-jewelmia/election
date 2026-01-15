
import React from 'react';
import { AppConfig } from '../types';

interface FooterProps {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
}

export const Footer: React.FC<FooterProps> = ({ config, setConfig }) => {
  return (
    <div className="mt-8 flex flex-col md:flex-row justify-between items-end gap-6 text-black">
      <div className="flex flex-col gap-2 min-w-[260px]">
        <div className="flex items-center gap-2 no-print">
          <label className="text-xs font-bold whitespace-nowrap">সংগ্রহকারী:</label>
          <input 
            type="text" 
            placeholder="নাম লিখুন"
            value={config.collectorName}
            onChange={(e) => setConfig(prev => ({ ...prev, collectorName: e.target.value }))}
            className="border-b-[1px] border-gray-400 text-xs font-bold focus:outline-none flex-1 py-0.5"
          />
        </div>
        <div className="flex items-center gap-2 no-print">
          <label className="text-xs font-bold whitespace-nowrap">মোবাইল:</label>
          <input 
            type="text" 
            placeholder="নম্বর লিখুন"
            value={config.collectorMobile}
            onChange={(e) => setConfig(prev => ({ ...prev, collectorMobile: e.target.value }))}
            className="border-b-[1px] border-gray-400 text-xs font-bold focus:outline-none flex-1 py-0.5"
          />
        </div>

        {/* Print view signature lines */}
        <div className="hidden print:block mt-4 space-y-4">
          <div className="border-t-[1.5px] border-black w-48 pt-1 text-center font-black text-sm">
            তথ্য সংগ্রহকারীর স্বাক্ষর
          </div>
          <p className="text-[11px] font-bold">নাম: {config.collectorName || '................................'}</p>
          <p className="text-[11px] font-bold">মোবাইল: {config.collectorMobile || '................................'}</p>
        </div>
      </div>

      <div className="text-right flex flex-col items-end">
        <div className="hidden print:block border-t-[1.5px] border-black w-48 mb-10 pt-1 text-center font-black text-sm">
          অনুমোদনকারীর স্বাক্ষর
        </div>
        <div className="text-black font-bold text-[10px] no-print bg-gray-100 px-3 py-0.5 rounded border border-gray-300">
          Powered by <span className="font-extrabold text-green-800">Nandail Election System</span>
        </div>
      </div>
    </div>
  );
};
