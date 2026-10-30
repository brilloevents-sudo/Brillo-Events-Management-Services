/**
 * Brillo Events Controlled Luxury Visual Effects Registry (v3.0)
 * Architectural Reference:
 * - shadergradient + @react-three/fiber (Hero & Brand Shader Wave)
 * - liquid-logo (Metallic Champagne Gold & Red Velvet Brand Emblem)
 * - liquid-glass-js (Backdrop-blur sticky headers & modal overlays)
 *
 * Performance Rule: Never mount continuous WebGL loops over data tables or form inputs.
 */

export const BRILLO_SHADER_PRESET = {
  color1: "#9B1B30", // Red Velvet
  color2: "#2B151A", // Deep Velvet Espresso
  color3: "#C68A12", // Champagne Gold
  uSpeed: 0.18,
  uStrength: 1.4,
  uDensity: 1.2,
  grain: "on" as const,
};

export const LIQUID_GLASS_TOKENS = {
  headerBlurPx: 12,
  modalBlurPx: 14,
  specularBorder: "1px solid rgba(232, 223, 224, 0.9)",
  surfaceAlpha: 0.86,
};
