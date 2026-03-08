const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'page.tsx');
try {
    const content = fs.readFileSync(filePath, 'utf8');
    // Find the generateSystemPrompt function
    const startIdx = content.indexOf('const generateSystemPrompt =');
    const endIdx = content.indexOf('const systemPromptString = generateSystemPrompt', startIdx);
    
    if (startIdx !== -1 && endIdx !== -1) {
        console.log('--- START ---');
        console.log(content.substring(startIdx, endIdx));
        console.log('--- END ---');
    } else {
        console.log('Could not find generateSystemPrompt');
    }
} catch (e) {
    console.error(e);
}
