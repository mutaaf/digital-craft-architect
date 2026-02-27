import { UtensilsCrossed, Bath, Home, TreePine, Hammer } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { ProjectType } from '@/data/estimatePricing';

const iconMap: Record<string, React.ReactNode> = {
  UtensilsCrossed: <UtensilsCrossed size={28} />,
  Bath: <Bath size={28} />,
  Home: <Home size={28} />,
  TreePine: <TreePine size={28} />,
  Hammer: <Hammer size={28} />,
};

interface ProjectTypeSelectorProps {
  types: ProjectType[];
  selected: string | null;
  onSelect: (id: string) => void;
}

const ProjectTypeSelector = ({ types, selected, onSelect }: ProjectTypeSelectorProps) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
    {types.map((t) => (
      <Card
        key={t.id}
        onClick={() => onSelect(t.id)}
        className={`cursor-pointer p-5 flex flex-col items-center gap-3 text-center transition-all hover:shadow-md ${
          selected === t.id
            ? 'ring-2 ring-primary bg-primary/5 border-primary'
            : 'hover:border-gray-300 dark:hover:border-gray-600'
        }`}
      >
        <div
          className={`w-14 h-14 rounded-xl flex items-center justify-center ${
            selected === t.id
              ? 'bg-primary text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
          }`}
        >
          {iconMap[t.icon]}
        </div>
        <span className="text-sm font-medium">{t.label}</span>
        <span className="text-xs text-gray-400">
          ${t.lowPerSqft}-${t.highPerSqft}/sqft
        </span>
      </Card>
    ))}
  </div>
);

export default ProjectTypeSelector;
