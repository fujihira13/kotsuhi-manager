import { GoogleGenAI, Modality } from '@google/genai';
import { writeFileSync, mkdirSync } from 'fs';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env') });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const prompt = `
Create a mobile app splash screen icon for "交通費ログ" (TransitLedger), a Japanese personal transit expense tracking app.

Canvas: 1024x1024 pixels, pure white (#FFFFFF) background.

Visual composition (follow exactly):

1. BACKGROUND: Pure white (#FFFFFF), flat, no shadows outside the main shape.

2. MAIN SHAPE: A large rounded rectangle (90% of canvas, centered), filled with solid teal #0a7ea4. Corner radius ~22%. No gradient.

3. ICON SYMBOL inside (centered, white, flat design):
   - A sleek bullet train (shinkansen) silhouette viewed from the side. The aerodynamic nose MUST point to the RIGHT (←鼻が右向き). Smooth horizontal body, 3–4 small rectangular windows. Pure white fill.
   - Beneath the train: a thin white horizontal line (width: 50% of card).
   - Below the line: a bold ¥ symbol in pure white.
   - Below the ¥: Japanese text "交通費ログ" in clean white bold sans-serif.

4. The train MUST face RIGHT — the pointy aerodynamic nose is on the RIGHT side, the tail/rear is on the LEFT side.

5. NO shadows, NO gradients on shapes, NO extra decorations.

Style: flat design, clean, professional Japanese app icon.`;

async function generateSplash() {
  console.log('🎨 スプラッシュ画像を生成中...');

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
      const outputDir = resolve(__dirname, '../image');
      mkdirSync(outputDir, { recursive: true });
      const outputPath = resolve(outputDir, 'splash_v3.png');
      writeFileSync(outputPath, imageBuffer);
      console.log(`✅ image/splash_v3.png に保存しました`);

      // mobile/assets/images/splash-icon.png にもコピー
      const mobileAssetsDir = resolve(__dirname, '../mobile/assets/images');
      const splashIconPath = resolve(mobileAssetsDir, 'splash-icon.png');
      writeFileSync(splashIconPath, imageBuffer);
      console.log(`✅ mobile/assets/images/splash-icon.png にも保存しました`);
      return;
    }
  }

  // テキストレスポンスのみ返ってきた場合
  const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
  if (text) {
    console.error('❌ 画像が生成されませんでした。モデルの応答:', text);
  } else {
    console.error('❌ 画像データが見つかりませんでした');
  }
}

generateSplash().catch((err) => {
  console.error('エラー:', err.message);
  process.exit(1);
});
