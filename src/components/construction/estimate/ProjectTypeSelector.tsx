import { UtensilsCrossed, Bath, Home, TreePine, Hammer } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { ProjectType } from '@/data/estimatePricing';

const iconMap: Record<string, React.ReactNode> = {
  UtensilsCrossed: <UtensilsCrossed size={24} />,
  Bath: <Bath size={24} />,
  Home: <Home size={24} />,
  TreePine: <TreePine size={24} />,
  Hammer: <Hammer size={24} />,
};

interface ProjectTypeSelectorProps {
  types: ProjectType[];
  selected: string | null;
  onSelect: (id: string) => void;
}

const ProjectTypeSelector = ({ types, selected, onSelect }: ProjectTypeSelectorProps) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
    {types.map((t, i) => (
      <Card
        key={t.id}
        onClick={() => onSelect(t.id)}
        className={`cursor-pointer p-4 sm:p-5 flex flex-col items-center gap-2.5 sm:gap-3 text-center transition-all hover:shadow-md animate-fade-in ${
          selected === t.id
            ? 'ring-2 ring-primary bg-primary/5 border-primary shadow-md'
            : 'hover:border-gray-300 dark:hover:border-gray-600'
        }`}
        style={{ animationDelay: `${i * 75}ms`, animationFillMode: 'both' }}
      >
        <div
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center transition-colors ${
            selected === t.id
              ? 'bg-primary text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-primary/50'
          }`}
        >
          {iconMap[t.icon]}
        </div>
        <span className="text-xs sm:text-sm font-medium leading-tight">{t.label}</span>
        <span className="text-[10px] sm:text-xs text-gray-400">
          ${t.lowPerSqft}–${t.highPerSqft}/sqft
        </span>
      </Card>
    ))}
  </div>
);

export default ProjectTypeSelector;
