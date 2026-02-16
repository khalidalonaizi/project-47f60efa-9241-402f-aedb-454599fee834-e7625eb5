import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ProfileCompletionAlertProps {
  missingFields: string[];
  onGoToProfile: () => void;
  accountTypeLabel: string;
}

const ProfileCompletionAlert = ({ missingFields, onGoToProfile, accountTypeLabel }: ProfileCompletionAlertProps) => {
  if (missingFields.length === 0) return null;

  return (
    <Alert variant="destructive" className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-200">
      <AlertTriangle className="h-5 w-5 text-yellow-600" />
      <AlertTitle className="text-yellow-800 dark:text-yellow-200">أكمل بيانات {accountTypeLabel} لتصلك الطلبات!</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-2">الحقول الناقصة: {missingFields.join('، ')}</p>
        <Button size="sm" variant="outline" className="border-yellow-600 text-yellow-800 hover:bg-yellow-100" onClick={onGoToProfile}>
          إكمال البيانات الآن
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default ProfileCompletionAlert;
