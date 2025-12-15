import { useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

const MAX_COMPARE = 4;

export function usePropertyComparison() {
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);

  const toggleProperty = useCallback((propertyId: string) => {
    setSelectedProperties(prev => {
      if (prev.includes(propertyId)) {
        return prev.filter(id => id !== propertyId);
      }
      if (prev.length >= MAX_COMPARE) {
        toast({
          title: "الحد الأقصى للمقارنة",
          description: `يمكنك مقارنة ${MAX_COMPARE} عقارات كحد أقصى`,
          variant: "destructive",
        });
        return prev;
      }
      toast({
        title: "تمت الإضافة للمقارنة",
        description: "يمكنك إضافة المزيد من العقارات للمقارنة",
      });
      return [...prev, propertyId];
    });
  }, []);

  const removeProperty = useCallback((propertyId: string) => {
    setSelectedProperties(prev => prev.filter(id => id !== propertyId));
  }, []);

  const clearAll = useCallback(() => {
    setSelectedProperties([]);
  }, []);

  const isSelected = useCallback((propertyId: string) => {
    return selectedProperties.includes(propertyId);
  }, [selectedProperties]);

  return {
    selectedProperties,
    toggleProperty,
    removeProperty,
    clearAll,
    isSelected,
  };
}
