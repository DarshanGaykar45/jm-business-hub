/**
 * Media Configuration & Background Asset Registry
 * Client: Jay Malhar Udyog Samuha
 * 
 * Central slot mapping for all background images.
 * Image drops into frontend/public/assets/backgrounds/ will work seamlessly.
 */

export const MEDIA = {
  heroHome:         "/assets/backgrounds/hero-home.jpg",
  heroConstruction: "/assets/backgrounds/construction.jpg",
  heroSolar:        "/assets/backgrounds/solar.jpg",
  heroSuppliers:    "/assets/backgrounds/suppliers.jpg",
  aboutBanner:      "/assets/backgrounds/about.jpg",
  contactBanner:    "/assets/backgrounds/contact.jpg",
  ctaStrip:         "/assets/backgrounds/cta.jpg",
};

/**
 * Branded Gradients for Graceful Fallback
 * Used underneath background images so missing/loading images still look stunning.
 */
export const GRADIENT_FALLBACKS = {
  home: "linear-gradient(135deg, #0b1322 0%, #162744 50%, #0e1a2d 100%)",
  construction: "linear-gradient(135deg, #1c150c 0%, #78350f 40%, #0e1a2d 100%)",
  solar: "linear-gradient(135deg, #062217 0%, #065f46 40%, #0e1a2d 100%)",
  suppliers: "linear-gradient(135deg, #18181b 0%, #3f3f46 40%, #0e1a2d 100%)",
  default: "linear-gradient(135deg, #0e1a2d 0%, #162744 100%)"
};

/**
 * Dark Overlay
 * Guaranteed text legibility over any client-provided photo
 */
export const DARK_OVERLAY = "linear-gradient(rgba(14, 26, 45, 0.76), rgba(14, 26, 45, 0.62))";

/**
 * Generates resilient CSS background style combining dark overlay, image URL, and fallback gradient
 * @param {string} mediaUrl - Path from MEDIA registry
 * @param {string} divisionKey - 'construction' | 'solar' | 'suppliers' | 'home'
 */
export function getHeroStyle(mediaUrl, divisionKey = 'default') {
  const fallback = GRADIENT_FALLBACKS[divisionKey] || GRADIENT_FALLBACKS.default;
  return {
    backgroundImage: `${DARK_OVERLAY}, url("${mediaUrl}"), ${fallback}`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat"
  };
}
