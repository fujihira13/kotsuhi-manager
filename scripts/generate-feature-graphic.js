import { GoogleGenAI, Modality } from '@google/genai';
import { writeFileSync, mkdirSync } from 'fs';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env') });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const prompt = `
Create a feature graphic banner for "交通費マネージャー" (TransitLedger), a Japanese personal transit expense tracking app.

Canvas: exactly 1024x500 pixels, landscape orientation.

Background: smooth horizontal gradient from light blue #E6F4FE on the left to teal #0a7ea4 on the right.

Left area (leftmost 40% of canvas, vertically centered):
  - A large rounded square (about 180x180px) with solid #0a7ea4 fill and white border (~4px)
  - Inside the rounded square: a white flat shinkansen bullet train silhouette viewed from the side, aerodynamic nose pointing RIGHT
  - Below the train inside the square: a thin white horizontal line
  - Below the line: bold white ¥ symbol

Right area (rightmost 55% of canvas, vertically centered, left-aligned):
  - App name "交通費マネージャー" in large (52px) bold white sans-serif font, top line
  - Tagline "交通費をかんたんに記録・管理" in smaller (26px) white sans-serif font, below app name, slight transparency or lighter weight

Style: flat design, clean, professional. No drop shadows, no complex textures. Safe zone: keep all text and logo at least 40px from any edge.`;

async function generateFeatureGraphic() {
  console.log('🎨 フィーチャーグラフィックを生成中...');

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
      const outputPath = resolve(outputDir, 'feature-graphic.png');
      writeFileSync(outputPath, imageBuffer);
      console.log(`✅ image/feature-graphic.png に保存しました`);

      const mobileAssetsDir = resolve(__dirname, '../mobile/assets/images');
      mkdirSync(mobileAssetsDir, { recursive: true });
      const mobileOutputPath = resolve(mobileAssetsDir, 'feature-graphic.png');
      writeFileSync(mobileOutputPath, imageBuffer);
      console.log(`✅ mobile/assets/images/feature-graphic.png にも保存しました`);
      return;
    }
  }

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
  if (text) {
    console.error('❌ 画像が生成されませんでした。モデルの応答:', text);
  } else {
    console.error('❌ 画像データが見つかりませんでした');
  }
}

generateFeatureGraphic().catch((err) => {
  console.error('エラー:', err.message);
  process.exit(1);
});
