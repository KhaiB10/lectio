# lectio

**Read the day's Mass readings in the Douay-Rheims — offline, from any list of citations — with the psalm numbering handled correctly.**

```
$ lectio "First reading: 1 Kings 19:9a, 11-13a" "Psalm 34:2-3, 4-5" "Psalm 116:10, 15"

First reading — 1 Kings 19:9a, 11-13a  (Douay-Rheims: 1 Kings 19:9, 19:11-13)
[19:9] And when he was come thither, he abode in a cave. and behold the word of the Lord came unto him …
  note: Part-verse markers (e.g. 4a) were rounded to the whole verse.

Psalm 34:2-3, 4-5  (Douay-Rheims: Psalms 33:2-5)
[33:2] I will bless the Lord at all times, his praise shall be always in my mouth. [3] In the Lord shall my soul be praised …
  note: Psalm numbering: using Vulgate 33 (Hebrew 34); Douay-Rheims follows the Vulgate.

Psalm 116:10, 15  (Douay-Rheims: Psalms 115:1, 115:6)
[115:1] I have believed, therefore have I spoken; but I have been humbled exceedingly. [6] Precious in the sight of the Lord is the death of his saints.
```

## The psalm trap

Your missal, the USCCB site and most modern Bibles number the psalms the **Hebrew** way. The Douay-Rheims follows the **Greek/Vulgate** numbering, which is one behind for most of the Psalter — and joins or splits a few psalms. Look up "Psalm 34" in a Douay-Rheims and you get *"Take hold of arms and shield"*, not *"I will bless the Lord at all times"*. Nothing looks broken; it is just the wrong psalm.

`lectio` converts every psalm reference, verse by verse, including the joins and splits:

| Hebrew | Douay-Rheims (Vulgate) |
|---|---|
| 1–8, 148–150 | same |
| 9 and 10 | 9 (Hebrew 10:1 = 9:22) |
| 11–113 | one less |
| 114 and 115 | 113 (Hebrew 115:1 = 113:9) |
| 116 | 114 (verses 1–9) and 115 (verse 10 on = 115:1) |
| 117–146 | one less |
| 147 | 146 (verses 1–11) and 147 (verse 12 on = 147:1) |

Every join and split was checked against the Douay-Rheims text itself. Where a verse doesn't exist in the Douay numbering (Hebrew 150:6, for example), `lectio` says so instead of silently printing less. If your source already writes psalms the Vulgate way, pass `--vulgate`; dual forms like `33(34)` are recognised either way.

## Install

```bash
npm install -g github:KhaiB10/lectio
npx douay fetch        # once: builds the offline Bible (~17 MB, public domain)
```

## Use

```bash
lectio "Acts 2:1-11" "Psalm 104:1, 24, 29-30" "Gospel: John 20:19-23"
lectio -f readings.txt                           # one per line; "Label: citation" works; # comments ignored
pbpaste | lectio -                               # from the clipboard
lectio --md --title "Pentecost" -f readings.txt >> "Daily/2026-09-29.md"   # Markdown for Obsidian
```

Citations can be written the way lectionaries print them: `Matthew 18:21-19:1`, `Isaiah 3:1-4a`, `cf. Lk 1:28`, `1 Cor 13:4-7`, `Ps118:88` — parsing comes from [douay](https://github.com/KhaiB10/douay).

## What it doesn't do

It doesn't know which readings fall on which day — you bring the citations (your missal, a parish bulletin, any site). The approved lectionary translations (NABRE in the US) are copyrighted; the Douay-Rheims is public domain, which is why it's the text here. Verse numbering inside a few psalms can still differ by one between translations where a title is counted as a verse; the note on each psalm tells you which numbering was used.

## Test

```bash
npm test
```

23 tests: every psalm join/split boundary, citation rewriting, labels, and — with the database installed — the actual verses.

## License

MIT. The Douay-Rheims text is in the public domain.
