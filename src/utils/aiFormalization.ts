
type FormData = Record<string, string>;

interface AIConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  fallbackMessage: string;
}

export const formalizeWithAI = async (
  formData: FormData,
  config: AIConfig
): Promise<string> => {
  try {
    const { name, email, ...otherFields } = formData;

    // Get the challenge text from the other fields
    const challengeField = Object.keys(otherFields)[0];
    const challengeText = otherFields[challengeField] || '';

    if (!challengeText || challengeText.length < 10) {
      return challengeText; // Return original if too short
    }

    console.log('Formalizing input with AI...');

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: config.systemPrompt,
          },
          {
            role: 'user',
            content: `Name: ${name || 'Client'}\nEmail: ${email || 'Not provided'}\n\nBusiness Challenge: ${challengeText}`,
          },
        ],
        temperature: config.temperature,
        max_tokens: config.maxTokens,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('AI formalization error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to formalize content');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || challengeText;
  } catch (error) {
    console.error('Error in AI formalization:', error);
    return config.fallbackMessage;
  }
};
