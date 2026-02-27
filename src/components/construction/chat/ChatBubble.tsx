import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { HardHat, User } from 'lucide-react';

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

const ChatBubble = ({ role, content, isStreaming }: ChatBubbleProps) => {
  const isUser = role === 'user';

  return (
    <div className={`flex gap-2.5 animate-fade-in ${isUser ? 'flex-row-reverse' : ''}`}>
      <Avatar className="w-8 h-8 shrink-0 mt-0.5">
        <AvatarFallback
          className={isUser ? 'bg-gray-200 dark:bg-gray-700' : 'bg-primary/10 text-primary'}
        >
          {isUser ? <User size={14} /> : <HardHat size={14} />}
        </AvatarFallback>
      </Avatar>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
          isUser
            ? 'bg-primary text-white rounded-br-sm'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{content}</p>
        {isStreaming && (
          <span className="inline-block w-1.5 h-4 bg-current opacity-70 animate-pulse ml-0.5 align-middle" />
        )}
      </div>
    </div>
  );
};

export default ChatBubble;
