
import React, { useState } from 'react';
import { FooterSection } from '@/hooks/useContent';
import { Linkedin, Calendar, Github, Twitter, Phone, Send } from 'lucide-react';
import { trackCTAClick } from '@/utils/analytics';

interface FooterProps {
  data: FooterSection;
}

const FooterNewsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('submitting');
    trackCTAClick('newsletter_subscribe', 'footer');
    try {
      const res = await fetch('https://formspree.io/f/xovekqqk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, _subject: '[Newsletter] New subscriber' }),
      });
      setStatus(res.ok ? 'success' : 'error');
      if (res.ok) setEmail('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="border-t border-gray-800 pt-8 pb-8">
      {status === 'success' ? (
        <p className="text-center text-green-400 text-sm">Thanks for subscribing! We'll be in touch.</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <p className="text-gray-300 text-sm whitespace-nowrap">Get AI insights delivered to your inbox</p>
          <div className="flex w-full sm:w-auto gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 sm:w-64 px-3 py-2 rounded-md bg-gray-800 dark:bg-gray-800 border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-skyblue focus:border-transparent"
            />
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-skyblue hover:bg-skyblue/90 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Send size={14} />
              Subscribe
            </button>
          </div>
          {status === 'error' && (
            <p className="text-red-400 text-xs">Something went wrong. Please try again.</p>
          )}
        </form>
      )}
    </div>
  );
};

const Footer: React.FC<FooterProps> = ({ data }) => {
  // Get the actual build timestamp (when the app was compiled)
  // This will be replaced with the actual time during the build process
  const buildTimestamp = new Date(import.meta.env.VITE_BUILD_TIME || new Date().toISOString());
  
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
          
          <div className="flex justify-center items-center gap-2 mb-6">
            <Phone size={16} className="text-gray-400" />
            <a href="tel:+19723523293" className="text-gray-400 hover:text-skyblue transition-colors">
              (972) 352-3293
            </a>
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
          
          <FooterNewsletter />

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
