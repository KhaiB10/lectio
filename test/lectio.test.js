import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import douay from 'douay';
import { hebrewToVulgate, convertPsalm } from '../src/psalms.js';
import { read, splitLabel, toMarkdown } from '../src/lectio.js';

describe('Hebrew -> Vulgate psalm numbers', () => {
  const cases = [[[1, 1], [1, 1]], [[8, 3], [8, 3]], [[9, 5], [9, 5]], [[10, 1], [9, 22]], [[10, 18], [9, 39]], [[23, 1], [22, 1]],
    [[34, 2], [33, 2]], [[113, 1], [112, 1]], [[114, 1], [113, 1]], [[115, 1], [113, 9]], [[116, 9], [114, 9]], [[116, 10], [115, 1]],
    [[117, 1], [116, 1]], [[146, 1], [145, 1]], [[147, 11], [146, 11]], [[147, 12], [147, 1]], [[150, 1], [150, 1]]];
  for (const [[c, v], [vc, vv]] of cases) test(`Hebrew ${c}:${v} = Vulgate ${vc}:${vv}`, () => assert.deepEqual(hebrewToVulgate(c, v), { ch: vc, v: vv }));
  test('citations are rewritten segment by segment', () => {
    assert.equal(convertPsalm('Psalm 34:2-3, 4-5').cite, 'Psalm 33(34):2-3, 33(34):4-5');
    assert.equal(convertPsalm('Ps 116:12-13, 15-16').cite, 'Psalm 115(116):3-4, 115(116):6-7');
    assert.equal(convertPsalm('Psalm 116:8-11').cite, 'Psalm 114(116):8-9, 115(116):1-2');
    assert.equal(convertPsalm('Psalm 150:1-2').cite, 'Psalm 150:1-2');
    assert.equal(convertPsalm('Psalm 33(34):2'), null, 'already dual-numbered: left alone');
    assert.equal(convertPsalm('John 3:16'), null);
  });
});

describe('labels', () => {
  test('"Label: citation" is split; a bare citation is not', () => {
    assert.deepEqual(splitLabel('Gospel: John 3:16-21'), { label: 'Gospel', cite: 'John 3:16-21' });
    assert.deepEqual(splitLabel('First reading — 1 Kings 19:9'), { label: 'First reading', cite: '1 Kings 19:9' });
    assert.deepEqual(splitLabel('1 Cor 13:4-7'), { label: null, cite: '1 Cor 13:4-7' });
  });
});

describe('reading the text', { skip: !douay.available() && 'Douay-Rheims database not installed (npx douay fetch)' }, () => {
  test('Hebrew Psalm 34 gives "I will bless the Lord", not Vulgate 34', () => {
    assert.match(read('Psalm 34:2').verses[0].text, /^I will bless the Lord at all times/);
    assert.match(read('Psalm 34:2', { numbering: 'vulgate' }).verses[0].text, /^Take hold of arms and shield/);
  });
  test('the split psalm 116 lands in Vulgate 114 and 115', () => {
    const r = read('Psalm 116:10, 15');
    assert.match(r.verses[0].text, /^I have believed/);
    assert.match(r.verses[1].text, /^Precious in the sight of the Lord is the death of his saints/);
  });
  test('a verse missing from the Douay numbering is flagged, not silently dropped', () => {
    assert.ok(read('Psalm 150:5-6').notes.some(n => /Only 1 of 2 verses/.test(n)));
  });
  test('Markdown output', () => {
    const md = toMarkdown([read('Gospel: John 3:16')], { title: 'Test' });
    assert.match(md, /^# Test\n\n## Gospel — John 3:16\n/);
    assert.match(md, /<sup>3:16<\/sup> For God so loved the world/);
  });
});
