// psalms.js — Hebrew psalm numbers (NABRE, RSV, the US lectionary) to the
// Greek/Vulgate numbers the Douay-Rheims uses.
//
// They agree on 1–8 and 148–150. Elsewhere the Vulgate is one behind, except
// where it joins or splits psalms. Each split/join offset below was checked
// against the Douay-Rheims text itself:
//   Hebrew 10:1   = Vulgate 9:22    "Why, O Lord, hast thou retired afar off?"
//   Hebrew 115:1  = Vulgate 113:9   "Not to us, O Lord, not to us"
//   Hebrew 116:10 = Vulgate 115:1   "I have believed, therefore have I spoken"
//   Hebrew 147:12 = Vulgate 147:1   "Praise the Lord, O Jerusalem"

/** One Hebrew chapter:verse -> Vulgate chapter:verse. */
export function hebrewToVulgate(ch, v) {
  if (ch <= 8 || ch >= 148) return { ch, v };
  if (ch === 9) return { ch: 9, v };
  if (ch === 10) return { ch: 9, v: v + 21 };
  if (ch <= 113) return { ch: ch - 1, v };
  if (ch === 114) return { ch: 113, v };
  if (ch === 115) return { ch: 113, v: v + 8 };
  if (ch === 116) return v <= 9 ? { ch: 114, v } : { ch: 115, v: v - 9 };
  if (ch <= 146) return { ch: ch - 1, v };
  /* 147 */ return v <= 11 ? { ch: 146, v } : { ch: 147, v: v - 11 };
}

const PSALM = /^\s*(?:cf\.\s*)?(?:ps(?:alm|alms|s)?\.?)\s*(\d+)\s*(?::\s*(.+))?$/i;

/**
 * Rewrite a Hebrew-numbered psalm citation into Vulgate numbering, written in
 * the dual form douay understands ("33(34):2-3"), so the lookup says which
 * numbering it used. Returns null when `cite` is not a plain psalm citation
 * (already dual-numbered, or not a psalm at all).
 *
 *   "Psalm 34:2-3, 4-5"   -> "Psalm 33(34):2-3, 33(34):4-5"
 *   "Ps 116:12-13, 15-16" -> "Psalm 115(116):3-4, 115(116):6-7"
 */
export function convertPsalm(cite) {
  const m = PSALM.exec(cite);
  if (!m || /\(\d+\)/.test(cite)) return null;
  const hch = Number(m[1]);
  if (!m[2]) {
    const { ch } = hebrewToVulgate(hch, 1);
    return { cite: ch === hch ? `Psalm ${ch}` : `Psalm ${ch}(${hch})`, note: whole(hch) };
  }
  const parts = [];
  const verseRange = /(\d+)[a-z]?(?:\s*-\s*(\d+)[a-z]?)?/g;
  for (const seg of m[2].split(',')) {
    const r = verseRange.exec(seg.trim()); verseRange.lastIndex = 0;
    if (!r) continue;
    const a = hebrewToVulgate(hch, Number(r[1]));
    const b = r[2] ? hebrewToVulgate(hch, Number(r[2])) : a;
    const n = (c) => (c === hch ? `${c}` : `${c}(${hch})`);   // dual form only when the numbers differ
    if (a.ch === b.ch) parts.push(`${n(a.ch)}:${a.v}${b.v !== a.v ? `-${b.v}` : ''}`);
    else parts.push(`${n(a.ch)}:${a.v}-${a.ch === 114 ? 9 : 11}`, `${n(b.ch)}:1-${b.v}`);   // a range across a Vulgate split
  }
  return { cite: `Psalm ${parts.join(', ')}`, note: null };
}

function whole(h) {
  if (h === 9 || h === 10) return 'Hebrew psalms 9 and 10 are one psalm (9) in the Vulgate numbering.';
  if (h === 114 || h === 115) return 'Hebrew psalms 114 and 115 are one psalm (113) in the Vulgate numbering.';
  if (h === 116) return 'Hebrew psalm 116 is two psalms (114 and 115) in the Vulgate numbering; showing 114.';
  if (h === 147) return 'Hebrew psalm 147 is two psalms (146 and 147) in the Vulgate numbering; showing 146.';
  return null;
}
