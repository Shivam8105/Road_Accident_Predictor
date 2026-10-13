import type { InputHTMLAttributes } from 'react';

interface RangeSliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'min' | 'max' | 'value'> {
  min: number;
  max: number;
  value: number;
}

export function RangeSlider({ min, max, value, disabled, ...inputProps }: RangeSliderProps) {
  const percent = max === min ? 0 : Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div className={`w-full ${disabled ? 'opacity-[0.55]' : ''}`}>
      <div className="relative flex h-8 items-center">
        <div className="pointer-events-none absolute inset-x-2 h-0.5 overflow-hidden bg-slate-300" aria-hidden="true">
          <span className="block h-full bg-brand" style={{ width: `${percent}%` }} />
        </div>
        <input
          {...inputProps}
          className="relative z-10 h-8 w-full cursor-pointer appearance-none bg-transparent focus-visible:outline-none disabled:cursor-not-allowed [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-brand [&::-moz-range-thumb]:bg-surface [&::-moz-range-thumb]:transition-colors [&::-moz-range-track]:h-0.5 [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:h-0.5 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:mt-[-7px] [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-brand [&::-webkit-slider-thumb]:bg-surface [&::-webkit-slider-thumb]:transition-colors [&:active::-moz-range-thumb]:bg-brand [&:active::-webkit-slider-thumb]:bg-brand [&:focus-visible::-moz-range-thumb]:shadow-[0_0_0_4px_rgba(23,92,211,0.16)] [&:focus-visible::-webkit-slider-thumb]:shadow-[0_0_0_4px_rgba(23,92,211,0.16)] [&:hover::-moz-range-thumb]:bg-brand-soft [&:hover::-webkit-slider-thumb]:bg-brand-soft"
          type="range"
          min={min}
          max={max}
          value={value}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
