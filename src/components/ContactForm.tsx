
import React, { useState } from 'react';
import { FormSection } from '@/hooks/useContent';
import { CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

interface ContactFormProps {
  data: FormSection;
}

const ContactForm: React.FC<ContactFormProps> = ({ data }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  // Create a dynamic schema based on form fields
  const generateFormSchema = () => {
    const schemaMap: Record<string, z.ZodTypeAny> = {};
    
    data.fields.forEach(field => {
      const fieldId = field.toLowerCase().replace(/\s+/g, '-');
      
      if (field.toLowerCase().includes('email')) {
        schemaMap[fieldId] = z.string().email('Please enter a valid email address');
      } else if (field.toLowerCase().includes('phone')) {
        schemaMap[fieldId] = z.string().min(10, 'Please enter a valid phone number');
      } else if (field.toLowerCase().includes('challenge') || 
                field.toLowerCase().includes('bottleneck') || 
                field.toLowerCase().includes('message')) {
        schemaMap[fieldId] = z.string().min(5, 'Please provide some details');
      } else {
        schemaMap[fieldId] = z.string().min(2, 'This field is required');
      }
    });
    
    return z.object(schemaMap);
  };

  const formSchema = generateFormSchema();
  
  // Create the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: Object.fromEntries(
      data.fields.map(field => [field.toLowerCase().replace(/\s+/g, '-'), ''])
    ),
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      // For testing during development, log the submission
      console.log('Form submission data:', values);
      
      // Check if we have a valid URL
      if (!data.submitUrl || data.submitUrl.includes('yourFormID')) {
        throw new Error('Form submission URL is not configured correctly');
      }
      
      const response = await fetch(data.submitUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Form submission failed');
      }

      // Show success toast and set submitted state
      toast({
        title: "Success!",
        description: "Your assessment request has been received. We'll be in touch soon.",
      });
      
      setSubmitted(true);
      form.reset();
    } catch (err) {
      console.error('Form submission error:', err);
      
      // Show error toast with appropriate message
      toast({
        title: "Submission Error",
        description: err instanceof Error 
          ? err.message 
          : "There was an error submitting the form. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    form.reset();
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
            Let me help you identify your biggest AI opportunities in just 5 minutes.
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
                Your assessment request has been received. I'll be in touch shortly to schedule a call.
              </p>
              <button 
                onClick={resetForm}
                className="text-sky-500 hover:underline"
              >
                Submit another request
              </button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {data.fields.map((field, index) => {
                  const fieldId = field.toLowerCase().replace(/\s+/g, '-');
                  const isTextarea = field.toLowerCase().includes('bottleneck') || 
                                    field.toLowerCase().includes('message') || 
                                    field.toLowerCase().includes('challenge');
                  
                  return (
                    <FormField
                      key={index}
                      control={form.control}
                      name={fieldId}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {field.name === 'email' ? 'Email' : field.name
                              .split('-')
                              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(' ')}
                          </FormLabel>
                          <FormControl>
                            {isTextarea ? (
                              <Textarea
                                {...field}
                                placeholder={`Your ${field.name.replace(/-/g, ' ')}`}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors"
                                rows={4}
                              />
                            ) : (
                              <Input
                                {...field}
                                type={getInputType(field.name)}
                                placeholder={`Your ${field.name.replace(/-/g, ' ')}`}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors"
                              />
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  );
                })}
                
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
            </Form>
          )}
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
