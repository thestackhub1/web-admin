# The Stack Hub Admin - Design System

## Overview
Premium, modern design system inspired by Notion, Figma, and Linear. Focus on simplicity, clarity, and professional aesthetics for educational platform administration.

## Color Palette

### Primary Brand
- **Orange 500**: `#FF8A00` - Primary brand color, CTAs, active states
- **Orange 600**: `#EA580C` - Hover states, emphasis
- **Amber 400**: `#FBBF24` - Gradient complements, accents

### Neutral Scale
- **Gray 50**: `#F9FAFB` - Background tints
- **Gray 100**: `#F3F4F6` - Subtle backgrounds
- **Gray 200**: `#E5E7EB` - Borders, dividers
- **Gray 500**: `#6B7280` - Secondary text
- **Gray 700**: `#374151` - Primary text (light mode)
- **Gray 900**: `#111827` - Headings (light mode)

### Semantic Colors
- **Success**: `#10B981` (Green 500)
- **Warning**: `#F59E0B` (Amber 500)
- **Error**: `#EF4444` (Red 500)
- **Info**: `#3B82F6` (Blue 500)

### Dark Mode
- **Background**: `#0F172A` (Slate 900)
- **Surface**: `#1E293B` (Slate 800)
- **Border**: `#334155` (Slate 700)

## Typography

### Font Family
- **Primary**: Inter (sans-serif) - Clean, modern, excellent readability
- **Mono**: Geist Mono - Code, data displays
- **Marathi**: Devanagari/Mukta - For bilingual content

### Font Scale
- **Display**: 32px (2rem) - Page titles
- **Heading 1**: 24px (1.5rem) - Section headers
- **Heading 2**: 20px (1.25rem) - Subsection headers
- **Body**: 16px (1rem) - Primary content
- **Small**: 14px (0.875rem) - Secondary text, captions
- **XSmall**: 12px (0.75rem) - Labels, badges

### Font Weights
- **Bold**: 700 - Headings, emphasis
- **Semibold**: 600 - Subheadings, labels
- **Medium**: 500 - Button text, interactive elements
- **Regular**: 400 - Body text

## Spacing Scale

Using 4px base unit:
- **xs**: 4px (0.25rem)
- **sm**: 8px (0.5rem)
- **md**: 12px (0.75rem)
- **base**: 16px (1rem)
- **lg**: 24px (1.5rem)
- **xl**: 32px (2rem)
- **2xl**: 48px (3rem)
- **3xl**: 64px (4rem)

## Component Patterns

### Cards
- **Border Radius**: 12px (rounded-xl)
- **Shadow**: `shadow-sm` (subtle elevation)
- **Padding**: 24px (p-6)
- **Border**: `border-gray-200` (light), `border-gray-800` (dark)
- **Hover**: `hover:shadow-md`, `hover:border-gray-300`

### Buttons
- **Primary**: Orange 600 background, white text, rounded-xl, shadow
- **Secondary**: White/Gray background, gray text, border
- **Ghost**: Transparent, text color only
- **Padding**: 12px vertical, 16px horizontal (py-3 px-4)

### Badges
- **Shape**: Pill (rounded-full)
- **Padding**: 4px horizontal, 2px vertical (px-2 py-0.5)
- **Size**: 12px text, small badges

### Icons
- **Size**: 20px (h-5 w-5) - Standard
- **Size**: 16px (h-4 w-4) - Small contexts
- **Size**: 24px (h-6 w-6) - Emphasized

## Layout Principles

### Grid System
- **Container Max Width**: 1280px (7xl)
- **Grid Gap**: 24px (gap-6) between cards
- **Card Grid**: Responsive 1-2-3 columns (sm:grid-cols-2 lg:grid-cols-3)

### White Space
- **Section Spacing**: 32px (space-y-8)
- **Card Internal**: 24px padding
- **Component Gap**: 16px (gap-4)

### Visual Hierarchy
1. **Primary Actions**: Orange 600, prominent placement
2. **Secondary Actions**: Gray borders, less emphasis
3. **Tertiary Actions**: Text links, subtle
4. **Information**: Gray text, hierarchical sizing

## Micro-interactions

### Hover States
- **Cards**: Scale 1.01, shadow increase, border color shift
- **Buttons**: Background darken, shadow increase
- **Links**: Color change, underline (optional)

### Transitions
- **Duration**: 200ms (duration-200) - Standard
- **Duration**: 300ms (duration-300) - Emphasis
- **Easing**: `ease-out` - Natural feel

### Loading States
- **Skeleton**: Gray 200 background, pulse animation
- **Spinner**: Orange 600, smooth rotation

## Accessibility

### Contrast
- **Text on Background**: Minimum 4.5:1 (WCAG AA)
- **Interactive Elements**: Clear focus states
- **Color Blindness**: Don't rely solely on color

### Keyboard Navigation
- **Tab Order**: Logical flow
- **Focus Indicators**: Visible outline (ring-2 ring-orange-500)
- **Skip Links**: Available for main content

### Screen Readers
- **ARIA Labels**: Descriptive labels for icons
- **Semantic HTML**: Proper heading hierarchy
- **Alt Text**: All images and icons

## Responsive Breakpoints

- **sm**: 640px - Small tablets, large phones
- **md**: 768px - Tablets
- **lg**: 1024px - Small laptops
- **xl**: 1280px - Desktops
- **2xl**: 1536px - Large desktops

## Bilingual Support

### Language Toggle
- **Location**: Top-right header
- **Display**: EN / मराठी toggle
- **Persistence**: User preference saved

### Text Rendering
- **Marathi Text**: Devanagari font family
- **Mixed Content**: Respect lang attribute
- **RTL**: Future consideration

## Dark Mode

### Implementation
- **System Preference**: Default detection
- **Manual Toggle**: Available in settings
- **Persistence**: User preference saved

### Color Adjustments
- **Backgrounds**: Darker tones (Slate 900/800)
- **Text**: Light colors (Gray 100/200)
- **Borders**: Subtle (Slate 700)
- **Shadows**: Reduced, darker tones



