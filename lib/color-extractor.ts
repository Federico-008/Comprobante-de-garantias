const ColorThief = require('colorthief').default || require('colorthief');

/**
 * Convierte un arreglo [r, g, b] a hex string '#rrggbb'
 */
const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

/**
 * Extrae el color dominante de una imagen en base64 (dataUrl)
 */
export async function extractDominantColor(
  imageUrl: string
): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.onload = () => {
        try {
          const colorThief = new ColorThief();
          const color = colorThief.getColor(img);
          if (color && color.length >= 3) {
            resolve(rgbToHex(color[0], color[1], color[2]));
          } else {
            resolve(null);
          }
        } catch (e) {
          console.error('Error extracting color:', e);
          resolve(null);
        }
      };
      img.onerror = () => {
        console.error('Error loading image for color extraction');
        resolve(null);
      };
      img.src = imageUrl;
    } catch (e) {
      console.error('Error in extractDominantColor:', e);
      resolve(null);
    }
  });
}

/**
 * Extrae una paleta de colores de una imagen
 */
export async function extractColorPalette(
  imageUrl: string,
  colorCount: number = 5
): Promise<string[]> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.onload = () => {
        try {
          const colorThief = new ColorThief();
          const palette = colorThief.getPalette(img, colorCount);
          if (palette && palette.length > 0) {
            const hexPalette = palette.map((color: any) => rgbToHex(color[0], color[1], color[2]));
            resolve(hexPalette);
          } else {
            resolve([]);
          }
        } catch (e) {
          console.error('Error extracting palette:', e);
          resolve([]);
        }
      };
      img.onerror = () => {
        console.error('Error loading image for palette extraction');
        resolve([]);
      };
      img.src = imageUrl;
    } catch (e) {
      console.error('Error in extractColorPalette:', e);
      resolve([]);
    }
  });
}
