import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

/** QR code for the guest app at the current deployment's address. */
export function QrCode({ path = '#/guest', size = 176 }: { path?: string; size?: number }) {
  const [svg, setSvg] = useState<string>('');
  const url = `${window.location.origin}${window.location.pathname}${path}`;
  useEffect(() => {
    let alive = true;
    QRCode.toString(url, {
      type: 'svg',
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#1C1A17', light: '#FFFFFF' },
    })
      .then((s) => alive && setSvg(s))
      .catch(() => alive && setSvg(''));
    return () => {
      alive = false;
    };
  }, [url]);
  return (
    <figure className="flex flex-col items-center gap-2">
      <div
        className="rounded-2xl bg-white p-3 shadow-soft"
        style={{ width: size, height: size }}
        role="img"
        aria-label={`QR code to open the guest app: ${url}`}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <figcaption className="max-w-[220px] break-all text-center text-xs text-muted">
        {url}
      </figcaption>
    </figure>
  );
}
