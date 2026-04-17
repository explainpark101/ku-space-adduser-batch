import { createWriteStream, readFileSync, readdirSync, existsSync, mkdirSync, copyFileSync, writeFileSync, rmSync } from 'fs';
import { readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';
import archiver from 'archiver';
import cliProgress from 'cli-progress';
import fg from 'fast-glob';
import { manifest } from '../src/manifest';


const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const distDir = join(rootDir, 'dist');
const srcDir = join(rootDir, 'src');
const versionsDir = join(rootDir, 'versions');

const findAllTSFilesFromJSON = (json: any): string[] => {
  return Object.entries(json).flatMap(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      return findAllTSFilesFromJSON(value);
    }
    if (typeof value === 'string' && value.endsWith('.ts')) {
      return [value];
    }
    return [];
  });
};

const changeEveryTS2JSFromJSON = (json: chrome.runtime.ManifestV3): chrome.runtime.ManifestV3 => {
  const transform = (value: unknown): unknown => {
    if (typeof value === 'string') value = value.replaceAll('\\', '/');
    if (typeof value === 'string' && value.endsWith('.ts')) {
      return value.replace(/\.ts$/, '.js');
    }
    if (Array.isArray(value)) {
      return value.map(transform);
    }
    if (typeof value === 'object' && value !== null) {
      return Object.fromEntries(
        Object.entries(value).map(([k, v]) => [k, transform(v)])
      );
    }
    return value;
  };
  return transform(json) as chrome.runtime.ManifestV3;
};


function buildScripts() {
  if (existsSync(distDir)){
    rmSync(distDir, { recursive: true });
  }
  mkdirSync(distDir, { recursive: true });

  // make manifest.json
  const manifestForDist = changeEveryTS2JSFromJSON(manifest);
  writeFileSync(join(distDir, 'manifest.json'), JSON.stringify(manifestForDist, null, 2));

  const scripts = findAllTSFilesFromJSON(manifest);
  const bar = new cliProgress.SingleBar({
    format: 'Building |{bar}| {percentage}% | {value}/{total} | {script}',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
  });
  bar.start(scripts.length, 0, { script: '-' });
  for (let i = 0; i < scripts.length; i++) {
    const script = scripts[i]!;
    bar.update(i, { script });
    const result = spawnSync('bun', ['build', join(srcDir, script), '--outdir', dirname(join(distDir, script))], {
      cwd: rootDir,
      stdio: 'pipe',
      encoding: 'utf-8',
    });
    if (result.status !== 0) {
      bar.stop();
      console.error(result.stderr || result.stdout);
      throw new Error(`bun build failed: ${script}`);
    }
    bar.update(i + 1, { script });
  }
  bar.stop();
}

function copyFilesFromSrcToDist() {
  if (!existsSync(distDir)) {
    mkdirSync(distDir, { recursive: true });
  }
  const files = readdirSync(srcDir, { withFileTypes: true });
  for (const file of files) {
    if (file.isFile() && !file.name.endsWith('.ts')) {
      copyFileSync(join(srcDir, file.name), join(distDir, file.name));
    }
  }
  console.log('Copied src/ -> dist/ (excluding content.ts)');
}

/** Replace .ts with .js in script src attributes of HTML content */
function transformHtmlScriptSrc(html: string): string {
  return html.replace(
    /(src\s*=\s*["'])([^"']*?)\.ts([^"']*)(["'])/gi,
    '$1$2.js$3$4'
  );
}

function transformHtmlFilesInDist() {
  const htmlFiles = fg.sync('**/*.html', { cwd: srcDir, absolute: true });
  for (const htmlPath of htmlFiles) {
    const relativePath = htmlPath.slice(srcDir.length + 1);
    const distPath = join(distDir, relativePath);
    const content = readFileSync(htmlPath, 'utf-8');
    const transformed = transformHtmlScriptSrc(content);
    const parentDir = dirname(distPath);
    if (!existsSync(parentDir)) {
      mkdirSync(parentDir, { recursive: true });
    }
    writeFileSync(distPath, transformed);
  }
  if (htmlFiles.length > 0) {
    console.log(`Transformed ${htmlFiles.length} HTML file(s) (.ts -> .js in script src)`);
  }
}

function getVersion() {
  const manifestPath = join(distDir, 'manifest.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  return manifest.version || '1.0.0';
}

async function buildIcons() {
  await import('./icon.ts');
}

async function createZip() {
  const files = await readdir(distDir, { withFileTypes: true });
  const archive = archiver('zip', { zlib: { level: 9 } });
  const output = createWriteStream(zipPath);

  return new Promise<void>((resolve, reject) => {
    output.on('close', () => {
      console.log(`Created: ${zipPath} (${(archive.pointer() / 1024).toFixed(1)} KB)`);
      resolve(void 0);
    });
    archive.on('error', reject);
    archive.pipe(output);

    for (const f of files) {
      const fullPath = join(distDir, f.name);
      if (f.isFile()) {
        archive.file(fullPath, { name: f.name });
      }
    }
    archive.finalize();
  });
}

buildScripts();
copyFilesFromSrcToDist();
transformHtmlFilesInDist();
await buildIcons();

const version = getVersion();
if (!existsSync(versionsDir)) {
  mkdirSync(versionsDir, { recursive: true });
}
const zipPath = join(versionsDir, `gemini-canvas-md-copy-${version}.zip`);
await createZip();
