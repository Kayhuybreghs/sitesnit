import fs from 'node:fs/promises';
import path from 'node:path';
import {isPrivatePath} from './public-route-checks.mjs';

export async function filesBelow(directory) {
  const files = [];
  for (const entry of await fs.readdir(directory, {withFileTypes: true})) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesBelow(filename));
    else if (entry.isFile()) files.push(filename);
  }
  return files.sort();
}

export async function inventoryPublicAssets(root) {
  const publicDir = path.join(root, 'public');
  const assets = (await filesBelow(publicDir)).map(file => '/' + path.relative(publicDir, file).split(path.sep).map(encodeURIComponent).join('/'));
  // This file-based metadata route is also a real static asset.
  try { await fs.access(path.join(root, 'app/favicon.ico')); assets.push('/favicon.ico'); } catch { /* Optional app icon. */ }
  return assets.sort();
}

export async function inventoryAppPages(root) {
  const appDir = path.join(root, 'app');
  return (await filesBelow(appDir)).filter(file => /[/\\]page\.[cm]?[jt]sx?$/.test(file)).map(file => {
    const parts = path.relative(appDir, path.dirname(file)).split(path.sep).filter(Boolean).filter(segment => !segment.startsWith('(') && !segment.startsWith('@'));
    const route = '/' + parts.join('/');
    return {file: path.relative(root, file).split(path.sep).join('/'), route, dynamic: route.includes('['), private: isPrivatePath(route)};
  });
}

export function validateRouteInventory(inventory, paths, redirects) {
  const failures = [], redirectPaths = new Set(redirects.map(item => item.source));
  const publicPages = inventory.filter(item => !item.private);
  for (const page of publicPages.filter(item => !item.dynamic)) {
    if (!paths.includes(page.route) && !redirectPaths.has(page.route)) failures.push({code: 'uncatalogued-app-page', path: page.route, expected: 'route catalog or explicit legacy redirect', actual: page.file});
  }
  for (const pathname of paths) {
    const matches = publicPages.some(page => {
      const expression = page.route.split('/').map(segment => segment.startsWith('[') ? '[^/]+' : segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('/');
      return new RegExp(`^${expression}$`).test(pathname);
    });
    if (!matches) failures.push({code: 'catalog-without-app-page', path: pathname, expected: 'matching App Router page', actual: 'missing'});
  }
  const duplicates = paths.filter((item, index) => paths.indexOf(item) !== index);
  if (duplicates.length) failures.push({code: 'catalog-duplicates', path: 'route-catalog', expected: [], actual: [...new Set(duplicates)]});
  return failures;
}
