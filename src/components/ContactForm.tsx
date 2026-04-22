
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FormSection } from '@/hooks/useContent';
import { CheckCircle, Wand2, Calendar, Play, Phone } from 'lucide-react';
import { trackFormSubmission, trackCTAClick } from '@/utils/analytics';
import { getUtmParams } from '@/utils/utmTracker';
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
import { Button } from '@/components/ui/button';
import { formalizeWithAI } from '@/utils/aiFormalization';

interface ContactFormProps {
  data: FormSection;
}

const ContactForm: React.FC<ContactFormProps> = ({ data }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState(0);
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
                field.toLowerCase().includes('business') || 
                field.toLowerCase().includes('solving') ||
                field.toLowerCase().includes('looking') ||
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

  const handleFormalizeWithAI = async () => {
    try {
      // Check if we have the challenge field filled out
      const formData = form.getValues();
      const challengeFieldId = data.fields[2].toLowerCase().replace(/\s+/g, '-');
      
      if (!formData[challengeFieldId] || formData[challengeFieldId].length < 10) {
        toast({
          title: "Not enough content",
          description: "Please provide more details about your business challenges for AI to formalize.",
          variant: "destructive",
        });
        return;
      }

      setIsFormatting(true);
      
      // Get the API configuration from the JSON
      const apiConfig = data.aiFormalization?.apiConfig;
      
      if (!apiConfig) {
        throw new Error("AI formalization configuration not found");
      }
      
      // Call the AI service to formalize the text
      const formalizedText = await formalizeWithAI(formData, apiConfig);
      
      // Update the form with the formalized text
      form.setValue(challengeFieldId, formalizedText);
      
      toast({
        title: "Text Formalized",
        description: "Your input has been professionally formatted.",
      });
    } catch (error) {
      console.error('Error formalizing with AI:', error);
      toast({
        title: "Formalization Failed",
        description: "Unable to formalize your text. Your original input is preserved.",
        variant: "destructive",
      });
    } finally {
      setIsFormatting(false);
    }
  };

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
        body: JSON.stringify({ ...values, ...getUtmParams() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Form submission failed');
      }

      trackFormSubmission('contact_form');

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
    setStep(0);
    form.reset();
  };

  const getInputType = (field: string) => {
    if (field.toLowerCase().includes('email')) return 'email';
    if (field.toLowerCase().includes('phone')) return 'tel';
    return 'text';
  };

  const isChallengeField = (field: string) => {
    return field.toLowerCase().includes('challenge') ||
           field.toLowerCase().includes('business') ||
           field.toLowerCase().includes('solving') ||
           field.toLowerCase().includes('looking');
  };

  const fieldSteps: string[][] = (() => {
    const f = data.fields;
    if (f.length <= 2) return [f];
    if (f.length <= 3) return [f.slice(0, 1), f.slice(1, 2), f.slice(2)];
    const mid = Math.ceil((f.length - 1) / 2);
    return [f.slice(0, mid), f.slice(mid, f.length - 1), f.slice(f.length - 1)];
  })();

  const totalSteps = fieldSteps.length;
  const isMultiStep = totalSteps > 1;

  const canAdvance = () => {
    const currentFields = fieldSteps[step];
    return currentFields.every((field) => {
      const fieldId = field.toLowerCase().replace(/\s+/g, '-');
      const val = form.getValues(fieldId);
      return val && val.length >= 2;
    });
  };

  const handleNext = async () => {
    const currentFieldIds = fieldSteps[step].map((f) =>
      f.toLowerCase().replace(/\s+/g, '-')
    );
    const valid = await form.trigger(currentFieldIds as Parameters<typeof form.trigger>[0]);
    if (valid) {
      trackCTAClick(`form_step_${step + 1}`, 'contact_form');
      setStep((s) => Math.min(s + 1, totalSteps - 1));
    }
  };

  const stepLabels = ['Your Info', 'Your Business', 'Your Challenge'];

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
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Your assessment request has been received. I'll be in touch shortly to schedule a call.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                <a
                  href="https://calendly.com/mutaaf"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackCTAClick('book_discovery_call', 'form_success')}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium transition-colors"
                >
                  <Calendar size={18} />
                  Book Your Discovery Call Now
                </a>
                <Link
                  to="/construction/demo"
                  onClick={() => trackCTAClick('explore_demos', 'form_success')}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-sky-500 text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-lg font-medium transition-colors"
                >
                  <Play size={18} />
                  Explore Our AI Demos
                </Link>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Join 50+ businesses we've helped automate
              </p>

              <button
                onClick={resetForm}
                className="text-sky-500 hover:underline text-sm"
              >
                Submit another request
              </button>
            </div>
          ) : (
            <Form {...form}>
              {isMultiStep && (
                <div className="mb-8">
                  <div className="flex justify-between mb-2">
                    {stepLabels.slice(0, totalSteps).map((label, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => i < step && setStep(i)}
                        className={`text-xs font-medium transition-colors ${
                          i <= step
                            ? 'text-primary'
                            : 'text-gray-400 dark:text-gray-500'
                        } ${i < step ? 'cursor-pointer hover:underline' : 'cursor-default'}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
                    />
                  </div>
                </div>
              )}
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {data.fields.map((field, index) => {
                  const fieldStep = fieldSteps.findIndex((group) => group.includes(field));
                  if (isMultiStep && fieldStep !== step) return null;
                  const fieldId = field.toLowerCase().replace(/\s+/g, '-');
                  const isTextarea = isChallengeField(field) || 
                                    field.toLowerCase().includes('message');
                  
                  return (
                    <FormField
                      key={index}
                      control={form.control}
                      name={fieldId}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {field.name
                              .split('-')
                              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(' ')}
                          </FormLabel>
                          <div className={`${isTextarea && data.aiFormalization?.enabled ? 'space-y-2' : ''}`}>
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
                            
                            {isTextarea && data.aiFormalization?.enabled && (
                              <div className="flex justify-end">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={handleFormalizeWithAI}
                                  disabled={isFormatting || !field.value || field.value.length < 10}
                                  className="text-xs flex items-center gap-1"
                                >
                                  {isFormatting ? (
                                    <>
                                      <svg className="animate-spin h-4 w-4 text-sky-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      Formatting...
                                    </>
                                  ) : (
                                    <>
                                      <Wand2 className="h-3 w-3" />
                                      {data.aiFormalization?.buttonText || "Formalize with AI"}
                                    </>
                                  )}
                                </Button>
                              </div>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  );
                })}
                
                <div className="mt-8 flex gap-3">
                  {isMultiStep && step > 0 && (
                    <button
                      type="button"
                      onClick={() => setStep((s) => s - 1)}
                      className="px-6 py-4 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Back
                    </button>
                  )}
                  {isMultiStep && step < totalSteps - 1 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="flex-1 btn-primary py-4 text-lg font-medium"
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 btn-primary py-4 text-lg font-medium relative overflow-hidden"
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
                  )}
                </div>
                
                {import.meta.env.VITE_OPENAI_API_KEY ? null : (
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md text-sm text-amber-700 dark:text-amber-300">
                    <p className="font-medium">OpenAI API Key Required</p>
                    <p className="mt-1">To enable the "Formalize with AI" feature, add your OpenAI API key as an environment variable named <code className="bg-amber-100 dark:bg-amber-800/30 px-1 py-0.5 rounded">VITE_OPENAI_API_KEY</code>.</p>
                  </div>
                )}
              </form>
            </Form>
          )}
        </div>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4 flex items-center justify-center gap-1.5">
          <Phone size={14} />
          Prefer to talk? Call us at{' '}
          <a href="tel:+19723523293" className="text-primary hover:underline font-medium">(972) 352-3293</a>
        </p>
      </div>
    </section>
  );
};

export default ContactForm;
