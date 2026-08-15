// Mirrors lib/screens/insights.dart + adds a per-subscription comparison chart.
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Svg, { Circle, Path, Rect, Text as SvgText } from 'react-native-svg';
import { useSubsStore } from '../stores/subs';
import { useCurrencyStore } from '../stores/currency';
import { monthlyCost } from '../models/sub';
import { CATEGORIES } from '../models/category';
import { formatCurrency, convert } from '../models/currency';
import { BRAND, INK, MUTED, OTHER_TINT, BG, SHADOW, hexA } from '../components/ui';
import Icon from '../components/Icon';

// Donut + comparison bars use the dusty-blue family so they sit with the rebrand.
const CATEGORY_COLOR = {
  streaming: '#6E8FA8',
  software: '#B9CBD6',
  fitness: '#8FA9BC',
  other: OTHER_TINT,
};

function monthsElapsedThisYear() {
  return new Date().getMonth() + 1;
}

// Build donut arc paths for each slice.
function donutSlices(byCat, total) {
  const R = 60;
  const cx = 0, cy = 0;
  const inner = R - 18;
  const slices = [];
  let angle = -Math.PI / 2;
  if (total <= 0) return slices;
  for (const c of CATEGORIES) {
    const v = byCat[c.name] || 0;
    if (v <= 0) continue;
    const frac = v / total;
    const end = angle + frac * Math.PI * 2;
    const large = frac > 0.5 ? 1 : 0;
    const x1 = cx + R * Math.cos(angle);
    const y1 = cy + R * Math.sin(angle);
    const x2 = cx + R * Math.cos(end);
    const y2 = cy + R * Math.sin(end);
    const xi1 = cx + inner * Math.cos(angle);
    const yi1 = cy + inner * Math.sin(angle);
    const xi2 = cx + inner * Math.cos(end);
    const yi2 = cy + inner * Math.sin(end);
    const d = `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${inner} ${inner} 0 ${large} 0 ${xi1} ${yi1} Z`;
    slices.push({ name: c.name, label: c.label, color: c.color, path: d, value: v, pct: Math.round(frac * 100) });
    angle = end;
  }
  return slices;
}

// Horizontal bars comparing each subscription's monthly cost.
function ComparisonChart({ rows, max }) {
  const W = 300;
  const rowH = 34;
  const labelW = 86;
  const barMax = W - labelW - 56;
  return (
    <Svg width={W} height={rows.length * rowH} viewBox={`0 0 ${W} ${rows.length * rowH}`}>
      {rows.map((r, i) => {
        const y = i * rowH;
        const w = max > 0 ? Math.max(4, (r.sortVal / max) * barMax) : 4;
        const color = CATEGORY_COLOR[r.category] || BRAND;
        return (
          <React.Fragment key={r.id}>
            <SvgText x={0} y={y + 20} fontSize={12} fill={INK} fontWeight="600">{r.name.length > 11 ? r.name.slice(0, 10) + '…' : r.name}</SvgText>
            <Rect x={labelW} y={y + 6} width={w} height={18} rx={6} fill={color} />
            <SvgText x={labelW + w + 8} y={y + 20} fontSize={11} fill={MUTED}>{formatCurrency(r.value, r.currency)}</SvgText>
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

export default function InsightsScreen() {
  const subs = useSubsStore((s) => s.subs);
  const currency = useCurrencyStore((s) => s.currency);

  const { byCat, totalMonthly, ytd, slices, thisMonth, lastMonth, comparison, maxVal } = useMemo(() => {
    const byCat = {};
    for (const c of CATEGORIES) byCat[c.name] = 0;
    // Sum every subscription into the default currency (approx static rates).
    for (const s of subs) {
      const converted = convert(monthlyCost(s), s.currency, currency);
      byCat[s.category.name] += converted;
    }
    const totalMonthly = CATEGORIES.reduce((a, c) => a + byCat[c.name], 0);
    const ytd = totalMonthly * monthsElapsedThisYear();
    const now = Date.now();
    const thisMonth = subs.filter((s) => new Date(s.nextRenewalDate).getTime() > now).length;
    const lastMonth = subs.length - thisMonth;
    // Per-subscription monthly cost, each in its OWN currency, sorted high -> low
    // by its value converted to the default currency so the bars are comparable.
    const comparison = subs
      .map((s) => ({
        id: s.id,
        name: s.name,
        value: monthlyCost(s),
        currency: s.currency,
        category: s.category.name,
        sortVal: convert(monthlyCost(s), s.currency, currency),
      }))
      .sort((a, b) => b.sortVal - a.sortVal);
    const maxVal = comparison.reduce((m, r) => Math.max(m, r.sortVal), 0);
    return { byCat, totalMonthly, ytd, slices: donutSlices(byCat, totalMonthly), thisMonth, lastMonth, comparison, maxVal };
  }, [subs, currency]);

  if (subs.length === 0) {
    return (
      <View style={styles.center}>
        <Icon name="barChart" size={56} color={MUTED} />
        <Text style={styles.emptyTitle}>No insights yet</Text>
        <Text style={styles.emptyBody}>Add subscriptions to see where your money goes.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 20, paddingBottom: 32 }}>
      <View style={styles.metricsRow}>
        <MetricCard label="Per month" value={formatCurrency(totalMonthly, currency)} />
        <View style={{ width: 12 }} />
        <MetricCard label="Year to date" value={formatCurrency(ytd, currency)} />
      </View>

      <View style={styles.donutCard}>
        <Text style={styles.cardTitle}>Spend by category</Text>
        <View style={styles.donutRow}>
          <Svg width={160} height={160} viewBox="-80 -80 160 160">
            {slices.length === 0 ? (
              <Circle cx={0} cy={0} r={60} fill={hexA(BRAND, 0.12)} />
            ) : (
              slices.map((s) => <Path key={s.name} d={s.path} fill={s.color} />)
            )}
          </Svg>
          <View style={styles.donutCenter}>
            <Text style={styles.donutTotalLabel}>Total</Text>
            <Text style={styles.donutTotal}>{formatCurrency(totalMonthly, currency)}</Text>
          </View>
        </View>

        {slices.map((s) => (
          <View key={s.name} style={styles.legend}>
            <View style={[styles.legendDot, { backgroundColor: s.color }]} />
            <Text style={[styles.legendLabel, { flex: 1 }]}>{s.label}</Text>
            <Text style={styles.legendVal}>{formatCurrency(s.value, currency)}</Text>
            <Text style={styles.legendPct}>{s.pct}%</Text>
          </View>
        ))}
      </View>

      <View style={styles.donutCard}>
        <Text style={styles.cardTitle}>Subscriptions compared</Text>
        <Text style={styles.cardSub}>Your monthly cost per subscription</Text>
        {comparison.length === 0 ? (
          <Text style={{ color: MUTED, fontSize: 13 }}>No {currency.code} subscriptions yet.</Text>
        ) : (
          <View style={{ marginTop: 8 }}>
            <ComparisonChart rows={comparison} max={maxVal} />
          </View>
        )}
      </View>

      <View style={styles.trendCard}>
        <Icon name="analytics" size={20} color={MUTED} />
        <Text style={[styles.trendText, { flex: 1 }]}>{trendText(thisMonth, lastMonth, subs.length)}</Text>
      </View>
    </ScrollView>
  );
}

function trendText(thisMonth, lastMonth, total) {
  if (total === 0) return 'Add subscriptions to see your trends.';
  if (thisMonth > lastMonth) return `Renewal-heavy month: ${thisMonth} of ${total} renewals land ahead.`;
  if (thisMonth < lastMonth) return 'Quieter stretch: most renewals already passed this cycle.';
  return 'Balanced: renewals are spread evenly across the month.';
}

function MetricCard({ label, value }) {
  return (
    <View style={[styles.metric, SHADOW]}>
      <Icon name="card" size={22} color={MUTED} />
      <Text style={styles.metricVal}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG },
  center: { flex: 1, backgroundColor: BG, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: INK, marginTop: 16 },
  emptyBody: { fontSize: 14, color: MUTED, textAlign: 'center', marginTop: 8 },
  metricsRow: { flexDirection: 'row' },
  metric: { flex: 1, backgroundColor: '#fff', borderRadius: 20, padding: 18 },
  metricVal: { fontSize: 24, fontWeight: '800', color: INK, marginTop: 12 },
  metricLabel: { fontSize: 13, color: MUTED, marginTop: 4 },
  donutCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, marginTop: 16, ...SHADOW },
  cardTitle: { fontSize: 16, fontWeight: '700', color: INK, marginBottom: 12 },
  cardSub: { fontSize: 12, color: MUTED, marginTop: -8, marginBottom: 4 },
  donutRow: { flexDirection: 'row', alignItems: 'center' },
  donutCenter: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  donutTotalLabel: { fontSize: 12, color: MUTED },
  donutTotal: { fontSize: 15, fontWeight: '700', color: INK },
  legend: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 4, marginRight: 10 },
  legendLabel: { fontSize: 14, color: INK },
  legendVal: { fontSize: 14, fontWeight: '600', color: INK, marginRight: 10 },
  legendPct: { fontSize: 12, color: MUTED, width: 36, textAlign: 'right' },
  trendCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: BG, borderRadius: 20, padding: 18, marginTop: 16, borderWidth: 1, borderColor: BORDER },
  trendText: { fontSize: 14, color: INK, marginLeft: 12 },
});
