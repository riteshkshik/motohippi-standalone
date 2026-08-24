declare global {
  interface Window {
    Cashfree?: any;
  }
}

let cashfreeLoadPromise: Promise<any> | null = null;

export function loadCashfreeSDK(): Promise<any> {
  if (cashfreeLoadPromise) return cashfreeLoadPromise;

  cashfreeLoadPromise = new Promise((resolve, reject) => {
    if (window.Cashfree) {
      resolve(window.Cashfree);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.onload = () => {
      if (window.Cashfree) {
        resolve(window.Cashfree);
      } else {
        reject(new Error('Cashfree SDK failed to initialize'));
      }
    };
    script.onerror = () => {
      cashfreeLoadPromise = null;
      reject(new Error('Failed to load Cashfree SDK script'));
    };
    document.head.appendChild(script);
  });

  return cashfreeLoadPromise;
}

export async function checkoutWithCashfree(
  paymentSessionId: string,
  mode: 'sandbox' | 'production' = 'sandbox',
  redirectTarget: '_modal' | '_self' = '_modal'
): Promise<any> {
  const Cashfree = await loadCashfreeSDK();
  const cashfree = Cashfree({ mode });

  return cashfree.checkout({
    paymentSessionId,
    redirectTarget,
  });
}
