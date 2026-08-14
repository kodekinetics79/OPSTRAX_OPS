import { copyFileSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const distDir = join(root, 'dist');
const assets = ['index.html', 'app.js', 'styles.css', 'warehouse.html', 'warehouse-console.js', 'warehouse-ux.js', 'warehouse.css'];

rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });

for (const file of assets) {
  copyFileSync(join(root, file), join(distDir, file));
}

writeFileSync(
  join(distDir, 'build.json'),
  JSON.stringify(
    {
      builtAt: new Date().toISOString(),
      assets
    },
    null,
    2
  )
);

console.log(`Built frontend assets in ${distDir}`);
