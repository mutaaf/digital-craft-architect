import React from 'react';
import { FooterSection } from '@/hooks/useContent';
import { Linkedin, Calendar, Github, Twitter } from 'lucide-react';

interface FooterProps {
  data: FooterSection;
}

const Footer: React.FC<FooterProps> = ({ data }) => {
  // Use the current deployment timestamp
  const buildTimestamp = new Date('2025-04-02T00:58:00Z');
  
  // Format the deployment timestamp in a human-readable format
  const formatDeployTime = () => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    
    return new Intl.DateTimeFormat('en-US', options).format(buildTimestamp);
  };

  const getSocialIcon = (key: string) => {
    switch (key.toLowerCase()) {
      case 'linkedin':
        return <Linkedin size={20} />;
      case 'calendly':
        return <Calendar size={20} />;
      case 'github':
        return <Github size={20} />;
      case 'twitter':
        return <Twitter size={20} />;
      default:
        return null;
    }
  };

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold mb-2">Digital<span className="text-skyblue">Craft</span></h2>
            <p className="text-gray-400 text-balance">{data.tagline}</p>
          </div>
          
          <div className="flex justify-center space-x-6 mb-10">
            {Object.entries(data.socialLinks).map(([key, url]) => (
              <a 
                key={key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 hover:bg-skyblue transition-colors duration-300"
                aria-label={key}
              >
                {getSocialIcon(key)}
              </a>
            ))}
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm mb-4 md:mb-0">
                &copy; {new Date().getFullYear()} DigitalCraft. All rights reserved.
              </p>
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6 items-center">
                <p className="text-gray-500 text-xs">
                  <span className="inline-block bg-gray-800 px-2 py-1 rounded">
                    Deployed: {formatDeployTime()}
                  </span>
                </p>
                <div className="flex space-x-6">
                  <a href="#" className="text-gray-400 hover:text-skyblue text-sm">Privacy Policy</a>
                  <a href="#" className="text-gray-400 hover:text-skyblue text-sm">Terms of Service</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
