const fs = require('fs');
const path = require('path');

// Set the directory where the script and output files are located
const directoryPath = path.join(__dirname, '../');

// Get the current timestamp to add uniqueness to the file name
const timestamp = new Date().toISOString().replace(/:/g, '-');
const outputFile = path.join(__dirname, 'CSS_FILES_SNAPSHOT.txt');

const excludeDirectories = ['node_modules', '.bin', 'logs', 'snapshot_tools'];  // Exclude irrelevant directories

// Overwrite file
fs.writeFileSync(outputFile, 'CSS files snapshot content');
console.log('CSS snapshot generated and file overwritten.');

// Context Comment for the ChatGPT review
const contextComment = `
/*
===============================
CSS Files Snapshot - Context
===============================

I am sharing this snapshot for you to review all CSS files in the project. Please do the following:

1. Review the CSS files to ensure they align with the latest updates in the project.
2. Confirm that the styles are consistent with changes made to the HTML and JavaScript.
3. If there are any style-related changes needed (e.g., after adding OpenAI functionality), ensure they are reflected across all relevant CSS files.

This snapshot includes only the CSS files, ensuring the style structure is aligned with the current project state.

**Important Note:** Please avoid long-winded responses. I prefer simple, direct instructions to keep the process efficient.

- Generated on: ${new Date().toLocaleString()}
*/\n\n`;

// Function to get CSS file contents
function getCSSFilesContent(rootDir) {
  let cssContents = "";

  fs.readdirSync(rootDir).forEach(file => {
    const filePath = path.join(rootDir, file);
    const stats = fs.statSync(filePath);

    // Skip directories that are in the excludeDirectories list
    if (stats.isDirectory()) {
      if (!excludeDirectories.includes(file)) {
        cssContents += getCSSFilesContent(filePath);  // Recursively handle directories
      }
    } else {
      const extension = path.extname(file);
      if (extension === '.css') {
        // Ensure the file has contents before appending
        const content = fs.readFileSync(filePath, 'utf-8');
        if (content) {
          cssContents += `#### **/${file}**\n\`\`\`\n${content}\n\`\`\`\n\n`;
        }
      }
    }
  });

  return cssContents;
}

const cssFilesContent = getCSSFilesContent(directoryPath);

if (!cssFilesContent) {
  console.error("No CSS files were found or collected.");
} else {
  // Write to the snapshot file in the `snapshot_tools` folder
  fs.writeFileSync(outputFile, contextComment + cssFilesContent);
  console.log(`CSS files snapshot saved to ${outputFile}`);
}