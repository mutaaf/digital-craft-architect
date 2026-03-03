import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { User, Home, Ruler, DollarSign, Clock, MapPin, Phone, CalendarCheck, CheckCircle2 } from 'lucide-react';
import { useDemoContext } from '@/contexts/DemoContext';

export interface LeadData {
  name?: string;
  projectType?: string;
  sqft?: string;
  budget?: string;
  timeline?: string;
  address?: string;
  phone?: string;
}

export type FieldConfig = { key: keyof LeadData; label: string; icon: React.ReactNode };

interface LeadSummaryPanelProps {
  data: LeadData;
  fieldOverrides?: FieldConfig[];
}

const DEFAULT_FIELDS: FieldConfig[] = [
  { key: 'name', label: 'Name', icon: <User size={14} /> },
  { key: 'projectType', label: 'Project Type', icon: <Home size={14} /> },
  { key: 'sqft', label: 'Square Footage', icon: <Ruler size={14} /> },
  { key: 'budget', label: 'Budget', icon: <DollarSign size={14} /> },
  { key: 'timeline', label: 'Timeline', icon: <Clock size={14} /> },
  { key: 'address', label: 'Address', icon: <MapPin size={14} /> },
  { key: 'phone', label: 'Phone', icon: <Phone size={14} /> },
];

const LeadSummaryPanel = ({ data, fieldOverrides }: LeadSummaryPanelProps) => {
  const { company } = useDemoContext();
  const bookingUrl = company?.bookingUrl || 'https://calendly.com/mutaaf';

  const fields = fieldOverrides || DEFAULT_FIELDS;
  const filled = fields.filter((f) => data[f.key]);
  const percent = Math.round((filled.length / fields.length) * 100);
  const qualified = percent >= 70;

  return (
    <Card className="p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Lead Qualification</h3>
        <Badge
          variant={qualified ? 'default' : 'secondary'}
          className={`text-xs ${qualified ? 'animate-pulse' : ''}`}
        >
          {qualified && <CheckCircle2 size={10} className="mr-1" />}
          {percent}% Complete
        </Badge>
      </div>
      <Progress value={percent} className="mb-4 h-2" />

      <div className="space-y-3 flex-1">
        {fields.map((f) => {
          const hasValue = !!data[f.key];
          return (
            <div
              key={f.key}
              className={`flex items-center gap-2.5 transition-all duration-300 ${
                hasValue ? 'opacity-100' : 'opacity-60'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
                  hasValue
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-600'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                }`}
              >
                {f.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">{f.label}</p>
                {hasValue ? (
                  <p className="text-sm font-medium truncate animate-fade-in">{data[f.key]}</p>
                ) : (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-gray-600 animate-pulse" />
                    <span className="text-gray-300 dark:text-gray-600 text-xs">Waiting...</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Separator className="my-4" />

      {qualified ? (
        <div className="space-y-3 animate-fade-in">
          <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-3 text-center">
            <p className="text-xs font-medium text-green-700 dark:text-green-400">
              Lead qualified! Ready to book.
            </p>
          </div>
          {bookingUrl && (
            <Button asChild className="w-full gap-2">
              <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
                <CalendarCheck size={16} /> Book Consultation
              </a>
            </Button>
          )}
        </div>
      ) : (
        <p className="text-xs text-gray-400 text-center">
          {percent === 0
            ? 'Start chatting to qualify this lead...'
            : `${fields.length - filled.length} more fields to qualify`}
        </p>
      )}
    </Card>
  );
};

export default LeadSummaryPanel;
