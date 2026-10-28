<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import type { Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { splitTicket, type Problem } from '#lib/kb/problems';

  // issues: problem → URL of the ticket filed for it.
  let { ticket, issues = {} }: { ticket: number; issues?: Partial<Record<Problem, string>> } = $props();

  const split = $derived(splitTicket(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const count = (p: Problem) => split.groups.find((g) => g.problem === p)?.reports.length ?? 0;
  const list = (n: Record<string, number>) =>
    Object.entries(n)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${k} ×${v}`)
      .join(' · ');
  const oneDayIds = $derived(
    split.groups.find((g) => g.problem === 'one-day move')?.reports.map((r) => r.id) ?? [],
  );
</script>

<p class="sum">
  <strong>{split.merged.length}</strong> reports merged into #{ticket} ·
  <strong>{split.groups.length}</strong>
  {split.groups.length === 1 ? 'problem' : 'problems'}
  <span class="rows">({split.rows} rows in the export; {split.rows - split.merged.length} were the same report twice)</span>
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>kb rule files them as</th><th>channels</th><th>tenants</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each split.groups as g (g.problem)}
      <tr>
        <td><code>{g.problem}</code></td>
        <td><strong>{g.reports.length}</strong></td>
        <td class="tags">{list(g.kbCause)}</td>
        <td class="tags">{list(g.channels)}</td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>{#if issues[g.problem]}<a href={issues[g.problem]}>{issues[g.problem]?.replace(/^.*\/issues\//, '#')}</a>{:else}—{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

<p class="note">
  The kb rule alone: {list(split.kbRule)}. Its <code>parser</code> count holds the
  {count('one-day move')} one-day moves ({oneDayIds.join(', ')}); this page counts them apart, so
  <code>parser</code> here is {count('parser')}.
</p>

<style>
  .sum { font-size: 1.1rem; }
  .rows, .tags, .note { color: var(--muted); font-size: 0.85em; }
</style>
