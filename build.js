import { exec } from 'child_process';

function runBuild() {
  const buildProcess = exec('next build', (error, stdout, stderr) => {
    if (error) {
      console.error(`Build Error: ${error.message}`);
      process.exit(1);
    }
    if (stderr) {
      console.error(`Build Stderr: ${stderr}`);
      process.exit(1);
    }
    console.log(`Build Output: ${stdout}`);
  });

  buildProcess.stdout.on('data', (data) => {
    console.log(data);
  });

  buildProcess.stderr.on('data', (data) => {
    console.error(data);
  });
}

runBuild();

export default runBuild;
