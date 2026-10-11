// Unified client-side upload & compression utility

export async function compressImage(fileOrDataUrl: File | string, maxDimension = 1600, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const processDataUrl = (dataUrl: string) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    };

    if (typeof fileOrDataUrl === 'string') {
      if (fileOrDataUrl.startsWith('data:image/')) {
        processDataUrl(fileOrDataUrl);
      } else {
        resolve(fileOrDataUrl);
      }
      return;
    }

    // If not an image, read directly
    if (!fileOrDataUrl.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(fileOrDataUrl);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (src) processDataUrl(src);
      else resolve('');
    };
    reader.onerror = reject;
    reader.readAsDataURL(fileOrDataUrl);
  });
}

export async function uploadImage(fileOrDataUrl: File | string, folder = 'posts'): Promise<string> {
  try {
    if (typeof fileOrDataUrl === 'string' && (fileOrDataUrl.startsWith('http://') || fileOrDataUrl.startsWith('https://'))) {
      return fileOrDataUrl;
    }

    const token = localStorage.getItem('motohippi_token');
    const apiBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const cleanBase = apiBase.replace(/\/api\/?$/, '').replace(/\/+$/, '');
    const uploadUrl = `${cleanBase}/api/upload`;

    const base64Data = await compressImage(fileOrDataUrl);

    const res = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ image: base64Data, folder }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.url) return data.url;
    }

    // Fallback to compressed data URL if upload service returned non-OK or no url
    return base64Data;
  } catch (err) {
    console.warn('Image upload endpoint unavailable, using inline data:', err);
    if (typeof fileOrDataUrl === 'string' && !fileOrDataUrl.startsWith('data:image/')) return fileOrDataUrl;
    return compressImage(fileOrDataUrl);
  }
}
