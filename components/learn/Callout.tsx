import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface CalloutProps {
  variant?: 'info' | 'warning' | 'success' | 'error';
  children: React.ReactNode;
}

export function Callout({ variant = 'info', children }: CalloutProps) {
  const styles = {
    info: {
      container: 'border-blue-200 bg-blue-50',
      icon: 'text-blue-600',
      text: 'text-blue-900',
      Icon: Info,
    },
    warning: {
      container: 'border-yellow-200 bg-yellow-50',
      icon: 'text-yellow-600',
      text: 'text-yellow-900',
      Icon: AlertTriangle,
    },
    success: {
      container: 'border-green-200 bg-green-50',
      icon: 'text-green-600',
      text: 'text-green-900',
      Icon: CheckCircle,
    },
    error: {
      container: 'border-red-200 bg-red-50',
      icon: 'text-red-600',
      text: 'text-red-900',
      Icon: AlertCircle,
    },
  };

  const style = styles[variant];
  const Icon = style.Icon;

  return (
    <div className={`my-4 rounded-lg border p-4 ${style.container}`}>
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${style.icon}`} />
        <div className={`flex-1 text-sm leading-relaxed ${style.text}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
