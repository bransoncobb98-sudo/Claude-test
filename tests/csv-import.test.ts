import { describe, expect, it } from 'vitest';
import { parseCsv } from '@/lib/csv-import';

describe('parseCsv', () => {
  it('parses a simple comma-separated file with a header row', () => {
    const csv = 'a,b,c\n1,2,3\n4,5,6\n';
    expect(parseCsv(csv)).toEqual([
      ['a', 'b', 'c'],
      ['1', '2', '3'],
      ['4', '5', '6'],
    ]);
  });

  it('handles quoted fields containing commas', () => {
    const csv = 'question,option_a\n"Which, if any, is correct?",Option A\n';
    const rows = parseCsv(csv);
    expect(rows[1][0]).toBe('Which, if any, is correct?');
  });

  it('handles escaped double quotes inside quoted fields', () => {
    const csv = 'text\n"She said ""hello"""\n';
    const rows = parseCsv(csv);
    expect(rows[1][0]).toBe('She said "hello"');
  });

  it('handles CRLF line endings', () => {
    const csv = 'a,b\r\n1,2\r\n';
    expect(parseCsv(csv)).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
  });

  it('skips blank lines', () => {
    const csv = 'a,b\n1,2\n\n3,4\n';
    expect(parseCsv(csv)).toEqual([
      ['a', 'b'],
      ['1', '2'],
      ['3', '4'],
    ]);
  });
});
