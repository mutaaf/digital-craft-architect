
import React from 'react';
import { FooterSection } from '@/hooks/useContent';
import { Linkedin, Calendar, Github, Twitter } from 'lucide-react';

interface FooterProps {
  data: FooterSection;
}

const Footer: React.FC<FooterProps> = ({ data }) => {
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
              <div className="flex space-x-6">
                <a href="#" className="text-gray-400 hover:text-skyblue text-sm">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-skyblue text-sm">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
