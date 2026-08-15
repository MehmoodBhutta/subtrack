// Self-contained SVG icon set (no font dependency, so it ALWAYS renders).
// Each glyph is a 24x24 viewBox path string. Replaces @expo/vector-icons usage
// that was not rendering in the prebuilt app.
import React from 'react';
import Svg, { Path } from 'react-native-svg';

// Path data sourced/adapted from Ionicons (MIT). 24x24 viewBox, stroke-style
// (fill="none" + stroke for outline look), except solid ones noted.
const G = 24;

const PATHS = {
  // Filled solid (used on brand-colored chips)
  wallet: 'M3 7h18a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a1 1 0 0 1 1-1zm0 2v8h18V9H3zm12 2h4v2h-4v-2z',
  calendar: 'M7 3a1 1 0 0 1 1 1v1h8V4a1 1 0 1 1 2 0v1h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2V4a1 1 0 0 1 1-1zm11 5H6v10h12V8z',
  repeat: 'M17 2l4 4-4 4V7a5 5 0 0 0-5-5H8v2h4a3 3 0 0 1 3 3v1zm-9 19l-4-4 4-4v3a5 5 0 0 0 5 5h4v-2h-4a3 3 0 0 1-3-3v-1z',
  // Plus (add button)
  add: 'M19 11h-6V5a1 1 0 1 0-2 0v6H5a1 1 0 1 0 0 2h6v6a1 1 0 1 0 2 0v-6h6a1 1 0 1 0 0-2z',
  // Sparkles (premium hint on hero)
  sparkles: 'M12 2l1.8 4.7L18.5 8.5 13.8 10.3 12 15l-1.8-4.7L5.5 8.5l4.7-1.8L12 2zm6 8l.9 2.3 2.3.9-2.3.9L18 16.4l-.9-2.3-2.3-.9 2.3-.9.9-2.3z',
  // Chevron forward (settings rows)
  chevronForward: 'M9 6l6 6-6 6',
  diamond: 'M12 2l4 4 6 6-6 6-4 4-4-4-6-6 6-6 4-4z',
  swapHorizontal: 'M7 7h13l-3-3M17 17H4l3 3',
  notifications: 'M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22zm7-6v-5a7 7 0 0 0-5-6.7V3a2 2 0 0 0-4 0v1.3A7 7 0 0 0 5 11v5l-2 2v1h18v-1l-2-2z',
  trash: 'M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13M10 11v6M14 11v6',
  barChart: 'M5 21V9M12 21V3M19 21v-7',
  analytics: 'M5 21V3M5 21h16M9 17l4-5 3 3 4-6',
  card: 'M3 6h18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zm0 4h18M7 14h4',
  person: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2c-4 0-8 2-8 5v1h16v-1c0-3-4-5-8-5z',
  // Category icons (outline)
  pricetag: 'M3 12l9-9 9 9-9 9-9-9zm6-3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z',
  film: 'M3 4h18a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm3 0v16M18 4v16M6 8h2M6 12h2M6 16h2M16 8h2M16 12h2M16 16h2',
  music: 'M9 18a3 3 0 1 1-2-2.8V6l10-2v9.2A3 3 0 1 1 15 15V7.8l-6 1.2v6.7z',
  gameController: 'M7 12H4m1.5-1.5v3M15 11h.01M18 13h.01M9 3h6a6 6 0 0 1 6 6v2a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6v-2a6 6 0 0 1 6-6z',
  book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5zm3 0v12',
  cart: 'M3 4h2l2.5 11h10L20 7H6M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  laptop: 'M4 6h16a1 1 0 0 1 1 1v9H3V7a1 1 0 0 1 1-1zM2 17h20v2H2z',
  // App mark (Cycle mark) — open loop with a small dot
  cycleMark: 'M5 12a7 7 0 1 1 2.3 5.2',
};

const SOLID = new Set(['wallet', 'calendar', 'repeat', 'add', 'sparkles', 'diamond', 'person', 'cycleMark']);

export default function Icon({ name, size = 24, color = '#26215C', style }) {
  const d = PATHS[name] || PATHS.pricetag;
  const solid = SOLID.has(name);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
      {solid ? (
        <Path d={d} fill={color} />
      ) : (
        <Path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      )}
    </Svg>
  );
}

export { PATHS };
