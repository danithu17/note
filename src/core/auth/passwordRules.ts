export interface PasswordRule {
  id: string;
  label: string;
  passed: boolean;
}

export interface PasswordValidationResult {
  score: number; // 0 to 4
  label: 'Too Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong';
  colorClass: string;
  barWidth: string;
  rules: PasswordRule[];
  isValid: boolean;
}

export function validatePassword(password: string): PasswordValidationResult {
  const minLength = password.length >= 8;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  const rules: PasswordRule[] = [
    { id: 'length', label: 'At least 8 characters', passed: minLength },
    { id: 'cases', label: 'Upper and lowercase letters', passed: hasLower && hasUpper },
    { id: 'digit', label: 'At least one number (0-9)', passed: hasDigit },
    { id: 'special', label: 'At least one special character (!@#$%^&*)', passed: hasSpecial },
  ];

  const passedCount = rules.filter((r) => r.passed).length;

  let score = 0;
  if (password.length > 0) {
    if (password.length < 8) {
      score = 1;
    } else {
      score = passedCount;
    }
  }

  let label: PasswordValidationResult['label'] = 'Too Weak';
  let colorClass = 'bg-rose-500';
  let barWidth = '10%';

  switch (score) {
    case 0:
      label = 'Too Weak';
      colorClass = 'bg-slate-300 dark:bg-slate-700';
      barWidth = '0%';
      break;
    case 1:
      label = 'Weak';
      colorClass = 'bg-rose-500';
      barWidth = '25%';
      break;
    case 2:
      label = 'Fair';
      colorClass = 'bg-amber-500';
      barWidth = '50%';
      break;
    case 3:
      label = 'Good';
      colorClass = 'bg-blue-500';
      barWidth = '75%';
      break;
    case 4:
      label = 'Strong';
      colorClass = 'bg-emerald-500';
      barWidth = '100%';
      break;
  }

  // Mandatory standard: length >= 8, lower + upper, digit
  const isValid = minLength && hasLower && hasUpper && hasDigit;

  return {
    score,
    label,
    colorClass,
    barWidth,
    rules,
    isValid,
  };
}
