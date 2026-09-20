const PALETTE: { light: string; dark: string }[] = [
  { light: '#2563eb', dark: '#93c5fd' },
  { light: '#e11d48', dark: '#fda4af' },
  { light: '#b45309', dark: '#fcd34d' },
  { light: '#047857', dark: '#6ee7b7' },
  { light: '#7c3aed', dark: '#c4b5fd' },
  { light: '#0f766e', dark: '#5eead4' },
];

export function chipColor(value: string): { light: string; dark: string } {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % PALETTE.length;
  return PALETTE[index];
}

export function chipStyle(value: string): string {
  const { light, dark } = chipColor(value);
  return `--chip-l: ${light}; --chip-d: ${dark};`;
}
