
import { createCanvas } from 'canvas';
import * as fs from 'fs';
import * as path from 'path';

export class SignatureImageGenerator {
  private outputDir: string;

  constructor(outputDir: string = './temp/signatures') {
    this.outputDir = outputDir;
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async generateSignatureImage(signatureId: string, signatureData: string): Promise<string> {
    const width = 400;
    const height = 100;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Fill background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Set font and color
    ctx.font = '30px Arial';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw signature data (for now, just text)
    ctx.fillText(signatureData, width / 2, height / 2);

    const filePath = path.join(this.outputDir, `${signatureId}.png`);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filePath, buffer);

    return filePath;
  }
}
