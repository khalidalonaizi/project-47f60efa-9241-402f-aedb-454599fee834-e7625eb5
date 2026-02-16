import { useMemo } from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const requirements = useMemo(() => [
    { label: '8 أحرف على الأقل', met: password.length >= 8 },
    { label: 'حرف كبير واحد على الأقل (A-Z)', met: /[A-Z]/.test(password) },
    { label: 'حرف صغير واحد على الأقل (a-z)', met: /[a-z]/.test(password) },
    { label: 'رقم واحد على الأقل (0-9)', met: /[0-9]/.test(password) },
    { label: 'رمز خاص واحد على الأقل (!@#$%)', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ], [password]);

  const strength = useMemo(() => {
    const metCount = requirements.filter(r => r.met).length;
    if (metCount === 0) return { level: 0, label: '', color: '' };
    if (metCount <= 2) return { level: 1, label: 'ضعيفة', color: 'bg-destructive' };
    if (metCount <= 3) return { level: 2, label: 'متوسطة', color: 'bg-amber-500' };
    if (metCount <= 4) return { level: 3, label: 'جيدة', color: 'bg-primary' };
    return { level: 4, label: 'قوية جداً', color: 'bg-green-500' };
  }, [requirements]);

  if (!password) return null;

  return (
    <div className="space-y-3 mt-2 p-3 bg-muted/50 rounded-lg">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">قوة كلمة المرور</span>
          <span className={`font-medium ${
            strength.level <= 1 ? 'text-destructive' : 
            strength.level === 2 ? 'text-amber-500' : 
            strength.level === 3 ? 'text-primary' : 'text-green-500'
          }`}>
            {strength.label}
          </span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                level <= strength.level ? strength.color : 'bg-border'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Requirements */}
      <div className="space-y-1.5">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            {req.met ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span className={req.met ? 'text-foreground' : 'text-muted-foreground'}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;