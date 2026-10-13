import React from 'react';

interface FigureProps {
  /** Path under /public, e.g. "/visuals/hero-dashboard.png" */
  src: string;
  alt: string;
  /** Visible fallback copy while the real visual asset is pending. */
  label?: string;
  /** Tailwind aspect ratio class, e.g. "aspect-[16/10]" */
  ratio?: string;
  className?: string;
  /** Set for above-the-fold images so they load eagerly. */
  priority?: boolean;
}

/**
 * Image slot for landing-page visuals.
 * Renders a neutral surface behind the image, so a not-yet-added asset still
 * reads as an intentional placeholder rather than a broken image.
 */
export const Figure: React.FC<FigureProps> = ({
  src,
  alt,
  label = 'Visual placeholder',
  ratio = 'aspect-[16/10]',
  className = '',
  priority = false,
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 ${ratio} ${className}`}
    >
      <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(135deg,#f8fafc_0%,#eef6ff_100%)] p-6 text-center">
        <div>
          <div className="mx-auto mb-4 h-10 w-10 rounded-xl border border-brand-100 bg-white shadow-sm" />
          <p className="text-sm font-medium text-slate-700">{label}</p>
          <p className="mt-1 text-xs text-slate-500">Add the referenced file in /public/visuals</p>
        </div>
      </div>
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        onError={(e) => {
          // Hide the broken-image glyph while the asset is still pending.
          (e.currentTarget as HTMLImageElement).style.visibility = 'hidden';
        }}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
};
