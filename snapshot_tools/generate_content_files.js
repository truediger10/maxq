const fs = require('fs');
const path = require('path');

// Set the directory where the script and output files are located
const directoryPath = path.join(__dirname, '../');

// Get the current timestamp to add uniqueness to the file name
const timestamp = new Date().toISOString().replace(/:/g, '-');
const outputFile = path.join(__dirname, 'CONTENT_FILES_SNAPSHOT.txt');

const filesToInclude = ['.js', '.html', '.json', 'controller', 'routes'];  // Define file types to include

const excludeDirectories = ['node_modules', '.bin', 'logs', 'snapshot_tools'];  // Exclude irrelevant directories

// Context Comment for the ChatGPT review
const contextComment = `
/*
===============================
Content Files Snapshot - Context
===============================

I am sharing this content files snapshot for you to review all key files in the project. Please do the following:

1. Review the content of the important files (e.g., .js, .html, .json, controllers, routes) to ensure they align with the current state of the project.
2. Confirm that the file contents are up-to-date and consistent across files.
3. If we are implementing changes (such as integrating OpenAI), ensure that the updates are applied to all relevant files (controllers, routes, etc.) to maintain compatibility across the project.

This snapshot includes the core content files necessary to continue working on the project.

**Important Note:** Please avoid long-winded responses. I prefer simple, direct instructions to keep the process efficient.

- Generated on: ${new Date().toLocaleString()}
*/\n\n`;

// Function to get the content of important files
function getContentOfFiles(rootDir) {
  let fileContents = "";

  fs.readdirSync(rootDir).forEach(file => {
    const filePath = path.join(rootDir, file);
    const stats = fs.statSync(filePath);

    // Skip directories that are in the excludeDirectories list
    if (stats.isDirectory()) {
      if (!excludeDirectories.includes(file)) {
        fileContents += getContentOfFiles(filePath);  // Recursively handle directories
      }
    } else {
      const extension = path.extname(file);
      if (filesToInclude.some(ext => file.endsWith(ext))) {
        // Ensure the file has contents before appending
        const content = fs.readFileSync(filePath, 'utf-8');
        if (content) {
          fileContents += `#### **/${file}**\n\`\`\`\n${content}\n\`\`\`\n\n`;
        }
      }
    }
  });

  return fileContents;
}

const contentFiles = getContentOfFiles(directoryPath);

if (!contentFiles) {
  console.error("No content files were found or collected.");
} else {
  // Write to the snapshot file in the `snapshot_tools` folder
  fs.writeFileSync(outputFile, contextComment + contentFiles);
  console.log(`Content files snapshot saved to ${outputFile}`);
}