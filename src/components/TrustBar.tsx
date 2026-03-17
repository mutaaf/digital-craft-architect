import React from 'react';
import { MapPin, Sparkles, Phone } from 'lucide-react';

const TrustBar: React.FC = () => (
  <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-3">
    <div className="container mx-auto px-4 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
      <span className="inline-flex items-center gap-1.5">
        <MapPin size={14} className="text-primary shrink-0" />
        Serving DFW &amp; Austin
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Sparkles size={14} className="text-primary shrink-0" />
        Free Live Demo
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Phone size={14} className="text-primary shrink-0" />
        <a href="tel:+19723523293" className="hover:text-primary transition-colors">
          (972) 352-3293
        </a>
      </span>
    </div>
  </div>
);

export default TrustBar;
