import { ReactNode } from 'react';

interface PhoneMockupProps {
  children: ReactNode;
}

const PhoneMockup = ({ children }: PhoneMockupProps) => (
  <div className="mx-auto w-[300px] sm:w-[320px]">
    {/* Phone frame */}
    <div className="bg-gray-900 rounded-[40px] p-3 shadow-2xl">
      {/* Notch */}
      <div className="flex justify-center mb-2">
        <div className="w-24 h-5 bg-black rounded-full" />
      </div>
      {/* Screen */}
      <div className="bg-white dark:bg-gray-800 rounded-[28px] overflow-hidden h-[540px] flex flex-col">
        {/* Status bar */}
        <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 flex items-center justify-between text-xs text-gray-500">
          <span>9:41 AM</span>
          <span className="font-medium">Messages</span>
          <span>5G</span>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {children}
        </div>
      </div>
      {/* Home indicator */}
      <div className="flex justify-center mt-2">
        <div className="w-28 h-1 bg-gray-600 rounded-full" />
      </div>
    </div>
  </div>
);

export default PhoneMockup;
