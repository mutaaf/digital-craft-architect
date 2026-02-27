import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { User, Home, Ruler, DollarSign, Clock, MapPin, Phone, CalendarCheck } from 'lucide-react';

export interface LeadData {
  name?: string;
  projectType?: string;
  sqft?: string;
  budget?: string;
  timeline?: string;
  address?: string;
  phone?: string;
}

interface LeadSummaryPanelProps {
  data: LeadData;
}

const fields: { key: keyof LeadData; label: string; icon: React.ReactNode }[] = [
  { key: 'name', label: 'Name', icon: <User size={14} /> },
  { key: 'projectType', label: 'Project Type', icon: <Home size={14} /> },
  { key: 'sqft', label: 'Square Footage', icon: <Ruler size={14} /> },
  { key: 'budget', label: 'Budget', icon: <DollarSign size={14} /> },
  { key: 'timeline', label: 'Timeline', icon: <Clock size={14} /> },
  { key: 'address', label: 'Address', icon: <MapPin size={14} /> },
  { key: 'phone', label: 'Phone', icon: <Phone size={14} /> },
];

const LeadSummaryPanel = ({ data }: LeadSummaryPanelProps) => {
  const filled = fields.filter((f) => data[f.key]);
  const percent = Math.round((filled.length / fields.length) * 100);
  const qualified = percent >= 70;

  return (
    <Card className="p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Lead Qualification</h3>
        <Badge variant={qualified ? 'default' : 'secondary'} className="text-xs">
          {percent}% Complete
        </Badge>
      </div>
      <Progress value={percent} className="mb-4 h-2" />

      <div className="space-y-3 flex-1">
        {fields.map((f) => (
          <div key={f.key} className="flex items-center gap-2.5">
            <div
              className={`w-7 h-7 rounded-md flex items-center justify-center ${
                data[f.key]
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-600'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
              }`}
            >
              {f.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">{f.label}</p>
              <p className="text-sm font-medium truncate">
                {data[f.key] || <span className="text-gray-300 italic text-xs">Pending...</span>}
              </p>
            </div>
          </div>
        ))}
      </div>

      <Separator className="my-4" />

      {qualified ? (
        <Button asChild className="w-full gap-2">
          <a href="https://calendly.com/mutaaf" target="_blank" rel="noopener noreferrer">
            <CalendarCheck size={16} /> Book Consultation
          </a>
        </Button>
      ) : (
        <p className="text-xs text-gray-400 text-center">
          Keep chatting to qualify this lead...
        </p>
      )}
    </Card>
  );
};

export default LeadSummaryPanel;
