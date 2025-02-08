import { spawn } from "child_process";

export async function resizeImage(imageData: string, scale: number = 50): Promise<string> {
  return new Promise((resolve, reject) => {
    // Remove the data:image/jpeg;base64, prefix
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, 'base64');

    const convert = spawn('convert', [
      '-',  // Read from stdin
      '-resize', `${scale}%`,
      'jpeg:-'  // Output as JPEG to stdout
    ]);

    let outputBuffer = Buffer.from([]);
    let errorOutput = '';

    convert.stdout.on('data', (data) => {
      outputBuffer = Buffer.concat([outputBuffer, data]);
    });

    convert.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    convert.on('close', (code) => {
      if (code !== 0) {
        console.error('Image resize error:', errorOutput);
        reject(new Error('Failed to resize image'));
        return;
      }

      const resizedBase64 = outputBuffer.toString('base64');
      resolve(`data:image/jpeg;base64,${resizedBase64}`);
    });

    convert.stdin.write(imageBuffer);
    convert.stdin.end();
  });
}
