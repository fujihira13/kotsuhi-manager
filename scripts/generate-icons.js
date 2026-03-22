import { GoogleGenAI, Modality } from '@google/genai';
import { writeFileSync, mkdirSync } from 'fs';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env') });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const ASSETS_DIR = resolve(__dirname, '../mobile/assets/images');
const BACKUP_DIR = resolve(__dirname, '../image');

const icons = [
  {
    name: 'icon',
    outputFiles: [
      resolve(ASSETS_DIR, 'icon.png'),
      resolve(BACKUP_DIR, 'icon.png'),
    ],
    prompt: `
Create a premium mobile app icon for a Japanese transit expense tracking app "交通費ログ".

Canvas: 1024x1024 pixels. NO transparency — solid background only.

Design:
1. BACKGROUND: Rounded rectangle shape (corner radius ~22%), filled with a rich teal color #0a7ea4. The rounded rect occupies the full 1024x1024 canvas edge-to-edge. NO white margins around it.
2. ICON SYMBOL (centered, white, flat design):
   - Upper half: a sleek bullet train (shinkansen) silhouette viewed from the side. Aerodynamic nose pointing right, smooth horizontal body, 2–3 small rectangular windows. Pure white, no outlines.
   - A thin white horizontal divider line (width: 45% of canvas, stroke: 6px) below the train.
   - Lower half: a bold ¥ (yen) symbol in pure white, clean and geometric. Font-weight: heavy/black.
3. NO text, NO labels, NO app name on the icon.
4. Plenty of breathing room — the symbol group should fill about 55% of the canvas height, centered vertically.
5. Style: flat design, Apple App Store icon quality, crisp edges, no shadows, no glows.

Result: a clean, professional teal icon that reads perfectly at 29px and 1024px alike.
    `,
  },
  {
    name: 'android-icon-foreground',
    outputFiles: [
      resolve(ASSETS_DIR, 'android-icon-foreground.png'),
    ],
    prompt: `
Create an Android Adaptive Icon foreground layer for a Japanese transit expense tracking app.

Canvas: 1024x1024 pixels. Background: pure white (#FFFFFF).

Design (the icon content must fit within the center 66% safe zone — approx 680x680px centered):
1. WHITE BACKGROUND for the entire canvas.
2. In the center safe zone, place the icon symbol in TEAL color (#0a7ea4):
   - Upper portion: a sleek bullet train (shinkansen) silhouette viewed from the side. Aerodynamic nose pointing right, smooth horizontal body, 2–3 small rectangular windows. Solid teal fill.
   - A thin teal horizontal divider line below the train.
   - Lower portion: a bold ¥ (yen) symbol in solid teal. Clean and geometric.
3. The symbol group should be centered within the 680x680px safe zone, filling about 70% of that area.
4. NO text, NO labels, NO background shapes, NO shadows.
5. The outer margins (beyond the 680px safe zone) should be empty white — they may get clipped by Android.
6. Flat design, crisp edges, simple shapes.

This foreground will be composited over a teal background by Android's adaptive icon system.
    `,
  },
  {
    name: 'android-icon-background',
    outputFiles: [
      resolve(ASSETS_DIR, 'android-icon-background.png'),
    ],
    prompt: `
Create a simple solid color background image for an Android Adaptive Icon.

Canvas: 1024x1024 pixels.

Fill the ENTIRE canvas with a single flat solid color: teal #0a7ea4.
No gradients, no patterns, no shapes, no text, no elements whatsoever.
Just a perfectly uniform flat teal rectangle filling 100% of the 1024x1024 canvas.
    `,
  },
  {
    name: 'android-icon-monochrome',
    outputFiles: [
      resolve(ASSETS_DIR, 'android-icon-monochrome.png'),
    ],
    prompt: `
Create an Android monochrome (themed) icon for a Japanese transit expense tracking app.

Canvas: 1024x1024 pixels. Background: solid black (#000000).

Design (icon content must fit within the center 66% safe zone — approx 680x680px centered):
1. BLACK background for the entire canvas.
2. In the center safe zone, place the icon symbol in pure WHITE (#FFFFFF):
   - Upper portion: a sleek bullet train (shinkansen) silhouette viewed from the side. Aerodynamic nose pointing right, smooth horizontal body, 2–3 small rectangular windows. Solid white fill.
   - A thin white horizontal divider line below the train.
   - Lower portion: a bold ¥ (yen) symbol in solid white. Clean and geometric.
3. The symbol group should be centered within the 680x680px safe zone, filling about 70% of that area.
4. NO text, NO labels, NO gradients, NO shadows — just pure white shapes on black.
5. Flat design, crisp edges.

Android will apply its own tint color to this image for themed icon mode.
    `,
  },
];

async function generateIcon({ name, outputFiles, prompt }) {
  console.log(`\n🎨 ${name} を生成中...`);

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: prompt,
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });

  const parts = response.candidates?.[0]?.content?.parts ?? [];

  for (const part of parts) {
    if (part.inlineData?.data) {
      const imageBuffer = Buffer.from(part.inlineData.data, 'base64');
      for (const outputPath of outputFiles) {
        mkdirSync(dirname(outputPath), { recursive: true });
        writeFileSync(outputPath, imageBuffer);
        console.log(`  ✅ ${outputPath.replace(resolve(__dirname, '..'), '').replace(/\\/g, '/')} に保存`);
      }
      return;
    }
  }

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
  if (text) {
    console.error(`  ❌ 画像未生成: ${text}`);
  } else {
    console.error(`  ❌ 画像データが見つかりませんでした`);
  }
}

async function main() {
  console.log('🚀 アプリアイコン生成開始（4枚）');
  for (const icon of icons) {
    await generateIcon(icon);
  }
  console.log('\n🎉 全アイコン生成完了！');
}

main().catch((err) => {
  console.error('エラー:', err.message);
  process.exit(1);
});
