import { parse } from 'parse5';

const attribute = (node, name) => node.attrs?.find(item => item.name === name)?.value;
const descendants = (node, predicate) => excluded(node) ? [] : [
  ...(predicate(node) ? [node] : []),
  ...(node.childNodes || []).flatMap(child => descendants(child, predicate)),
];
const hasClass = (node, value) => (attribute(node, 'class') || '').split(/\s+/).includes(value);
const excluded = node => ['script', 'style', 'noscript', 'template'].includes(node.tagName)
  || node.attrs?.some(item => ['hidden', 'inert'].includes(item.name))
  || attribute(node, 'aria-hidden') === 'true';
const text = node => excluded(node) ? '' : node.nodeName === '#text' ? node.value
  : (node.childNodes || []).map(text).join(' ');
const normalize = value => value.replace(/\s+/g, ' ').trim();

/** Baseline paragraphs use the same exposed-HTML policy as the content contract. */
export function renderedMainParagraphs(html) {
  const main = descendants(parse(html), node => node.tagName === 'main')[0];
  if (!main) throw new Error('Baseline HTML has no main content');
  return descendants(main, node => node.tagName === 'p').map(node => normalize(text(node))).filter(Boolean);
}

/** Checks received main HTML. CSS visibility and mobile layout still need a browser. */
export function inspectRenderedContent(html, contract = {}) {
  const document = parse(html);
  const main = descendants(document, node => node.tagName === 'main')[0];
  const issues = [];
  if (!main) return [{code: 'missing-main'}];
  const visibleText = normalize(text(main));
  const sections = descendants(main, node => hasClass(node, 'experience-questions'));
  const questions = sections.flatMap(section => descendants(section, node => node.tagName === 'article'));
  for (const [question, answer] of contract.questions || []) {
    const entry = questions.find(node => descendants(node, child => child.tagName === 'h3')
      .some(heading => normalize(text(heading)) === normalize(question)));
    if (!entry || !normalize(text(entry)).includes(normalize(answer)))
      issues.push({code: 'missing-rendered-faq', question});
  }
  if (contract.discoveryHref) {
    const discovery = descendants(main, node => hasClass(node, 'service-tool-discovery'));
    if (!discovery.some(section => descendants(section, node => node.tagName === 'a')
      .some(link => attribute(link, 'href') === contract.discoveryHref && normalize(text(link)))))
      issues.push({code: 'missing-service-tool-route', href: contract.discoveryHref});
  }
  for (const required of contract.requiredText || []) {
    if (!visibleText.includes(normalize(required))) issues.push({code: 'missing-visible-text', text: required});
  }
  for (const forbidden of contract.forbiddenText || []) {
    if (visibleText.includes(normalize(forbidden))) issues.push({code: 'unexpected-visible-claim', text: forbidden});
  }
  const links = descendants(main, node => node.tagName === 'a');
  for (const href of contract.requiredLinks || []) {
    if (!links.some(node => attribute(node, 'href') === href && normalize(text(node))))
      issues.push({code: 'missing-contextual-link', href});
  }
  for (const item of contract.packages || []) {
    const article = descendants(main, node => node.tagName === 'article').find(node =>
      descendants(node, child => ['h2', 'h3'].includes(child.tagName))
        .some(heading => normalize(text(heading)) === item.name));
    if (!article || !normalize(text(article)).includes(normalize(item.price)))
      issues.push({code: 'package-price-mismatch', name: item.name, expected: item.price});
  }
  return issues;
}
