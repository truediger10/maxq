const fs = require('fs');
const path = require('path');

// Set the directory where the script and output files are located
const directoryPath = path.join(__dirname, '../');

// Get the current timestamp to add uniqueness to the file name
const timestamp = new Date().toISOString().replace(/:/g, '-');
const outputFile = path.join(__dirname, 'PROJECT_SNAPSHOT.txt');
const logFilePath = path.join(directoryPath, 'logs', 'app.log');

// Optional: delete the file if it exists (for assurance)
if (fs.existsSync(outputFile)) {
  fs.unlinkSync(outputFile);
}

// Now write the new snapshot
fs.writeFileSync(outputFile, 'Your new snapshot content');
console.log('Project snapshot generated and file overwritten.');

// Context Comment for the ChatGPT review
const contextComment = `
/*
===============================
Project Snapshot - Context
===============================

I am sharing this project snapshot for you to review and ensure continuity across conversations. Please do the following:

1. Review the project setup, directory structure, error logs, and to-do list for full context.
2. Ensure the current project state aligns with previous discussions or decisions.
3. Assess any pending changes or issues across all relevant files (e.g., routes, controllers, API integration) to confirm that updates are properly applied.
4. When suggesting changes, check all interconnected files (e.g., server.js, routes, controllers, client-side scripts) to ensure the update will not break functionality elsewhere in the app.

**Preferred Workflow:**
- I prefer sharing entire updated files rather than code snippets.
- If snippets are shared, they must be clearly labeled, specifying exactly where they go in the project (file name, directory, etc.), and include in-depth comments for clarity.
- I have minimal technical coding knowledge, so make sure explanations are straightforward, concise, and accompanied by clear instructions.
- Provide well-commented code and easily navigable documents to make it easy for me to understand the changes.
- If additional information or clarification is needed to make an informed decision, confirm with me before proceeding.

**Important Note:** Please avoid long-winded responses. I prefer simple, direct instructions to keep the process efficient.

- Generated on: ${new Date().toLocaleString()}
*/\n\n`;

// Define your project information
const projectInfo = `
### Project Snapshot

**Tech Stack:**
- Backend: Node.js, Express.js
- APIs: RocketLaunch.Live, OpenAI API
- Frontend: Vanilla JavaScript, HTML5, CSS3
- Libraries/Modules: Axios, dotenv, Winston (for logging), NodeCache (for caching)

**Current Workflow:**
1. **Data Flow:** RocketLaunchClient fetches rocket launch data -> OpenAIClient enriches data -> Enriched data is served through LaunchController.
2. **Caching:** NodeCache is used for caching both rocket launch data and enriched data (OpenAI responses) for 24 hours.
3. **Error Handling:** Logger logs errors when data enrichment or fetching fails, and fallback data is served when enrichment fails.

**Directory Structure:**
`;

// Function to get directory structure
function getDirectoryStructure(rootDir) {
  let projectStructure = "";

  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg']; // Skip images
  fs.readdirSync(rootDir).forEach(file => {
    const filePath = path.join(rootDir, file);
    const stats = fs.statSync(filePath);

    if (file === 'node_modules' || file.startsWith('.') || imageExtensions.some(ext => file.endsWith(ext))) {
      return;
    }

    if (stats.isDirectory()) {
      projectStructure += `- **/${file}**\n`;
      projectStructure += getDirectoryStructure(filePath);
    } else {
      projectStructure += `  - ${file}\n`;
    }
  });

  return projectStructure;
}

// Generate Change Log
const changeLog = `
### Change Log:
- [2024-10-08]: Integrated OpenAI API with launch data enrichment.
- [2024-10-05]: Implemented NodeCache for enriched data caching.
- [2024-10-01]: Resolved API authentication issues.
`;

// Generate To-Do List
const toDoList = `
### To-Do List:
- [x] Review OpenAIClient.js for error handling.
- [ ] Test enriched data caching and fallback strategies.
- [ ] Improve error logging across API endpoints.
`;

// Read from `app.log` file for error logs
function getErrorLogs() {
  if (fs.existsSync(logFilePath)) {
    const errorLogContent = fs.readFileSync(logFilePath, 'utf-8');
    return `
    ### Error Log:
    \n${errorLogContent}\n
    `;
  } else {
    return `
    ### Error Log:
    - No recent errors logged in app.log.
    `;
  }
}

// Combine all sections
const projectStructure = getDirectoryStructure(directoryPath);
const errorLog = getErrorLogs();

const snapshotContent = `
${contextComment}
${projectInfo}
${projectStructure}
---
${changeLog}
${toDoList}
${errorLog}
`;

// Write to the snapshot file in the `snapshot_tools` folder
fs.writeFileSync(outputFile, snapshotContent);
console.log(`Project snapshot saved to ${outputFile}`);