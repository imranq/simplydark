import * as fs from 'fs';
import * as path from 'path';
const DIST_DIR = 'dist';
// Ensure dist directory exists
if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR);
}
// Copy manifest.json to dist
fs.copyFileSync(path.join('src', 'manifest.json'), path.join(DIST_DIR, 'manifest.json'));
console.log('✅ Build completed successfully!');
