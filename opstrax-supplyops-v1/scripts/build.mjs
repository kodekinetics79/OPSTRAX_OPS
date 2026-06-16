import { copyFileSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const distDir = join(root, 'dist');

rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });

for (const file of ['index.html', 'app.js', 'styles.css']) {
  copyFileSync(join(root, file), join(distDir, file));
}

writeFileSync(
  join(distDir, 'build.json'),
  JSON.stringify(
    {
      builtAt: new Date().toISOString(),
      assets: ['index.html', 'app.js', 'styles.css']
    },
    null,
    2
  )
);

console.log(`Built frontend assets in ${distDir}`);
