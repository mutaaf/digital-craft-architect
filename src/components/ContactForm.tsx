
import React, { useState } from 'react';
import { FormSection } from '@/hooks/useContent';
import { CheckCircle } from 'lucide-react';

interface ContactFormProps {
  data: FormSection;
}

const ContactForm: React.FC<ContactFormProps> = ({ data }) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(data.submitUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Form submission failed');
      }

      setSubmitted(true);
      setFormData({});
    } catch (err) {
      setError('There was an error submitting the form. Please try again later.');
      console.error('Form submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputType = (field: string) => {
    if (field.toLowerCase().includes('email')) return 'email';
    if (field.toLowerCase().includes('phone')) return 'tel';
    return 'text';
  };

  return (
    <section id="contact" className="container-section">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{data.headline}</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Let me help you identify your biggest tech opportunities in just 5 minutes.
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 md:p-10 animate-slide-up">
          {submitted ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 mb-6 text-green-500">
                <CheckCircle size={64} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Your audit request has been received. I'll be in touch shortly to schedule a call.
              </p>
              <button 
                onClick={() => setSubmitted(false)}
                className="text-skyblue hover:underline"
              >
                Submit another request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                  {error}
                </div>
              )}
              
              <div className="space-y-6">
                {data.fields.map((field, index) => {
                  const fieldId = field.toLowerCase().replace(/\s+/g, '-');
                  const isTextarea = field.toLowerCase().includes('bottleneck') || 
                                     field.toLowerCase().includes('message') || 
                                     field.toLowerCase().includes('challenge');
                  
                  return (
                    <div key={index}>
                      <label 
                        htmlFor={fieldId}
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        {field}
                      </label>
                      
                      {isTextarea ? (
                        <textarea
                          id={fieldId}
                          name={fieldId}
                          rows={4}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-skyblue focus:border-transparent transition-colors"
                          placeholder={`Your ${field.toLowerCase()}`}
                          value={formData[fieldId] || ''}
                          onChange={handleChange}
                          required
                        />
                      ) : (
                        <input
                          id={fieldId}
                          name={fieldId}
                          type={getInputType(field)}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-skyblue focus:border-transparent transition-colors"
                          placeholder={`Your ${field.toLowerCase()}`}
                          value={formData[fieldId] || ''}
                          onChange={handleChange}
                          required
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-8">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary py-4 text-lg font-medium relative overflow-hidden"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    data.submitText
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
