# Rivkala Dada Slide-Out Menu Kit

A mobile-first React/Next.js page based on the Dada scrapbook direction: charcoal paper, olive fabric, burgundy, cream, rust, muted pink, torn-paper navigation, collage art and a less-plain hamburger slide-out.

## Files

- `src/components/RivkalaDadaMenuPage.tsx` - the React/Next.js component
- `src/components/rivkala-dada-menu.css` - all styling and animations
- `src/app/page.tsx` - optional Next.js App Router page export
- `public/rivkala-assets/images/` - generated PNG image assets

## How to use in your project

1. Copy the `public/rivkala-assets` folder into your project `public` folder.
2. Copy `src/components/RivkalaDadaMenuPage.tsx` and `src/components/rivkala-dada-menu.css` into your components folder.
3. Import and render the component:

```tsx
import RivkalaDadaMenuPage from "./components/RivkalaDadaMenuPage";

export default function Home() {
  return <RivkalaDadaMenuPage />;
}
```

For Next.js App Router, you can also copy `src/app/page.tsx` as a starting point.

## Notes

- The component is marked `"use client"` because the hamburger menu uses React state.
- The image paths assume the assets live under `/public/rivkala-assets/images/`.
- No font files are included. The CSS uses system serif/sans fallbacks.
- Replace the `href` values in the nav/actions with your real routes when ready.

### Drawer update

The drawer menu now uses actual PNG collage elements with the writing baked into the images. The drawer links render as image assets with hidden accessible text labels, instead of CSS text sitting on paper placeholders.
