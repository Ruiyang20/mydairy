/**
 * Resize & compress an image File to a base64 data URL.
 * @param {File} file        - the original image file
 * @param {number} maxWidth  - max output width in px  (default 1200)
 * @param {number} maxHeight - max output height in px (default 900)
 * @param {number} quality   - JPEG quality 0-1        (default 0.82)
 * @returns {Promise<string>} base64 data URL
 */
export function resizeImage(file, maxWidth = 1200, maxHeight = 900, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.onload = () => {
        // Calculate new dimensions, preserving aspect ratio
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width  = Math.round(width  * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width  = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Prefer JPEG for photos; fall back to PNG for transparent images
        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl  = canvas.toDataURL(mimeType, quality);
        resolve(dataUrl);
      };
      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });
}
