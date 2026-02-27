const fs = require('fs');
const path = require('path');

const pkgPath = path.join(__dirname, '..', 'package.json');
const appPath = path.join(__dirname, '..', 'app.json');

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const app = JSON.parse(fs.readFileSync(appPath, 'utf8'));

if (app.expo) {
  app.expo.version = pkg.version;
  fs.writeFileSync(appPath, JSON.stringify(app, null, 2) + '\n');
}
