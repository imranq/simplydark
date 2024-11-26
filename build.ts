import { manifest } from './src/manifest';
import * as fs from 'fs';
import * as path from 'path';

// Ensure dist directory exists
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}

// Write manifest.json
fs.writeFileSync(
    path.join(distDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
);

console.log('Manifest file generated in dist/manifest.json');