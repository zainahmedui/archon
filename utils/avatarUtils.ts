/**
 * Generates an ultra-minimal, flat-design SVG avatar.
 * Returns a Base64 encoded Data URI.
 */
export const generateDefaultAvatar = (seed: string): string => {
  // We use the seed to potentially vary colors in the future, 
  // but for now we enforce strict monochrome consistency for the brand.
  
  const bg = "#f0f0f0"; // archon-100
  const fg = "#b4b4b4"; // archon-400

  const svg = `
<svg width="200" height="200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="24" height="24" fill="${bg}"/>
  <circle cx="12" cy="8" r="3.5" fill="${fg}"/>
  <path d="M12 13C7.58172 13 4 16.5817 4 21V24H20V21C20 16.5817 16.4183 13 12 13Z" fill="${fg}"/>
</svg>
  `.trim();

  return `data:image/svg+xml;base64,${btoa(svg)}`;
};