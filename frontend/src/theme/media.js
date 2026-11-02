/**
 * SECTION 3: IMAGE & MEDIA INTEGRATION
 * Image mapping and asset registry from Visiting Cards + Billboard
 */

export const MEDIA = {
  // Backgrounds — these files go in frontend/public/assets/backgrounds/
  heroHome: "/assets/backgrounds/hero-home.jpg", // Billboard (Image 5)
  heroConstruction: "/assets/backgrounds/construction-hero.jpg", // Billboard
  heroSolar: "/assets/backgrounds/solar-hero.jpg", // Sundatta poster (Image 3)
  heroSuppliers: "/assets/backgrounds/suppliers-hero.jpg", // Stone gradient fallback
  aboutBanner: "/assets/backgrounds/about-banner.jpg", // Reserved
  contactBanner: "/assets/backgrounds/contact-banner.jpg", // Reserved

  // SVG silhouettes for 3D animations
  rammerSVG: "/assets/products/rammer.svg", // Tamping rammer outline
  compactorSVG: "/assets/products/compactor.svg", // Plate compactor outline
  solarPanelSVG: "/assets/products/solar-panel.svg", // Solar panel silhouette

  // Visiting card info (Image 1)
  visitingCard: {
    construction: {
      name: "Jay Malhar",
      phone1: "9158494138",
      phone2: "9096547260",
      description: "ॐ औम साई राम || All types of murum (soil) compaction work at fair rates.",
      location: "Shriram Chowk, Pathre Budruk, Tal. Sinnar, Dist. Nashik"
    },
    solar: {
      name: "Sundatta Renewables",
      phone1: "7774855520",
      phone2: "9096547260",
      tagline: "Your Roof Your Power",
      location: "Shriram Chowk, Pathre Budruk, Tal. Sinnar, Dist. Nashik"
    }
  }
};

/**
 * Branded Gradients for Graceful Fallback
 * Used underneath background images so missing/loading images still look stunning.
 */
export const GRADIENT_FALLBACKS = {
  home: "radial-gradient(ellipse at 50% 20%, #1e293b 0%, #0f172a 60%, #020617 100%)",
  construction: "radial-gradient(ellipse at 50% 20%, #451a03 0%, #1c1917 60%, #0c0a09 100%)",
  solar: "radial-gradient(ellipse at 50% 20%, #064e3b 0%, #022c22 60%, #020617 100%)",
  suppliers: "radial-gradient(ellipse at 50% 20%, #292524 0%, #1c1917 60%, #0a0a0a 100%)",
  default: "radial-gradient(ellipse at 50% 20%, #1e293b 0%, #0f172a 100%)"
};

/**
 * Dark Overlay
 * Guaranteed text legibility over any client-provided photo
 */
export const DARK_OVERLAY = "linear-gradient(rgba(2, 6, 23, 0.78), rgba(2, 6, 23, 0.65))";

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
