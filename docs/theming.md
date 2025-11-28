# Theming Guide

This guide explains how to use and customize the theme system in this application.

## Overview

The application uses a CSS variable-based theme system with three pre-built themes:
- **Terminal Theme** (default): Dark theme with green accents
- **Glass Theme**: Modern glassmorphism with purple/blue accents
- **Material Theme**: Clean Material Design light theme

All themes are powered by CSS custom properties, making them easy to switch and customize.

## Switching Themes

### Method 1: CSS Import (Recommended)

The easiest way to switch themes is by changing the import in `src/app/globals.css`:

```css
/* Change this line to switch themes */
@import "./themes/terminal-theme.css";  /* Current */
/* @import "./themes/glass-theme.css"; */
/* @import "./themes/material-theme.css"; */
```

**Steps:**
1. Open `src/app/globals.css`
2. Comment out the current theme import
3. Uncomment your desired theme import
4. Save the file
5. The changes will apply immediately in development

### Method 2: Dynamic Theme Switching (Future Enhancement)

For runtime theme switching, you could implement:
1. Theme selector component
2. localStorage persistence
3. Dynamic CSS import or CSS variable overrides

## Available Themes

### Terminal Theme (Default)

**Aesthetic**: Dark, command-line inspired with green accents
**File**: `src/app/themes/terminal-theme.css`

**Color Palette:**
- Primary: `#00ff88` (Bright green)
- Background Base: `#0a0a0a` (Near black)
- Background Elevated: `#141414` (Dark gray)
- Text Primary: `#e5e5e5` (Light gray)
- Text Secondary: `#888888` (Medium gray)
- Error: `#ff4444` (Red)
- Warning: `#ffaa00` (Orange)

**Best For**: Developer tools, terminal apps, tech-focused interfaces

### Glass Theme

**Aesthetic**: Modern glassmorphism with frosted effects
**File**: `src/app/themes/glass-theme.css`

**Color Palette:**
- Primary: `#8b5cf6` (Purple)
- Background Base: `#0f0f23` (Dark blue-tinted)
- Backgrounds: Semi-transparent with blur effects
- Text Primary: `#f0f0ff` (Light purple-white)
- Text Secondary: `#a0a0c0` (Muted lavender)

**Best For**: Modern web apps, creative tools, premium interfaces

**Special Features:**
- `.glass-effect` utility class for backdrop blur
- Semi-transparent backgrounds
- Saturated blur effects

### Material Theme

**Aesthetic**: Clean, professional light theme
**File**: `src/app/themes/material-theme.css`

**Color Palette:**
- Primary: `#1976d2` (Material blue)
- Background Base: `#ffffff` (White)
- Background Elevated: `#f5f5f5` (Light gray)
- Text Primary: `#212121` (Near black)
- Text Secondary: `#757575` (Gray)

**Best For**: Business apps, dashboards, professional tools

**Special Features:**
- `.elevation-1`, `.elevation-2`, `.elevation-3` shadow utilities
- Material Design elevation system
- Crisp, high-contrast colors

## Theme Variables

All themes define the same set of CSS custom properties, ensuring consistent styling across theme switches.

### Primary Colors

```css
--color-primary              /* Main accent color */
--color-primary-muted        /* Muted version (90% opacity) */
--color-primary-bg           /* Primary background (20% opacity) */
--color-primary-border       /* Primary border color */
```

### Background Colors

```css
--color-bg-base              /* Base background (body) */
--color-bg-elevated          /* Elevated surfaces (cards) */
--color-bg-card              /* Card backgrounds */
--color-bg-hover             /* Hover states */
--color-bg-active            /* Active/pressed states */
```

### Border Colors

```css
--color-border-base          /* Default borders */
--color-border-hover         /* Hover state borders */
--color-border-focus         /* Focus state borders */
```

### Text Colors

```css
--color-text-primary         /* Primary text */
--color-text-secondary       /* Secondary/muted text */
--color-text-muted           /* Very muted text */
--color-text-inverted        /* Inverted text (for colored backgrounds) */
```

### Status Colors

```css
--color-success              /* Success state */
--color-success-bg           /* Success background */
--color-success-border       /* Success border */

--color-warning              /* Warning state */
--color-warning-bg           /* Warning background */
--color-warning-border       /* Warning border */

--color-error                /* Error state */
--color-error-bg             /* Error background */
--color-error-border         /* Error border */

--color-info                 /* Info state */
--color-info-bg              /* Info background */
--color-info-border          /* Info border */
```

### Role Badge Colors

```css
--color-role-admin-bg        /* Admin badge background */
--color-role-admin-border    /* Admin badge border */
--color-role-admin-text      /* Admin badge text */

--color-role-user-bg         /* User badge background */
--color-role-user-border     /* User badge border */
--color-role-user-text       /* User badge text */
```

## Using Theme Colors in Components

### Tailwind Utility Classes

The theme system is integrated with Tailwind CSS v4 through the `@theme` directive. All theme colors are available as Tailwind utilities with the `theme-` prefix:

```tsx
// Background colors
<div className="bg-theme-bg-base">
<div className="bg-theme-bg-elevated">
<div className="bg-theme-primary">

// Text colors
<p className="text-theme-text-primary">
<p className="text-theme-text-secondary">
<span className="text-theme-error">

// Border colors
<div className="border border-theme-border-base">
<input className="focus:border-theme-primary">

// Hover states
<button className="hover:bg-theme-bg-hover">
<div className="hover:border-theme-border-hover">
```

### Complete Class Reference

**Backgrounds:**
- `bg-theme-bg-base` - Base background
- `bg-theme-bg-elevated` - Cards/surfaces
- `bg-theme-bg-card` - Card backgrounds
- `bg-theme-bg-hover` - Hover states
- `bg-theme-bg-active` - Active states
- `bg-theme-primary` - Primary color
- `bg-theme-success-bg` - Success background
- `bg-theme-warning-bg` - Warning background
- `bg-theme-error-bg` - Error background

**Text:**
- `text-theme-text-primary` - Primary text
- `text-theme-text-secondary` - Secondary text
- `text-theme-text-muted` - Muted text
- `text-theme-text-inverted` - Inverted text
- `text-theme-primary` - Primary color text
- `text-theme-success` - Success text
- `text-theme-warning` - Warning text
- `text-theme-error` - Error text

**Borders:**
- `border-theme-border-base` - Default borders
- `border-theme-border-hover` - Hover borders
- `border-theme-primary` - Primary borders
- `focus:border-theme-primary` - Focus borders

**Role Badges:**
- `bg-theme-role-admin-bg` / `text-theme-role-admin-text` / `border-theme-role-admin-border`
- `bg-theme-role-user-bg` / `text-theme-role-user-text` / `border-theme-role-user-border`

### Example Component

```tsx
export function ThemedCard() {
  return (
    <div className="bg-theme-bg-elevated border border-theme-border-base rounded-lg p-6">
      <h2 className="text-theme-text-primary font-bold mb-2">
        Card Title
      </h2>
      <p className="text-theme-text-secondary text-sm">
        Card description text
      </p>
      <button className="mt-4 bg-theme-primary text-theme-text-inverted hover:bg-theme-primary/90 px-4 py-2 rounded">
        Action
      </button>
    </div>
  );
}
```

## Creating Custom Themes

### Step 1: Create Theme File

Create a new file in `src/app/themes/`:

```css
/* src/app/themes/my-theme.css */

/**
 * My Custom Theme
 *
 * Description of your theme
 */

:root {
  /* Primary Colors */
  --color-primary: #your-color;
  --color-primary-muted: rgba(your-color, 0.9);
  --color-primary-bg: rgba(your-color, 0.2);
  --color-primary-border: #your-color;

  /* Define all other variables... */
}
```

### Step 2: Define All Variables

Copy the complete variable list from an existing theme and customize the colors. **All variables must be defined** for the theme to work properly.

### Step 3: Add Special Utilities (Optional)

Add theme-specific utility classes if needed:

```css
/* Custom utilities for your theme */
.my-custom-effect {
  /* Custom styles */
}
```

### Step 4: Import Your Theme

Update `src/app/globals.css`:

```css
@import "./themes/my-theme.css";
```

## Color Scheme Guidelines

### Contrast Ratios

Ensure proper contrast for accessibility:
- **Primary text on background**: Minimum 4.5:1
- **Secondary text on background**: Minimum 3:1
- **Interactive elements**: Minimum 3:1

Use tools like [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) to verify.

### Color Psychology

- **Green/Teal**: Success, growth, tech (Terminal theme)
- **Purple/Blue**: Creativity, premium, modern (Glass theme)
- **Blue**: Trust, professional, stable (Material theme)
- **Red**: Error, danger, urgent
- **Orange/Yellow**: Warning, caution, attention

### Semantic Color Usage

Always use semantic color variables, not raw colors:

```tsx
// Good ✅
<div className="bg-theme-bg-elevated border-theme-border-base">
<p className="text-theme-error">Error message</p>

// Bad ❌
<div className="bg-[#141414] border-[#2a2a2a]">
<p className="text-[#ff4444]">Error message</p>
```

This ensures your components adapt to theme changes automatically.

## Theme Architecture

### CSS Variable Cascade

1. **Theme file** defines base colors (`--color-primary`, etc.)
2. **globals.css `@theme`** maps to Tailwind utilities (`--color-theme-primary`)
3. **Legacy variables** map to theme colors for backwards compatibility
4. **Components** use Tailwind utility classes (`bg-theme-primary`)

### File Structure

```
src/app/
├── themes/
│   ├── terminal-theme.css    # Terminal theme
│   ├── glass-theme.css        # Glass theme
│   └── material-theme.css     # Material theme
└── globals.css                # Theme import & Tailwind config
```

## Best Practices

1. **Use Semantic Classes**: Always use `theme-*` utilities, never hardcode colors
2. **Test All Themes**: Verify your components work with all three themes
3. **Maintain Contrast**: Ensure text is readable on all backgrounds
4. **Document Custom Variables**: Add comments explaining custom colors
5. **Keep Variables Consistent**: Use the same variable names across themes
6. **Use Opacity Modifiers**: Leverage Tailwind's `/90`, `/80` opacity utilities
7. **Avoid Color-Specific Logic**: Don't write JavaScript that assumes specific colors

## Troubleshooting

### Colors Not Applying

**Issue**: Theme colors not showing up
**Solution**:
1. Verify theme is imported in `globals.css`
2. Check that all CSS variables are defined in theme file
3. Clear browser cache and restart dev server
4. Ensure no conflicting inline styles

### Wrong Colors After Theme Switch

**Issue**: Some colors don't change with theme
**Solution**:
1. Find hardcoded color values in components
2. Replace with theme utility classes
3. Search for `#[0-9a-fA-F]{6}` in your codebase

### Inconsistent Styling

**Issue**: Components look different across themes
**Solution**:
1. Ensure all theme files define the same variables
2. Check for missing variable definitions
3. Verify semantic color usage (e.g., `error` for errors, not `red`)

## Future Enhancements

Potential improvements to the theme system:

1. **Runtime Theme Switching**
   - Theme selector component
   - localStorage persistence
   - Smooth transitions between themes

2. **Theme Variants**
   - Auto dark/light mode based on system preference
   - Time-based theme switching
   - User preference syncing

3. **Theme Preview**
   - Live preview before applying
   - Theme comparison view
   - Color palette documentation page

4. **Advanced Customization**
   - Theme builder UI
   - Export custom themes
   - Share themes between projects

## Additional Resources

- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [CSS Custom Properties MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Material Design Color System](https://m3.material.io/styles/color/system/overview)
- [Coolors Palette Generator](https://coolors.co/)
