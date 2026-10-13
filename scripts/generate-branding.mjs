import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const root = fileURLToPath(new URL("../", import.meta.url));
const directory = path.join(root, "assets/branding");
await mkdir(directory, { recursive: true });
const original = await readFile(path.join(directory, "source.svg"), "utf8");
const body = original.slice(
  original.indexOf(">") + 1,
  original.lastIndexOf("</svg>"),
);
const palette = {
  green: "#0c5947",
  cream: "#f4f0e4",
  lime: "#c4e38c",
  white: "#ffffff",
  ink: "#173d32",
};

// Measure the original alpha bounds to center the symbol, rather than its padded canvas.
const measurementSize = 2048;
const { data, info } = await sharp(Buffer.from(original))
  .resize(measurementSize, measurementSize)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
let left = info.width,
  top = info.height,
  right = 0,
  bottom = 0;
for (let y = 0; y < info.height; y++) {
  for (let x = 0; x < info.width; x++) {
    if (data[(y * info.width + x) * info.channels + 3] > 8) {
      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
    }
  }
}
const units = 105 / measurementSize;
const centerX = ((left + right) * units) / 2;
const centerY = ((top + bottom) * units) / 2;
const symbolHeight = (bottom - top + 1) * units;
function symbol(color, height = 700, x = 512, y = 512) {
  const scale = height / symbolHeight;
  return `<g transform="translate(${x} ${y}) scale(${scale}) translate(${-centerX} ${-centerY})">${body.replace(/#2C5837/gi, color)}</g>`;
}
function svg(inner, background = null) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">${background ? `<rect width="1024" height="1024" fill="${background}"/>` : ""}${inner}</svg>\n`;
}
const assets = {
  "logo-green": svg(symbol(palette.green, 740)),
  "logo-cream": svg(symbol(palette.cream, 740)),
  "logo-white": svg(symbol(palette.white, 740)),
  icon: svg(symbol(palette.lime), palette.green),
  "icon-light": svg(symbol(palette.green), palette.cream),
  "android-foreground": svg(symbol(palette.green, 540)),
  "android-monochrome": svg(symbol(palette.white, 540)),
  "splash-logo": svg(symbol(palette.green, 740)),
};
for (const [name, source] of Object.entries(assets)) {
  await writeFile(path.join(directory, `${name}.svg`), source);
  const raster = sharp(Buffer.from(source));
  if (name === "icon" || name === "icon-light") raster.removeAlpha();
  await raster.png().toFile(path.join(directory, `${name}.png`));
}
await sharp({
  create: { width: 1024, height: 1024, channels: 3, background: palette.cream },
})
  .png()
  .toFile(path.join(directory, "android-background.png"));

// A compact review sheet; the icons themselves keep square corners for platform masking.
const previews = [
  { name: "icon", label: "Ícono principal", background: palette.cream },
  { name: "icon-light", label: "Variante clara", background: palette.cream },
  { name: "logo-green", label: "Logo transparente", background: palette.white },
];
const composites = [];
for (let index = 0; index < previews.length; index++) {
  const item = previews[index];
  const tile = await sharp({
    create: {
      width: 320,
      height: 360,
      channels: 4,
      background: item.background,
    },
  })
    .composite([
      {
        input: await sharp(path.join(directory, `${item.name}.png`))
          .resize(264, 264)
          .toBuffer(),
        left: 28,
        top: 20,
      },
      {
        input: Buffer.from(
          `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="60"><text x="160" y="34" text-anchor="middle" font-family="sans-serif" font-size="19" fill="${palette.ink}">${item.label}</text></svg>`,
        ),
        left: 0,
        top: 290,
      },
    ])
    .png()
    .toBuffer();
  composites.push({ input: tile, left: 20 + index * 340, top: 20 });
}
await sharp({
  create: { width: 1040, height: 400, channels: 3, background: palette.cream },
})
  .composite(composites)
  .png()
  .toFile(path.join(directory, "preview.png"));
console.log(
  `Generated ${Object.keys(assets).length} SVG/PNG assets, Android background and preview in ${directory}`,
);
