// Deterministic color per filter-chip value (brief follow-up: "have the
// different filter parameters be in different colors"). Each hue has a
// light-mode shade (>=4.5:1 against white, used as both text-on-white and
// white-text-on-fill) and a dark-mode shade (>=4.5:1 against the near-black
// background and against the dark navy active-fill text) -- verified by
// hand, see the design-session notes for the actual contrast numbers.
const PALETTE: { light: string; dark: string }[] = [
  { light: '#1d4ed8', dark: '#7aa2f7' }, // blue
  { light: '#b42318', dark: '#f28b82' }, // red
  { light: '#15803d', dark: '#6ee7b7' }, // green
  { light: '#7e22ce', dark: '#d8b4fe' }, // purple
  { light: '#b45309', dark: '#fdba74' }, // orange
  { light: '#0f766e', dark: '#5eead4' }, // teal
  { light: '#a3175e', dark: '#f9a8d4' }, // pink
  { light: '#78350f', dark: '#d6b88a' }, // brown
  { light: '#3730a3', dark: '#a5b4fc' }, // indigo
];

/** Simple deterministic string hash -> stable palette index. */
export function chipColor(value: string): { light: string; dark: string } {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % PALETTE.length;
  return PALETTE[index];
}
