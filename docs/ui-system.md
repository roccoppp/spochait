# UI Design System

This document explains the modern UI design system implemented in Spotichat, including color scales, semantic tokens, and styling guidelines.

## Color System

### Brand Color Scale
The brand color scale is derived from Spotify's signature green (#1db954) but provides a full range of tones for different use cases:

```css
--brand-50: #ecfdf5   /* Lightest tint */
--brand-100: #d1fae5
--brand-200: #a7f3d0
--brand-300: #6ee7b7
--brand-400: #34d399
--brand-500: #1db954  /* Primary Spotify green */
--brand-600: #059669
--brand-700: #047857
--brand-800: #065f46
--brand-900: #064e3b
--brand-950: #022c22  /* Darkest shade */
```

### Semantic Color Tokens
Semantic tokens provide consistent meaning across the interface:

```css
/* Light mode defaults */
--bg: #0a0a0a           /* Main background */
--surface: #121212      /* Card/panel surfaces */
--surface-hover: #1a1a1a /* Hover states */
--content: #ffffff      /* Primary text */
--content-muted: #a1a1aa /* Secondary text */
--accent: var(--brand-500) /* Interactive elements */
--border: #262626       /* Subtle borders */
--ring: #404040         /* Focus rings */
```

### Dark Mode
Enable dark mode by adding `class="dark"` to the `<html>` element:

```html
<html lang="en" class="dark">
```

Dark mode provides deeper, more contrasted tones:
- Darker backgrounds for better contrast
- Brighter accent color (#22c55e) for visibility
- Adjusted content colors for readability

## Usage in Components

### Tailwind Classes
Use semantic color classes in your components:

```jsx
// Backgrounds
<div className="bg-bg">               // Main background
<div className="bg-surface">          // Card background  
<div className="bg-surface-hover">    // Hover states

// Text colors
<h1 className="text-content">         // Primary text
<p className="text-content-muted">    // Secondary text

// Interactive elements
<button className="bg-accent">        // Primary actions
<div className="border-border">       // Subtle borders
```

### Component Classes
Use pre-built component classes for consistency:

```jsx
// Buttons
<button className="btn btn-primary">Primary Action</button>
<button className="btn btn-secondary">Secondary Action</button>

// Surfaces
<div className="surface">Basic surface</div>
<div className="surface-card">Interactive card</div>

// Form inputs
<input className="input" placeholder="Enter text..." />

// Typography
<h1 className="heading-xl">Main Heading</h1>
<h2 className="heading-lg">Section Heading</h2>
<p className="body-text">Body paragraph</p>
```

## Customizing Brand Tones

To adjust the brand color tones while keeping the same hue family:

### 1. Adjust Lightness/Saturation
In `app/globals.css`, modify specific brand scale values:

```css
:root {
  /* Make brand-500 slightly darker */
  --brand-500: #199945; 
  
  /* Make brand-700 more saturated */
  --brand-700: #047857;
}
```

### 2. Dark Mode Variations
Adjust dark mode accent for better contrast:

```css
.dark {
  /* Brighter green for dark backgrounds */
  --accent: #22c55e;
}
```

### 3. Semantic Token Overrides
Customize semantic meanings without changing the scale:

```css
:root {
  /* Use a different brand tone for accents */
  --accent: var(--brand-600);
}
```

## Styling Guidelines

### Depth & Elevation
- Use `rounded-2xl` for modern rounded corners
- Apply `shadow-md` or `shadow-lg` for depth
- Add `ring-1 ring-black/5` for subtle definition
- Use `border border-border` for soft boundaries

### Interactive States
- Add `hover:` and `focus-visible:` states
- Use `transition-all duration-200 ease-out` for smooth transitions
- Apply subtle scale transforms: `hover:scale-[0.98]` or `hover:scale-[1.02]`
- Include opacity changes: `hover:opacity-90`

### Typography
- Use `text-balance` for headlines
- Apply `leading-relaxed` for body text
- Add `tracking-tight` for headings
- Limit body text width with `max-w-prose`

### Layout
- Use `container-app` for consistent max-width containers
- Apply `section-padding` (py-12/16) for major sections
- Use `card-padding` (p-6/8) for card interiors
- Leverage CSS Grid with `gap-6/8` for spacing

### Animations
Motion-safe animations respect user preferences:

```jsx
// Fade in animation
<div className="motion-safe-animate-fade-in">Content</div>

// Scale in animation  
<div className="motion-safe-animate-scale-in">Card</div>

// Scroll-triggered animations
<div className="scroll-animate">Reveals on scroll</div>
```

## Examples

### Button Variants
```jsx
// Primary action
<button className="btn btn-primary">
  Connect to Spotify
</button>

// Secondary action
<button className="btn btn-secondary">
  Cancel
</button>

// With loading state
<button className="btn btn-primary" disabled={loading}>
  {loading ? (
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      Connecting...
    </div>
  ) : (
    "Connect"
  )}
</button>
```

### Card Components
```jsx
// Basic card
<div className="surface card-padding">
  <h3 className="heading-lg mb-4">Card Title</h3>
  <p className="body-text">Card content goes here.</p>
</div>

// Interactive card
<div className="surface-card">
  <h3 className="heading-lg mb-4">Interactive Card</h3>
  <p className="body-text mb-6">Hover for effects.</p>
  <button className="btn btn-primary">Action</button>
</div>
```

This design system provides a cohesive, modern interface while maintaining the Spotify brand identity and ensuring excellent accessibility and user experience.
