// One-time cleanup script — removes leftover lines 809-958 from DepartmentManager.jsx
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'DepartmentManager.jsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log('Total lines before:', lines.length);

// Keep lines 0-807 (indices) and 958-end (indices)
// In 1-indexed terms: keep lines 1-808, discard 809-958, keep 959-end
const kept = [...lines.slice(0, 808), ...lines.slice(958)];

console.log('Total lines after:', kept.length);
console.log('Line 807 (0-indexed 806):', lines[806]);
console.log('Line 808 (0-indexed 807):', lines[807]);
console.log('Line 959 (0-indexed 958):', lines[958]);

fs.writeFileSync(filePath, kept.join('\n'), 'utf8');
console.log('Done! File written successfully.');
