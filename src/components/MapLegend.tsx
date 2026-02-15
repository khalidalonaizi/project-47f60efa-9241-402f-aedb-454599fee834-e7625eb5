interface LegendItem {
  color: string;
  label: string;
}

interface MapLegendProps {
  items?: LegendItem[];
  className?: string;
}

const defaultItems: LegendItem[] = [
  { color: '#22c55e', label: 'عقارات للبيع' },
  { color: '#3b82f6', label: 'عقارات للإيجار' },
  { color: '#ef4444', label: 'جهات تمويلية' },
  { color: '#eab308', label: 'مقيمون عقاريون' },
  { color: '#c0c0c0', label: 'مكاتب عقارية' },
  { color: '#8b5cf6', label: 'مشاريع تطوير' },
];

const MapLegend = ({ items = defaultItems, className = '' }: MapLegendProps) => {
  return (
    <div className={`bg-card/95 backdrop-blur-sm rounded-lg shadow-lg p-3 ${className}`}>
      <p className="text-xs font-bold mb-2">دليل الألوان</p>
      <div className="space-y-1">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <div
              className="w-3 h-3 rounded-full shrink-0 border border-white shadow-sm"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapLegend;
