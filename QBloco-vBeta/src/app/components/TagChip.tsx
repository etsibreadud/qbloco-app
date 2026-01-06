interface TagChipProps {
  label: string;
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

export function TagChip({ label, variant = 'default' }: TagChipProps) {
  const variants = {
    default: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300',
    primary: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md',
    success: 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-md',
    warning: 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md',
  };

  return (
    <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${variants[variant]}`}>
      {label}
    </span>
  );
}