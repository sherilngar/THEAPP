// Usage: node scripts/qr.mjs https://<user>.github.io/so-ai-concierge/#/guest [out.png]
import QRCode from 'qrcode';

const [url, out = 'docs/guest-qr.png'] = process.argv.slice(2);
if (!url) {
  console.error(
    'Give the live guest-app URL, e.g. https://<user>.github.io/so-ai-concierge/#/guest',
  );
  process.exit(1);
}
await QRCode.toFile(out, url, {
  width: 1024,
  margin: 2,
  color: { dark: '#1C1A17', light: '#FFFFFF' },
});
console.log(`QR code for ${url} written to ${out}`);
