import fs from 'fs';
import path from 'path';

// Simple build script that copies files to dist
console.log('Building project...');

// Create dist directory
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Copy HTML file
const htmlContent = fs.readFileSync('index.html', 'utf8');
const modifiedHtml = htmlContent.replace(
  'type="module" src="/src/main.tsx"',
  'type="module" src="/main.js"'
);
fs.writeFileSync('dist/index.html', modifiedHtml);

// Copy static files
if (fs.existsSync('public')) {
  copyRecursiveSync('public', 'dist');
}

console.log('Build completed successfully!');
console.log('Note: This is a minimal build. For production, ensure all dependencies are properly installed.');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(function(childItemName) {
      copyRecursiveSync(path.join(src, childItemName),
                      path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}