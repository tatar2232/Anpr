import { readFileSync } from "fs";
import { join } from "path";
import { spawn } from "child_process";

interface DetectionResult {
  plateNumber: string;
  confidence: number;
}

export async function detectLicensePlate(imageData: string): Promise<DetectionResult | null> {
  // Remove the data:image/jpeg;base64, prefix
  const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
  const imageBuffer = Buffer.from(base64Data, 'base64');

  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python3', [
      join(process.cwd(), 'server', 'services', 'detect_plate.py'),
      '--model', join(process.cwd(), 'attached_assets', 'Yolov8-ANPR.v1i.yolov8.zip'),
      '--image', '-'  // Read from stdin
    ]);

    pythonProcess.stdin.write(imageBuffer);
    pythonProcess.stdin.end();

    let result = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('ANPR Error:', error);
        resolve(null);
        return;
      }

      try {
        const detection = JSON.parse(result);
        resolve({
          plateNumber: detection.plate_number,
          confidence: detection.confidence
        });
      } catch (err) {
        console.error('Failed to parse ANPR result:', err);
        resolve(null);
      }
    });
  });
}
