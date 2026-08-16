'use client';

import Image from 'next/image';
import { ReactNode } from 'react';

interface ImageCardProps {
  src: string;
  alt: string;
  title: string;
  description: string;
  overlay?: 'light' | 'dark' | 'medium'; // dark overlay intensity
  height?: number;
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * Reusable image card with dark overlay for text readability
 * Shows real agricultural/logistics images with text overlay
 */
export function ImageCard({
  src,
  alt,
  title,
  description,
  overlay = 'dark',
  height = 320,
  children,
  className = '',
  onClick,
}: ImageCardProps) {
  const overlayClasses = {
    light: 'bg-black/20 group-hover:bg-black/30',
    medium: 'bg-black/40 group-hover:bg-black/50',
    dark: 'bg-black/60 group-hover:bg-black/70',
  };

  return (
    <div
      className={`relative rounded-xl overflow-hidden group cursor-pointer hover:shadow-2xl transition ${className}`}
      style={{ height }}
      onClick={onClick}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover group-hover:scale-110 transition duration-300"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority={false}
      />

      {/* Dark Overlay */}
      <div className={`absolute inset-0 ${overlayClasses[overlay]} transition`}></div>

      {/* Content */}
      <div className="absolute inset-0 p-6 flex flex-col justify-end">
        <h3 className="text-2xl font-bold mb-2 text-white">{title}</h3>
        <p className="text-gray-100 text-sm leading-relaxed">{description}</p>
        {children && <div className="mt-4">{children}</div>}
      </div>
    </div>
  );
}

/**
 * Grid of image cards
 */
interface ImageCardGridProps {
  cards: Array<{
    id: string;
    src: string;
    alt: string;
    title: string;
    description: string;
    overlay?: 'light' | 'dark' | 'medium';
  }>;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'small' | 'medium' | 'large';
  height?: number;
  className?: string;
}

export function ImageCardGrid({
  cards,
  columns = 3,
  gap = 'medium',
  height = 320,
  className = '',
}: ImageCardGridProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  const gapClasses = {
    small: 'gap-3',
    medium: 'gap-6',
    large: 'gap-8',
  };

  return (
    <div className={`grid ${gridClasses[columns]} ${gapClasses[gap]} ${className}`}>
      {cards.map((card) => (
        <ImageCard
          key={card.id}
          src={card.src}
          alt={card.alt}
          title={card.title}
          description={card.description}
          overlay={card.overlay || 'medium'}
          height={height}
        />
      ))}
    </div>
  );
}

/**
 * Featured image card with title and call-to-action
 */
interface FeaturedImageCardProps extends Omit<ImageCardProps, 'children'> {
  badge?: string;
  badgeColor?: string;
  ctaText?: string;
  ctaHref?: string;
}

export function FeaturedImageCard({
  src,
  alt,
  title,
  description,
  badge,
  badgeColor = 'bg-green-600',
  ctaText,
  ctaHref,
  overlay = 'dark',
  height = 400,
  className = '',
}: FeaturedImageCardProps) {
  return (
    <div
      className={`relative rounded-xl overflow-hidden group ${className}`}
      style={{ height }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover group-hover:scale-110 transition duration-300"
        priority
      />

      {/* Dark Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent`}></div>

      {/* Badge */}
      {badge && (
        <div className={`absolute top-6 right-6 ${badgeColor} text-white px-4 py-2 rounded-full text-sm font-semibold`}>
          {badge}
        </div>
      )}

      {/* Content */}
      <div className="absolute inset-0 p-8 flex flex-col justify-end">
        <h2 className="text-4xl font-bold mb-3 text-white">{title}</h2>
        <p className="text-gray-200 text-lg mb-6 max-w-2xl">{description}</p>

        {ctaText && ctaHref && (
          <div>
            <a
              href={ctaHref}
              className="inline-flex items-center bg-yellow-400 text-green-900 px-6 py-3 rounded-lg font-bold hover:bg-yellow-300 transition"
            >
              {ctaText}
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
