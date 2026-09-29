#!/usr/bin/env node
import fs from 'node:fs';
import { read, toText, toMarkdown } from '../src/lectio.js';

const HELP = `lectio — read lectionary citations in the Douay-Rheims, offline, with the psalm numbering handled.

  lectio "Acts 2:1-11" "Psalm 104:1, 24, 29-30" "Gospel: John 20:19-23"
  lectio -f readings.txt              one citation per line; "Label: citation" works
  pbpaste | lectio -                  read citations from stdin
  lectio --md --title "Pentecost" -f readings.txt >> daily-note.md

  --md          Markdown (for Obsidian / any notes app)
  --title T     heading for --md
  --vulgate     psalm numbers are already Vulgate/Douay (default: Hebrew, as US missals print them)

First run: npx douay fetch   (builds the offline Bible, ~17 MB, public domain)`;

const args = process.argv.slice(2);
if (!args.length || args.includes('-h') || args.includes('--help')) { console.log(HELP); process.exit(0); }
const opt = { md: false, title: null, numbering: 'hebrew' };
const cites = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--md') opt.md = true;
  else if (a === '--title') opt.title = args[++i];
  else if (a === '--vulgate') opt.numbering = 'vulgate';
  else if (a === '-f') cites.push(...fs.readFileSync(args[++i], 'utf8').split('\n'));
  else if (a === '-') cites.push(...fs.readFileSync(0, 'utf8').split('\n'));
  else cites.push(a);
}
const lines = cites.map(s => s.trim()).filter(s => s && !s.startsWith('#'));
let results;
try { results = lines.map(l => read(l, { numbering: opt.numbering })); }
catch (e) { console.error(`lectio: ${e.message}`); process.exit(2); }
if (opt.md) process.stdout.write(toMarkdown(results, { title: opt.title }));
else for (const r of results) console.log(toText(r));
process.exitCode = results.some(r => r.error) ? 1 : 0;
