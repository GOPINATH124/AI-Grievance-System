const fs = require('fs');
const path = 'C:\\Users\\Gopinath\\.gemini\\antigravity-ide\\brain\\63bd3dff-8858-4274-b06c-f1bae51a38d4\\.system_generated\\logs\\transcript.jsonl';
const fileContent = fs.readFileSync(path, 'utf8');
const lines = fileContent.split('\n');
console.log("Total lines:", lines.length);

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes("Health Department") || line.includes("Medical Officer")) {
    console.log(`Line ${i}:`);
    try {
      const content = JSON.parse(line).content || "";
      const idx = content.indexOf("Health Department");
      if (idx !== -1) {
        console.log(content.substring(Math.max(0, idx - 500), Math.min(content.length, idx + 1500)));
      }
    } catch(e) {
      console.log("Error parsing line " + i);
    }
  }
}
