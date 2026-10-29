<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { groupByCause, readAs, uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import type { Problem } from '#lib/kb/problems';

  // `tickets`: where each problem is filed, problem → link. The page says it; this counts.
  // Counts follow the desk's view (CauseTable): every report under the cause its tenant files it
  // under. The one-day reports stay counted there too, and get their own row and ticket.
  let { ticket, tickets }: { ticket: number; tickets: Partial<Record<Problem, string>> } = $props();

  const rows = $derived((reports as Report[]).length);
  const merged = $derived(uniqueById(reports as Report[]).filter((r) => r.mergedInto === ticket));
  const causes = $derived(groupByCause(merged, tenantOf));
  const oneDay = $derived(merged.filter((r) => notes.oneDayMove.includes(r.id)));
  const label = (url: string) => '#' + url.split('/').pop();
  const days = (rs: Report[]) => rs.map((r) => r.receivedAt.slice(0, 10)).sort();
  const lines = $derived([
    ...causes.map((g) => ({ problem: g.cause, n: g.reports.length, tenants: g.tenants, first: g.firstSeen, last: g.lastSeen, within: readAs(g, notes.oneDayMove) })),
    { problem: 'one-day' as const, n: oneDay.length, tenants: new Set(oneDay.map((r) => r.tenant)).size, first: days(oneDay)[0], last: days(oneDay).at(-1), within: 0 },
  ]);
</script>

<p class="sum">
  <strong>{merged.length}</strong> reports merged into #{ticket} ({rows} rows in the export, {rows - merged.length} of them
  repeats) · <strong>{lines.length}</strong> problems
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each lines as l (l.problem)}
      {@const url = l.problem === 'unplaced' ? undefined : tickets[l.problem]}
      <tr class:open={!url}>
        <td><code>{l.problem}</code></td>
        <td>{l.n}{#if l.within}<sup>*</sup>{/if}</td>
        <td>{l.tenants}</td>
        <td>{l.first} → {l.last}</td>
        <td>{#if url}<a href={url}>{label(url)}</a>{:else}no ticket yet{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

{#each lines as l (l.problem)}
  {#if l.within}
    <p class="note">* {l.within} of the {l.n} <code>{l.problem}</code> reports read as a one-day move. They are counted where the desk files them, under <code>{l.problem}</code>, and again in the <code>one-day</code> row.</p>
  {/if}
{/each}

<style>
  .sum { font-size: 1.1rem; }
  .note { color: var(--muted); font-size: 0.85em; }
  .open td { background: var(--warn-bg); }
  .open td:last-child { color: var(--warn); font-weight: 600; }
</style>
