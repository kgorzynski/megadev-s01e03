// Three problems inside one ticket. The kb rule (causes.ts) gives two causes. The desk's own notes
// (desk-notes.json) name reports that read as a one-day move. A day/month flip cannot move a date
// by one day, so those reports get a problem of their own here.
import { causeOf, uniqueById, type Cause, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = Cause | 'one-day move' | 'unplaced';
export const PROBLEMS: readonly Problem[] = ['parser', 'hint', 'one-day move'];

export function problemOf(r: Report, t: Tenant | undefined, oneDayMove: readonly string[]): Problem {
  if (oneDayMove.includes(r.id)) return 'one-day move';
  return causeOf(r, t) ?? 'unplaced';
}

export type ProblemGroup = {
  problem: Problem;
  reports: Report[];
  // What the kb rule files these reports under: cause → count.
  kbCause: Record<string, number>;
  channels: Record<string, number>;
  tenants: number;
  firstSeen: string;
  lastSeen: string;
};

const tally = (xs: string[]) => xs.reduce<Record<string, number>>((n, x) => ({ ...n, [x]: (n[x] ?? 0) + 1 }), {});

export function splitTicket(
  raw: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
) {
  const rows = raw.filter((r) => r.mergedInto === ticket);
  const merged = uniqueById(rows);
  const byProblem = new Map<Problem, Report[]>();
  for (const r of merged) {
    const p = problemOf(r, tenantOf(r), oneDayMove);
    byProblem.set(p, [...(byProblem.get(p) ?? []), r]);
  }
  const groups: ProblemGroup[] = [...byProblem.entries()]
    .map(([problem, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return {
        problem,
        reports: rs,
        kbCause: tally(rs.map((r) => causeOf(r, tenantOf(r)) ?? 'unplaced')),
        channels: tally(rs.map((r) => r.channel)),
        tenants: new Set(rs.map((r) => r.tenant)).size,
        firstSeen: days[0],
        lastSeen: days[days.length - 1],
      };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
  const kbRule = tally(merged.map((r) => causeOf(r, tenantOf(r)) ?? 'unplaced'));
  return { rows: rows.length, merged, groups, kbRule };
}
