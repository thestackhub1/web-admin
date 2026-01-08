# 🎨 TheStackHub - Logo & Icon System

## Overview
This directory contains the complete logo system and icon variants for **TheStackHub**, optimized for web, mobile, iOS, Android, and PWA applications.

## 📦 Directory Structure

```
public/
├── icons/
│   ├── svg/              # Scalable Vector Graphics
│   │   ├── logo.svg       # Full logo (vector)
│   │   └── favicon.svg    # Optimized favicon (vector)
│   ├── web/              # Browser Favicons
│   │   ├── favicon.ico    # Legacy fallback (16, 32, 48px)
│   │   ├── favicon-16x16.png
│   │   ├── favicon-32x32.png
│   │   └── favicon-48x48.png
│   ├── ios/              # iOS / Apple Touch Icons
│   │   ├── apple-touch-icon-180x180.png (iPhone Primary)
│   │   ├── apple-touch-icon-167x167.png (iPad Pro)
│   │   └── [other sizes...]
│   ├── android/          # Android / Chrome
│   │   ├── android-chrome-192x192.png
│   │   └── android-chrome-512x512.png
│   ├── pwa/              # Maskable Icons (Adaptive)
│   │   ├── maskable-192x192.png
│   │   └── maskable-512x512.png
│   └── og/               # Social Sharing (Open Graph)
│       └── default.png       # 1200x630 Open Graph image
├── logo-animated.gif     # Animated Logo (GIF)
├── logo-text-animated.gif # Animated Logo with Text (GIF)
├── manifest.json         # PWA Configuration
└── browserconfig.xml     # Windows Tile Config
```

---

## 🚀 implementation Guide

### 1. Next.js App Router (Recommended)

Import the `AppIcons` component in your root layout:

```tsx
// app/layout.tsx
import { AppIcons } from '@/components/icons/AppIcons';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <AppIcons />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### 2. Manual Implementation (HTML)

Include these tags in your `<head>`:

```html
<!-- Favicons -->
<link rel="icon" type="image/svg+xml" href="/icons/svg/favicon.svg">
<link rel="alternate icon" href="/icons/web/favicon.ico">
<link rel="icon" type="image/png" sizes="16x16" href="/icons/web/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/icons/web/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="48x48" href="/icons/web/favicon-48x48.png">

<!-- iOS -->
<link rel="apple-touch-icon" sizes="180x180" href="/icons/ios/apple-touch-icon-180x180.png">
<link rel="apple-touch-icon" sizes="167x167" href="/icons/ios/apple-touch-icon-167x167.png">
<link rel="apple-touch-icon" sizes="152x152" href="/icons/ios/apple-touch-icon-152x152.png">
<link rel="apple-touch-icon" sizes="120x120" href="/icons/ios/apple-touch-icon-120x120.png">

<!-- PWA / Android -->
<link rel="icon" type="image/png" sizes="192x192" href="/icons/android/android-chrome-192x192.png">
<link rel="icon" type="image/png" sizes="512x512" href="/icons/android/android-chrome-512x512.png">
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#3B82F6">

<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:image" content="https://thestackhub.io/icons/og/default.png">
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:image" content="https://thestackhub.io/icons/og/default.png">
```

---

## 🎨 Design System

### Concept: "The Stack"
The logo represents layered platforms building upon each other, integrating multiple business verticals.

### Color Palette

| Layer | Color | Gradient | Usage |
|-------|-------|----------|-------|
| **Core** | 🔵 Blue | `#3B82F6` → `#93C5FD` | Franchising / Main Brand |
| **Growth** | 🟢 Emerald | `#10B981` → `#6EE7B7` | Education |
| **Base** | 🟡 Amber | `#F59E0B` → `#FCD34D` | Construction |
| **Future** | 🟣 Purple | `#8B5CF6` → `#C4B5FD` | Manufacturing |

### Optimization Details
- **SVG**: Cleaned, minified, and scalable.
- **PNG**: Compressed with `sharp` (level 9), anti-aliased.
- **PWA**: Maskable icons included for Android 12+ adaptive theming (safe zones respected).

---

## 🛠 Management

### Regenerating Icons
If the logo changes, update `components/logos/TheStackHubLogo.tsx` and run:

```bash
npm run generate:icons
```

To regenerate animated GIFs:

```bash
npm run generate:gif
```

This will automatically:
1. Extract the SVG from the React component.
2. Generate all PNG variants (Favicons, iOS, Android).
3. Generate the Open Graph image.
4. Update `manifest.json`.

### Source File
- **Source**: `components/logos/TheStackHubLogo.tsx`
- **Script**: `scripts/generate-logo-variants.js`

---

## 🧪 Testing

1. **Favicon**: Check browser tab.
2. **iOS**: Open in Safari → Share → "Add to Home Screen".
3. **Android**: Chrome → Menu → "Install App".
4. **PWA**: Run Lighthouse audit in Chrome DevTools (should score 100/100).
