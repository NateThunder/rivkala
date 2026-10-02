<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:rivkala-site-rules -->
# Rivkala Site Requirements

This is the existing production website for **rivkala.com**.

## Preserve the existing visual identity

The site already has an established theme, visual language, typography, layouts, textures, effects, and art direction.

- Do not replace the existing design system with a generic redesign.
- Do not remove intentional visual effects, textures, collage elements, CRT effects, torn-paper styling, animations, or other existing artistic elements unless explicitly instructed.
- When improving performance or refactoring components, preserve the current appearance as closely as possible.
- Do not simplify the site visually merely to improve Lighthouse or performance scores.
- Check the existing implementation before creating new components or styles.

## Site colour palette

Use the following palette as the site's authoritative colour scheme. These values are sampled from the supplied colour reference; use the swatch colours themselves rather than the duplicated or mismatched hex labels printed over some swatches.

- Charcoal: `#272623`
- Deep navy: `#011e34`
- Pale gold: `#f2d9a0`
- Ochre gold: `#b98826`
- Burnt orange: `#983901`
- Olive: `#51561c`
- Deep teal: `#0b606f`
- Dusty rose: `#8b4a50`
- Raspberry: `#8a1f47`
- Aubergine: `#652144`
- Oxblood: `#630814`

Apply these colours consistently when adding or revising site UI. Preserve existing textures, imagery, effects, and art direction, and choose accessible foreground/background pairings with sufficient contrast. Do not introduce unrelated colours unless they are required by existing artwork, media, semantic states, or accessibility needs.

# Image Optimisation Requirement

The repository currently contains many large image assets. Image optimisation is a required part of work on this project.

## Repository-wide image migration

Audit **all image assets in the repository**, including assets in:

- `public/`
- `src/`
- component-specific asset directories
- page-specific asset directories
- backgrounds
- gallery images
- EPK images
- decorative assets
- textures
- hero images
- thumbnails
- any other locally stored raster images

Convert suitable raster image assets to **WebP** and compress them.

This applies to existing images, not only newly added images.

### Conversion rules

For raster formats such as:

- `.jpg`
- `.jpeg`
- `.png`

Create appropriately compressed `.webp` versions and update the application to use the WebP files.

Do **not** blindly convert formats where doing so would break functionality.

For example:

- Keep SVG assets as SVG where vector graphics are appropriate.
- Preserve transparency where required.
- Do not convert animated GIFs to static WebP images and destroy their animation.
- Do not reduce image quality enough to visibly damage artwork, photography, text, grain, collage textures, or branded assets.

The goal is:

> substantially smaller file sizes with no obvious visual degradation.

## Compression expectations

Images should not simply be converted to WebP at their original unnecessarily large dimensions.

For every image:

1. Determine how large it is actually displayed on the site.
2. Resize excessively large source images where appropriate.
3. Convert suitable raster assets to WebP.
4. Apply sensible WebP compression.
5. Preserve enough resolution for high-density displays where appropriate.
6. Check that transparent images retain transparency.
7. Update every import, CSS reference, inline style, metadata reference, and component reference that points to the old asset.
8. Verify that no broken image paths remain.

Avoid shipping images several thousand pixels wide when they are only rendered as small cards or thumbnails.

## Next.js images

Before modifying image handling, read the relevant documentation in:

`node_modules/next/dist/docs/`

Use the image APIs and behaviour documented for the **installed version of Next.js**, not assumptions based on older Next.js versions.

Use Next.js image optimisation where appropriate, but do not rely on runtime optimisation as an excuse to leave unnecessarily huge source assets in the repository.

Source assets should still be sensibly compressed.

## CSS and background images

The optimisation requirement also applies to images referenced through:

- CSS
- Tailwind classes
- `background-image`
- inline `style`
- pseudo-elements
- JavaScript or TypeScript asset maps
- arrays of image URLs
- JSON/content files

Do not only search `<Image>` and `<img>` components.

## Cleanup

After references have been migrated successfully:

- remove obsolete uncompressed `.jpg`, `.jpeg`, and `.png` files when they are no longer required;
- do not leave duplicate original assets in the production bundle without a reason;
- make sure deleting the old files does not break dynamic references or content.

Before deleting anything, search the entire repository for references to the original filename.

## Visual safety

Rivkala is a highly visual site.

Compression must not noticeably destroy:

- grain
- texture
- colour gradients
- typography embedded in artwork
- photographic detail
- transparency
- torn-paper edges
- collage elements
- intentional noise
- CRT-style graphics

Use higher WebP quality for visually sensitive assets and stronger compression for images where the difference is imperceptible.

## Performance goal

The final site should:

- transfer substantially less image data;
- avoid unnecessarily oversized images;
- use WebP for suitable raster assets;
- avoid broken references;
- retain the existing Rivkala design;
- remain responsive across desktop and mobile;
- avoid layout shifts caused by incorrectly sized images.

## Verification

Before considering the image optimisation work complete:

1. Search the repository for remaining `.png`, `.jpg`, and `.jpeg` assets.
2. Review each remaining raster asset and confirm there is a specific reason it has not been migrated.
3. Search the codebase for references to deleted image filenames.
4. Run the application's existing lint/type/build checks.
5. Verify the production build succeeds.
6. Inspect important pages visually on desktop and mobile.
7. Confirm that image-heavy sections, galleries, hero areas, EPK sections, and backgrounds still render correctly.
8. Compare repository/image sizes before and after the optimisation.

Do not mark the task complete after converting only the images encountered while editing a page. **This requirement covers the entire repository.**
<!-- END:rivkala-site-rules -->
