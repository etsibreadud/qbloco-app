import { Star } from 'lucide-react';

interface RatingBarProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
}

export function RatingBar({ value, onChange, max = 5 }: RatingBarProps) {
  return (
    <div className="flex gap-2">
      {Array.from({ length: max + 1 }, (_, i) => i).map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => onChange(rating)}
          className={`flex items-center justify-center w-12 h-12 rounded-lg border-2 transition-all ${
            value === rating
              ? 'border-yellow-500 bg-yellow-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <span className="text-base font-semibold">{rating}</span>
        </button>
      ))}
    </div>
  );
}

interface RatingDisplayProps {
  rating: number;
  count?: number;
  showStars?: boolean;
}

export function RatingDisplay({ rating, count, showStars = true }: RatingDisplayProps) {
  return (
    <div className="flex items-center gap-2">
      {showStars && (
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < Math.floor(rating)
                  ? 'fill-yellow-500 text-yellow-500'
                  : 'fill-gray-200 text-gray-200'
              }`}
            />
          ))}
        </div>
      )}
      <span className="text-base font-semibold">{rating.toFixed(1)}</span>
      {count !== undefined && (
        <span className="text-sm text-gray-600">({count})</span>
      )}
    </div>
  );
}
