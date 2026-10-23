#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const packageJsonPath = path.resolve(__dirname, '..', 'package.json');

if (!fs.existsSync(packageJsonPath)) {
  console.error('Error: package.json not found at', packageJsonPath);
  process.exit(1);
}

const raw = fs.readFileSync(packageJsonPath, 'utf8');
const pkg = JSON.parse(raw);

const type = process.argv[2] || 'patch'; // 'patch', 'minor', 'major'
const currentVersion = pkg.version || '1.0.0';
const parts = currentVersion.split('.').map((n) => parseInt(n, 10));

if (parts.length !== 3 || parts.some(isNaN)) {
  console.error(`Error: Invalid semver version "${currentVersion}" in package.json`);
  process.exit(1);
}

let [major, minor, patch] = parts;

switch (type.toLowerCase()) {
  case 'major':
    major += 1;
    minor = 0;
    patch = 0;
    break;
  case 'minor':
    minor += 1;
    patch = 0;
    break;
  case 'patch':
  default:
    patch += 1;
    break;
}

const newVersion = `${major}.${minor}.${patch}`;
pkg.version = newVersion;

fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');

console.log(`\n🚀 [esmeringle] Version bumped: v${currentVersion} ➔ v${newVersion} (${type})`);
console.log(`   Updated: package.json\n`);
