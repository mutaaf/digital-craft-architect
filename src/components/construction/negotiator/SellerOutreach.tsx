import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Check, MessageSquare, Mail, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import type { SellerMessage } from '@/data/propertyNegotiation';

interface SellerOutreachProps {
  messages: SellerMessage[];
}

const TYPE_LABELS: Record<string, string> = {
  initial: 'Initial Contact',
  follow_up: 'Follow Up',
  counter_offer: 'Counter Offer',
};

const TYPE_COLORS: Record<string, string> = {
  initial: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  follow_up: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
  counter_offer: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
};

function MessageCard({ message }: { message: SellerMessage }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = message.format === 'email'
      ? `Subject: ${message.subject}\n\n${message.body}`
      : message.body;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpen = () => {
    if (message.format === 'email') {
      window.open(
        `mailto:?subject=${encodeURIComponent(message.subject || '')}&body=${encodeURIComponent(message.body)}`
      );
    } else {
      window.open(`sms:?&body=${encodeURIComponent(message.body)}`);
    }
  };

  const isSms = message.format === 'sms';

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2 flex-wrap">
        <Badge className={TYPE_COLORS[message.type] + ' text-xs'}>
          {TYPE_LABELS[message.type]}
        </Badge>
        <Badge variant="outline" className="gap-1 text-xs">
          {isSms ? <MessageSquare size={10} /> : <Mail size={10} />}
          {isSms ? 'SMS' : 'Email'}
        </Badge>
        <Badge variant="secondary" className="text-xs capitalize">
          {message.tone}
        </Badge>
      </div>

      <div className="p-4 flex-1">
        {!isSms && message.subject && (
          <p className="text-xs font-semibold text-gray-500 mb-2">
            Subject: {message.subject}
          </p>
        )}
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.body}</p>
      </div>

      <div className="p-3 border-t border-gray-200 dark:border-gray-800 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5 text-xs"
          onClick={handleCopy}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied!' : 'Copy Message'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5 text-xs"
          onClick={handleOpen}
        >
          <ExternalLink size={12} />
          {isSms ? 'Open in Messages' : 'Open in Email'}
        </Button>
      </div>
    </Card>
  );
}

const SellerOutreach = ({ messages }: SellerOutreachProps) => {
  // Group by type
  const types: SellerMessage['type'][] = ['initial', 'follow_up', 'counter_offer'];

  return (
    <div className="space-y-6 animate-fade-in">
      {types.map((type) => {
        const group = messages.filter((m) => m.type === type);
        if (group.length === 0) return null;

        return (
          <div key={type}>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              {TYPE_LABELS[type]}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {group.map((msg, i) => (
                <MessageCard key={`${type}-${i}`} message={msg} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SellerOutreach;
