// lectio.js — lectionary citations in, public-domain Douay-Rheims text out.
import douay from 'douay';
import { convertPsalm } from './psalms.js';

const LABEL = /^\s*([A-Za-z][A-Za-z .'-]{1,40}?)\s*[:—–-]\s+(?=(?:cf\.\s*)?(?:[1-4]|I{1,3}V?)?\s*[A-Za-z])/;
const IS_PSALM = /^\s*(?:cf\.\s*)?ps(?:alm|alms|s)?\.?\s*\d/i;

/** "Gospel: John 3:16-21" -> { label: 'Gospel', cite: 'John 3:16-21' } */
export function splitLabel(line) {
  const m = LABEL.exec(line);
  if (m && /\d/.test(line.slice(m[0].length))) return { label: m[1].trim(), cite: line.slice(m[0].length).trim() };
  return { label: null, cite: line.trim() };
}

/** Number of verses a simple "c:v-w, x-y" spec asks for (null if it can't tell). */
function requested(cite) {
  const spec = cite.split(':').slice(1).join(':');
  if (!spec || /\d+:\d+\s*-\s*\d+:\d+/.test(cite)) return null;
  let n = 0;
  for (const seg of spec.split(',')) {
    const r = /(\d+)[a-z]?(?:\s*-\s*(?:\d+\(\d+\):)?(\d+)[a-z]?)?/.exec(seg.replace(/^\s*\d+\(\d+\):/, ''));
    if (!r) return null;
    n += r[2] ? Number(r[2]) - Number(r[1]) + 1 : 1;
  }
  return n;
}

/**
 * Look up one citation. Plain psalm numbers are treated as Hebrew (what the US
 * lectionary, NABRE and RSV print) unless numbering is 'vulgate'.
 */
export function read(line, { numbering = 'hebrew' } = {}) {
  if (!douay.available()) throw new Error('the Douay-Rheims database is not installed yet — run: npx douay fetch');
  const { label, cite } = splitLabel(line);
  const notes = [];
  let query = cite;
  if (numbering === 'hebrew' && IS_PSALM.test(cite)) {
    const c = convertPsalm(cite);
    if (c) { query = c.cite; if (c.note) notes.push(c.note); }
  }
  const r = douay.lookup(query);
  if (r.error || !r.verses?.length) return { label, cite, query, error: r.error || 'no verses found', notes };
  notes.push(...(r.notes || []));
  const want = requested(query);
  if (want && r.verses.length < want) notes.push(`Only ${r.verses.length} of ${want} verses exist at this reference in the Douay-Rheims numbering — check the citation.`);
  return { label, cite, query, reference: r.reference, verses: r.verses, notes: [...new Set(notes)] };
}

export function toText(res) {
  const head = `${res.label ? `${res.label} — ` : ''}${res.cite}${res.reference && res.reference !== res.cite ? `  (Douay-Rheims: ${res.reference})` : ''}`;
  if (res.error) return `${head}\n  ✗ ${res.error}\n`;
  let ch = null;
  const body = res.verses.map(v => { const tag = v.chapter !== ch ? `${v.chapter}:${v.verse}` : `${v.verse}`; ch = v.chapter; return `[${tag}] ${v.text}`; }).join(' ');
  return `${head}\n${body}\n${res.notes.map(n => `  note: ${n}`).join('\n')}${res.notes.length ? '\n' : ''}`;
}

export function toMarkdown(results, { title } = {}) {
  const out = [];
  if (title) out.push(`# ${title}`, '');
  for (const r of results) {
    out.push(`## ${r.label ? `${r.label} — ` : ''}${r.cite}`);
    if (r.error) { out.push('', `> ✗ ${r.error}`, ''); continue; }
    if (r.reference && r.reference !== r.cite) out.push(`*Douay-Rheims: ${r.reference}*`);
    out.push('');
    let ch = null;
    out.push('> ' + r.verses.map(v => { const tag = v.chapter !== ch ? `${v.chapter}:${v.verse}` : `${v.verse}`; ch = v.chapter; return `<sup>${tag}</sup> ${v.text}`; }).join(' '));
    for (const n of r.notes) out.push('>', `> *${n}*`);
    out.push('');
  }
  out.push('*Douay-Rheims (public domain).*');
  return out.join('\n') + '\n';
}
