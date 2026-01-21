import { Resvg } from "@resvg/resvg-js";
import { writeFileSync, mkdirSync, existsSync } from "fs";

const sizes = [16, 48, 128];

function createShieldSvg(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">
    <defs>
      <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#60a5fa;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
      </linearGradient>
    </defs>
    <path d="M12 2L4 5v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V5l-8-3z" fill="url(#shieldGrad)" stroke="#2563eb" stroke-width="0.5"/>
    <path d="M9 12l2 2 4-4" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

const iconsDir = "./icons";

if (!existsSync(iconsDir)) {
  mkdirSync(iconsDir, { recursive: true });
}

for (const size of sizes) {
  const svg = createShieldSvg(size);

  const resvg = new Resvg(svg, {
    fitTo: {
      mode: "width",
      value: size,
    },
  });

  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  writeFileSync(`${iconsDir}/icon-${size}.png`, pngBuffer);
  console.log(`Created icon-${size}.png`);
}

console.log("\nAll icons generated successfully!");
