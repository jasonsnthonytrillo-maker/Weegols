import { hexToRgb } from './helpers';

/**
 * Applies the tenant's primary color to the entire application by overriding CSS variables.
 * @param {string} primaryColor - Hex color code (e.g., #f97316)
 */
export function applyTheme(primaryColor) {
  let styleTag = document.getElementById('dynamic-branding-style');
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = 'dynamic-branding-style';
    document.head.appendChild(styleTag);
  }

  styleTag.innerHTML = `
    :root {
      --primary-50: 240, 253, 244 !important;
      --primary-100: 220, 252, 231 !important;
      --primary-200: 187, 247, 208 !important;
      --primary-300: 134, 239, 172 !important;
      --primary-400: 74, 222, 128 !important;
      --primary-500: 22, 163, 74 !important;
      --primary-600: 21, 128, 61 !important;
      --primary-700: 22, 101, 52 !important;
      --primary-800: 20, 83, 45 !important;
      --primary-900: 20, 83, 45 !important;
    }
  `;

  const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
  const values = {
    50: "240, 253, 244",
    100: "220, 252, 231",
    200: "187, 247, 208",
    300: "134, 239, 172",
    400: "74, 222, 128",
    500: "22, 163, 74",
    600: "21, 128, 61",
    700: "22, 101, 52",
    800: "20, 83, 45",
    900: "20, 83, 45"
  };
  shades.forEach(shade => {
    document.documentElement.style.setProperty(`--primary-${shade}`, values[shade]);
  });
}

/**
 * Removes all dynamic branding styles and returns the application to default colors.
 */
export function clearTheme() {
  // Remove the high-priority style tag
  const styleTag = document.getElementById('dynamic-branding-style');
  if (styleTag) {
    styleTag.remove();
  }
  
  // Clear the inline properties from document element
  const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
  shades.forEach(shade => {
    document.documentElement.style.removeProperty(`--primary-${shade}`);
  });
}
