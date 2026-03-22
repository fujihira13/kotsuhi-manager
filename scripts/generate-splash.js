import { GoogleGenAI, Modality } from '@google/genai';
import { writeFileSync, mkdirSync } from 'fs';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env') });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const prompt = `
Create a mobile app splash screen for "交通費ログ" (TransitLedger), a Japanese personal expense tracking app.

Design specifications:
- Portrait orientation, suitable for mobile splash screen (1080x1920)
- Minimalist, clean design with a professional look
- Primary accent color: teal blue (#0a7ea4)
- White or very light background
- Central icon: a stylized combination of a train/transit symbol and a wallet/receipt icon
- App name in Japanese: "交通費ログ" in clean, modern typography
- Subtitle in smaller text: "交通費・交際費の記録"
- Subtle decorative elements: thin lines or geometric shapes suggesting movement/transit
- No clutter, plenty of white space
- Modern flat design style
`;

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
      const outputPath = resolve(outputDir, 'splash.png');
      writeFileSync(outputPath, imageBuffer);
      console.log(`✅ image/splash.png に保存しました`);
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
