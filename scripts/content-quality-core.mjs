import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import ts from 'typescript';
import { reviewBlockers, releaseApproved } from '../lib/content-quality.ts';

export const digest = value => crypto.createHash('sha256').update(value).digest('hex');
const slash = value => value.replaceAll('\\', '/');
const extensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json', '.css'];
function localFile(root, relative) {
  const absolute = path.resolve(root, relative);
  if (!absolute.startsWith(path.resolve(root) + path.sep)) throw new Error('Dependency outside project');
  return absolute;
}
function resolveImport(root, from, specifier) {
  if (!specifier.startsWith('.') && !specifier.startsWith('@/')) return null;
  const base = specifier.startsWith('@/') ? specifier.slice(2) : path.join(path.dirname(from), specifier);
  for (const candidate of [base, ...extensions.map(ext => base + ext), ...extensions.map(ext => path.join(base, 'index' + ext))]) {
    const absolute = localFile(root, candidate);
    if (fs.existsSync(absolute) && fs.statSync(absolute).isFile()) return slash(path.relative(root, absolute));
  }
  throw new Error(`Unresolved local dependency: ${from} -> ${specifier}`);
}
/** Follow real local imports without executing application or server modules. */
export function dependencyClosure(root, entries) {
  const visited = new Set();
  function visit(relative) {
    relative = slash(relative);
    if (visited.has(relative)) return;
    const absolute = localFile(root, relative);
    if (!fs.existsSync(absolute)) throw new Error(`Missing source: ${relative}`);
    visited.add(relative);
    if (relative.endsWith('.css')) {
      const css = fs.readFileSync(absolute,'utf8');
      for (const match of css.matchAll(/@import\s+(?:url\()?['"]([^'"]+)['"]/g)) {
        const resolved=resolveImport(root,relative,match[1]); if(resolved)visit(resolved);
      }
      return;
    }
    if (!/\.[cm]?[jt]sx?$/.test(relative)) return;
    const source = ts.createSourceFile(relative, fs.readFileSync(absolute, 'utf8'), ts.ScriptTarget.Latest, true);
    function walk(node) {
      let specifier;
      if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) specifier = node.moduleSpecifier.text;
      if (ts.isCallExpression(node) && node.arguments.length && ts.isStringLiteral(node.arguments[0]) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression) && node.expression.text === 'require'))) specifier = node.arguments[0].text;
      if (specifier) { const resolved = resolveImport(root, relative, specifier); if (resolved) visit(resolved); }
      ts.forEachChild(node, walk);
    }
    walk(source);
  }
  entries.forEach(visit);
  return [...visited].sort();
}
export function fileEvidence(root, files) {
  return [...new Set(files)].sort().map(file => ({ path: slash(file), sha256: digest(fs.readFileSync(localFile(root, file))) }));
}
export function pageEntry(root, route, isGuide) {
  const direct = `app${route === '/' ? '' : route}/page.tsx`;
  if (fs.existsSync(localFile(root, direct))) return direct;
  if (isGuide) return 'app/[guide]/page.tsx';
  if (route.startsWith('/diensten/')) return 'app/diensten/[dienst]/page.tsx';
  if (route.startsWith('/projecten/')) return 'app/projecten/[slug]/page.tsx';
  throw new Error(`No renderer mapped for ${route}`);
}
export function assetEvidence(root, files, extra = []) {
  const assets = new Set(extra);
  for (const file of files) {
    const text = fs.readFileSync(localFile(root, file), 'utf8');
    for (const match of text.matchAll(/(?:["'`(])(\/(?:[^"'`\s)${}]+)\.(?:png|jpe?g|webp|avif|svg|gif|ico|woff2?|mp4|webm))(?:["'`)])/gi)) assets.add(`public${match[1]}`);
  }
  return fileEvidence(root, [...assets]);
}
export function validateQuality({ root, pages, manifest, reviews }) {
  const issues = [], currentPaths = new Set(pages.map(page => page.path)), recorded = new Map();
  for (const page of manifest.pages || []) {
    if (recorded.has(page.path)) issues.push({path:page.path,code:'duplicate-manifest-route'});
    recorded.set(page.path,page);
    if (!currentPaths.has(page.path)) issues.push({path:page.path,code:'unexpected-manifest-route'});
  }
  for (const page of pages) {
    const record = recorded.get(page.path);
    if (!record) { issues.push({path:page.path,code:'missing-manifest-route'}); continue; }
    const hashKeys = ['contentHash','businessHash','sourcesHash','assetsHash'];
    if (hashKeys.some(key => page[key] !== record[key])) issues.push({path:page.path,code:'manifest-stale'});
    const review = reviews[page.id];
    if (!review) { issues.push({path:page.path,code:'missing-review'}); continue; }
    const valid = review.path === page.path && ['draft','needs_revision','awaiting_owner_facts','ready_for_owner_review','approved_for_release'].includes(review.status)
      && ['agent_editorial_review','owner'].includes(review.reviewerType)
      && ['not_run','pass','fail'].includes(review.technicalStatus) && ['not_run','pass','revise'].includes(review.editorialStatus)
      && ['not_run','reviewed','unresolved'].includes(review.similarityStatus) && ['not_run','verified','unresolved'].includes(review.claimsStatus)
      && typeof review.ownerApproved === 'boolean' && Array.isArray(review.openIssues) && Array.isArray(review.evidence)
      && typeof review.reviewedAt === 'string' && !Number.isNaN(Date.parse(review.reviewedAt));
    if (!valid) { issues.push({path:page.path,code:'invalid-review-record'}); continue; }
    const current = Object.fromEntries(hashKeys.map(key => [key,page[key]]));
    for (const message of reviewBlockers(review,current)) issues.push({path:page.path,code:'review-blocked',message});
    for (const evidence of review.evidence) {
      const proof = review.evidenceFiles?.find(file => file.path === evidence);
      try {
        if (!proof || !evidence.startsWith('quality/evidence/') || digest(fs.readFileSync(localFile(root,evidence))) !== proof.sha256) throw new Error();
      } catch { issues.push({path:page.path,code:'missing-or-changed-review-evidence',evidence}); }
    }
    if (review.ownerApproved && (review.reviewerType !== 'owner' || !review.ownerApproval?.by?.trim() || !review.ownerApproval?.approvedAt || Number.isNaN(Date.parse(review.ownerApproval.approvedAt)) || hashKeys.some(key=>review.ownerApproval[key]!==current[key]) || !review.ownerApproval?.evidencePath || !review.evidence.includes(review.ownerApproval.evidencePath))) issues.push({path:page.path,code:'owner-approval-without-owner-evidence'});
    if (!releaseApproved(review,current)) issues.push({path:page.path,code:'not-approved-for-release'});
  }
  return issues;
}
