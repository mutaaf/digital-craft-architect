import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { SendHorizonal, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  companyName?: string;
}

const ChatInput = ({ onSend, disabled, placeholder = 'Type a message...', companyName }: ChatInputProps) => {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const disabledPlaceholder = companyName
    ? `${companyName} AI is responding...`
    : '448 AI is responding...';

  return (
    <div className="flex items-end gap-2 p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={disabled ? disabledPlaceholder : placeholder}
        disabled={disabled}
        rows={1}
        className="flex-1 resize-none bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 placeholder:text-gray-400"
      />
      <Button
        size="icon"
        onClick={handleSubmit}
        disabled={disabled || !value.trim()}
        className="shrink-0 rounded-xl h-10 w-10"
      >
        {disabled ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <SendHorizonal size={18} />
        )}
      </Button>
    </div>
  );
};

export default ChatInput;
