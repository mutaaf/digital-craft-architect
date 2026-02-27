
import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <a href="#" className="text-xl font-semibold text-gray-900 dark:text-white">
          Digital<span className="text-skyblue">Craft</span>
        </a>
        
        <nav className="hidden md:flex space-x-8">
          <a href="#services" className="text-gray-700 hover:text-skyblue dark:text-gray-300 dark:hover:text-skyblue transition-colors">Services</a>
          <a href="#pricing" className="text-gray-700 hover:text-skyblue dark:text-gray-300 dark:hover:text-skyblue transition-colors">Pricing</a>
          <a href="#about" className="text-gray-700 hover:text-skyblue dark:text-gray-300 dark:hover:text-skyblue transition-colors">About</a>
          <a href="#case-studies" className="text-gray-700 hover:text-skyblue dark:text-gray-300 dark:hover:text-skyblue transition-colors">Case Studies</a>
          <a 
            href="#contact" 
            className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-md transition-colors"
            onClick={(e) => {
              e.preventDefault();
              scrollToContact();
            }}
          >
            Contact
          </a>
        </nav>
        
        <div className="md:hidden flex items-center">
          <button 
            onClick={scrollToContact}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md transition-colors mr-3"
          >
            Contact
          </button>
          <button onClick={toggleMenu}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-300 overflow-hidden ${
        isMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="container mx-auto px-4 py-4 bg-white dark:bg-gray-900 flex flex-col space-y-4">
          <a href="#services" className="text-gray-700 hover:text-skyblue dark:text-gray-300 dark:hover:text-skyblue transition-colors" onClick={toggleMenu}>Services</a>
          <a href="#pricing" className="text-gray-700 hover:text-skyblue dark:text-gray-300 dark:hover:text-skyblue transition-colors" onClick={toggleMenu}>Pricing</a>
          <a href="#about" className="text-gray-700 hover:text-skyblue dark:text-gray-300 dark:hover:text-skyblue transition-colors" onClick={toggleMenu}>About</a>
          <a href="#case-studies" className="text-gray-700 hover:text-skyblue dark:text-gray-300 dark:hover:text-skyblue transition-colors" onClick={toggleMenu}>Case Studies</a>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
