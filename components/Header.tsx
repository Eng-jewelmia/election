
import React from 'react';
import { AppConfig } from '../types';

interface HeaderProps {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
}

export const Header: React.FC<HeaderProps> = ({ config, setConfig }) => {
  const handleConfigChange = (field: keyof AppConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const addNewCenter = () => {
    const newCenter = prompt('নতুন ভোট কেন্দ্রের নাম লিখুন:');
    if (newCenter && !config.allCenters.includes(newCenter)) {
      setConfig(prev => ({
        ...prev,
        allCenters: [...prev.allCenters, newCenter],
        selectedCenter: newCenter
      }));
    }
  };

  const wards = ['১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

  return (
    <header className="w-full flex flex-col items-center bg-white print:p-0">
      <div className="w-full flex justify-between items-center gap-2 mb-0.5">
        <div className="flex-shrink-0">
          <img 
            src="https://i.postimg.cc/mD36hN2W/combined-banner.png" 
            alt="Leaders" 
            className="h-14 md:h-20 w-auto object-contain rounded" 
          />
        </div>

        <div className="flex-1 text-center px-1">
          <h1 className="text-lg md:text-3xl font-[900] text-black leading-none mb-0.5 tracking-tighter">
            নান্দাইল উপজেলা জাতীয় নির্বাচনে
          </h1>
          <div className="w-full border-t-[2px] border-black mb-0.5"></div>
          <h2 className="text-[12px] md:text-[18px] font-extrabold text-black leading-tight">
            ভোট কেন্দ্রভিত্তিক বিএনপি ও অঙ্গ সহযোগী সংগঠনের নেতৃত্ববৃন্দের তথ্য
          </h2>
        </div>

        <div className="flex-shrink-0">
          <img 
            src="https://i.postimg.cc/4yY7DqVV/BNP-logo.png" 
            alt="BNP Logo" 
            className="h-14 md:h-20 w-auto object-contain" 
          />
        </div>
      </div>

      <div className="w-full border-[1px] border-black rounded-md px-3 py-1 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
          <div className="flex items-center gap-1">
            <span className="font-black text-xs md:text-sm whitespace-nowrap">ইউনিয়ন:</span>
            <input 
              type="text" 
              value={config.unionName}
              onChange={(e) => handleConfigChange('unionName', e.target.value)}
              className="border-b-[1px] border-dotted border-black font-bold text-xs md:text-sm focus:outline-none min-w-[120px] bg-transparent"
            />
          </div>

          <div className="flex items-center gap-1">
            <span className="font-black text-xs md:text-sm whitespace-nowrap">ওয়ার্ড:</span>
            <select 
              value={config.wardNo}
              onChange={(e) => handleConfigChange('wardNo', e.target.value)}
              className="border-b-[1px] border-dotted border-black font-bold text-xs md:text-sm focus:outline-none bg-transparent cursor-pointer"
            >
              {wards.map(w => (
                <option key={w} value={w}>{w} নং ওয়ার্ড</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="font-black text-xs md:text-sm whitespace-nowrap">কেন্দ্র:</span>
            <div className="flex items-center gap-1">
              <select 
                value={config.selectedCenter}
                onChange={(e) => handleConfigChange('selectedCenter', e.target.value)}
                className="border-b-[1px] border-dotted border-black font-bold text-xs md:text-sm focus:outline-none bg-transparent min-w-[100px]"
              >
                {config.allCenters.map(center => (
                  <option key={center} value={center}>{center}</option>
                ))}
              </select>
              <button 
                onClick={addNewCenter}
                className="no-print bg-gray-800 text-white px-1.5 py-0.5 rounded text-[9px] font-bold hover:bg-black"
              >
                + কেন্দ্র
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
