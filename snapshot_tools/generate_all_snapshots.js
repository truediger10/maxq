const { exec } = require('child_process');

// Define paths for the scripts to generate each snapshot
const scripts = [
  'node generate_project_snapshot.js',
  'node generate_content_files.js',
  'node generate_css_files.js'
];

// Execute each snapshot script
scripts.forEach(script => {
  exec(script, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing ${script}: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Error output from ${script}: ${stderr}`);
      return;
    }
    console.log(`Output from ${script}:\n${stdout}`);
  });
});

console.log('All snapshots are being generated and old files will be overwritten...');