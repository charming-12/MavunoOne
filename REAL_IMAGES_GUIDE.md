# 🖼️ Real Image Implementation Guide

This guide explains how to use real, high-quality agricultural and logistics photos throughout MavunoOne instead of abstract icons.

## Overview

We've replaced icon-based cards with realistic photographic images using:
- **Next.js Image component** for optimization
- **Unsplash URLs** for free, high-quality photos
- **Dark overlays** for text readability
- **Reusable ImageCard components** for consistency

## Components

### 1. ImageCard

Simple card with image background and dark overlay.

```tsx
import { ImageCard } from '@/components/ImageCard';

<ImageCard
  src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&h=400&fit=crop"
  alt="Green agricultural fields"
  title="Agriculture"
  description="Manage crops and harvest data"
  overlay="dark"  // 'light' | 'medium' | 'dark'
  height={300}
  onClick={() => console.log('clicked')}
/>
```

### 2. ImageCardGrid

Display multiple cards in a responsive grid.

```tsx
import { ImageCardGrid } from '@/components/ImageCard';

<ImageCardGrid
  columns={3}  // 1, 2, 3, or 4
  gap="medium"  // 'small' | 'medium' | 'large'
  height={320}
  cards={[
    {
      id: '1',
      src: 'https://images.unsplash.com/...',
      alt: 'Description',
      title: 'Card Title',
      description: 'Card description text',
      overlay: 'dark',
    },
    // ... more cards
  ]}
/>
```

### 3. FeaturedImageCard

Large hero-style card with gradient overlay and CTA button.

```tsx
import { FeaturedImageCard } from '@/components/ImageCard';

<FeaturedImageCard
  src="https://images.unsplash.com/photo-1574943320219-553eb213f72d"
  alt="Featured agriculture"
  title="Complete Farm Management"
  description="Manage all aspects of your agricultural business"
  badge="Popular"
  badgeColor="bg-green-600"
  ctaText="Get Started"
  ctaHref="/login"
  overlay="dark"
  height={400}
/>
```

## Recommended Unsplash URLs

### Agriculture & Crops
```
Green fields & farming:
https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&h=400&fit=crop

Maize/corn harvesting:
https://images.unsplash.com/photo-1625246333195-78d9c38ad576?w=600&h=400&fit=crop

Farmer in field:
https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&h=400&fit=crop

Plowing/farming:
https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop
```

### Livestock & Feed
```
Cattle/cows:
https://images.unsplash.com/photo-1560493676-04071c5f467b?w=600&h=400&fit=crop

Chickens/poultry:
https://images.unsplash.com/photo-1584295201486-3b2d9b3e1d8c?w=600&h=400&fit=crop

Farm animals:
https://images.unsplash.com/photo-1516014866919-7282edc356c9?w=600&h=400&fit=crop

Animal feed:
https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&h=400&fit=crop
```

### Logistics & Delivery
```
Delivery truck:
https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop

Warehouse/storage:
https://images.unsplash.com/photo-1586528946e3-b5e3d1ba4908?w=600&h=400&fit=crop

GPS/tracking:
https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=600&h=400&fit=crop

Cargo/shipment:
https://images.unsplash.com/photo-1453448519474-9b92ab5b92ae?w=600&h=400&fit=crop
```

### Marketplace/Shop
```
Market/produce stand:
https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&h=400&fit=crop

Fresh produce:
https://images.unsplash.com/photo-1488334461308-72f98e40e1a9?w=600&h=400&fit=crop

Shopping/retail:
https://images.unsplash.com/photo-1556740750-b3ee935b6e3a?w=600&h=400&fit=crop

Vendor selling:
https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&h=400&fit=crop
```

### Dashboard/Management
```
Data analytics:
https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop

Business meeting:
https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop

Team working:
https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop

Office work:
https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop
```

## Implementation Examples

### Example 1: Landing Page Feature Cards
**File**: `app/page.tsx`

```tsx
import Image from 'next/image';

<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
  {/* Agriculture Card */}
  <div className="relative h-80 rounded-xl overflow-hidden group cursor-pointer hover:shadow-2xl transition">
    <Image
      src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&h=400&fit=crop"
      alt="Agriculture"
      fill
      className="object-cover group-hover:scale-110 transition duration-300"
    />
    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition"></div>
    <div className="absolute inset-0 p-6 flex flex-col justify-end">
      <h3 className="text-2xl font-bold mb-2 text-white">Agriculture</h3>
      <p className="text-gray-100 text-sm">Manage crops and harvests</p>
    </div>
  </div>
</div>
```

### Example 2: Quick Access Menu Cards
**File**: `app/office/page.tsx`

```tsx
import { ImageCardGrid } from '@/components/ImageCard';

<ImageCardGrid
  columns={3}
  gap="medium"
  height={280}
  cards={[
    {
      id: 'pos',
      src: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136',
      alt: 'Point of Sale',
      title: 'Point of Sale (POS)',
      description: 'Process sales and payments',
      overlay: 'dark',
    },
    {
      id: 'stock',
      src: 'https://images.unsplash.com/photo-1586528946e3-b5e3d1ba4908',
      alt: 'Inventory',
      title: 'Manage Stock',
      description: 'Track inventory levels',
      overlay: 'dark',
    },
    {
      id: 'delivery',
      src: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c',
      alt: 'Delivery',
      title: 'Deliveries',
      description: 'Track shipments and GPS',
      overlay: 'dark',
    },
  ]}
/>
```

### Example 3: Hero Banner
**File**: Any hero section

```tsx
import { FeaturedImageCard } from '@/components/ImageCard';

<FeaturedImageCard
  src="https://images.unsplash.com/photo-1574943320219-553eb213f72d"
  alt="Farm management"
  title="Your Agricultural Business"
  description="Streamline operations from farm to market"
  badge="Trusted by 500+ Businesses"
  ctaText="Start Free Trial"
  ctaHref="/signup"
  height={500}
/>
```

## Dark Overlay Options

### Light Overlay (20% opacity)
```tsx
<ImageCard overlay="light" />
```
Best for: High contrast images, bright photos
Use when: Image is very bright or colorful

### Medium Overlay (40% opacity)
```tsx
<ImageCard overlay="medium" />  // Default
```
Best for: Most photos, balanced readability
Use when: Text needs good contrast

### Dark Overlay (60% opacity)
```tsx
<ImageCard overlay="dark" />
```
Best for: Low contrast images, subtle photos
Use when: Image is dark or needs maximum text contrast

## Styling & Customization

### Hover Effects
All cards include smooth hover effects:
- Image zoom (scale-110)
- Shadow increase
- Overlay darkening

### Responsive Sizing
```tsx
// Grid automatically adjusts:
// Mobile: 1 column
// Tablet: 2 columns  
// Desktop: 3+ columns

<ImageCardGrid columns={3} />
```

### Custom Height
```tsx
<ImageCard height={400} />  // pixels
<ImageCard height={300} />
```

### Custom Styling
```tsx
<ImageCard
  className="rounded-2xl shadow-2xl"
/>
```

## Best Practices

### 1. Image URLs
✅ Use Unsplash (free, high-quality)
✅ Use HTTPS URLs
✅ Add `?w=600&h=400&fit=crop` for optimization
❌ Avoid tiny or low-quality images

### 2. Text Contrast
✅ Use white or light text on images
✅ Adjust overlay opacity for readability
✅ Keep text short and impactful
❌ Don't use colored text on images

### 3. Loading
✅ Use `priority={false}` for below-fold images
✅ Set `priority={true}` for above-fold images
✅ Let Next.js optimize images automatically
❌ Don't load too many high-res images

### 4. Alt Text
✅ Describe the image content
✅ Keep it concise and meaningful
✅ Use SEO-friendly descriptions
❌ Leave alt text empty

### 5. Mobile Optimization
✅ Images auto-resize for mobile
✅ Grid columns reduce on small screens
✅ Touch-friendly hover states
❌ Don't use fixed-width layouts

## Troubleshooting

### Image Not Loading
- Check URL is valid and HTTPS
- Verify image dimensions (width:height ratio)
- Check for CORS issues
- Try different image URL

### Text Not Readable
- Increase overlay opacity
- Use darker overlay ('dark' instead of 'light')
- Make text larger (increase font-size)
- Check text color (use white/light text)

### Performance Issues
- Compress images (use URL params: ?w=600&fit=crop)
- Don't load all images at once
- Use lazy loading (default behavior)
- Reduce number of cards per page

### Image Doesn't Fit Right
- Try different crop mode: `?fit=crop` or `?fit=max`
- Adjust card height
- Check aspect ratio
- Use different image

## Quick Reference

| Component | Best For | Height | Columns |
|-----------|----------|--------|---------|
| ImageCard | Feature showcase | 300-350px | Variable |
| ImageCardGrid | Multiple features | 280-320px | 2-3 |
| FeaturedImageCard | Hero section | 400-500px | 1 |

## Resources

- **Unsplash**: https://unsplash.com (Search for agriculture, farming, logistics, trucks, etc.)
- **Next.js Image**: https://nextjs.org/docs/api-reference/next/image
- **Image Optimization**: https://nextjs.org/docs/basic-features/image-optimization

---

**Updated**: 2026-08-16
**Status**: Production Ready ✅
