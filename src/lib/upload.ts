// Unified client-side upload & compression utility

export async function compressImage(file: File, maxDimension = 1600, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    // If not an image, read directly
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
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
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function uploadImage(fileOrDataUrl: File | string, folder = 'posts'): Promise<string> {
  try {
    const token = localStorage.getItem('motohippi_token');
    const apiBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const cleanBase = apiBase.replace(/\/api\/?$/, '').replace(/\/+$/, '');
    const uploadUrl = `${cleanBase}/api/upload`;

    let base64Data: string;
    if (typeof fileOrDataUrl === 'string') {
      base64Data = fileOrDataUrl;
    } else {
      base64Data = await compressImage(fileOrDataUrl);
    }

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

    // Fallback to data URL if upload service returned non-OK or no url
    return base64Data;
  } catch (err) {
    console.warn('Image upload endpoint unavailable, using inline data:', err);
    if (typeof fileOrDataUrl === 'string') return fileOrDataUrl;
    return compressImage(fileOrDataUrl);
  }
}
