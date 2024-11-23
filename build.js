import { exec } from 'child_process';
import path from 'path';

async function runBuild() {
  return new Promise((resolve, reject) => {
    const buildProcess = exec(
      'next build', 
      { 
        env: { ...process.env },
        cwd: path.resolve(process.cwd())
      }, 
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Build Error: ${error.message}`);
          reject(error);
          return;
        }
        if (stderr) {
          console.error(`Build Stderr: ${stderr}`);
        }
        console.log(`Build Output: ${stdout}`);
        resolve();
      }
    );

    buildProcess.stdout.on('data', (data) => {
      console.log(data);
    });

    buildProcess.stderr.on('data', (data) => {
      console.error(data);
    });
  });
}

runBuild().catch(console.error);

export default runBuild;