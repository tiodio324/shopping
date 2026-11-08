export interface MarkColors {
  backgroundColor: string
  color: string
}

export function colorFromText(text: string): MarkColors {
  const source = text.trim().toLocaleLowerCase('ru')
  let hash = 0
  for (const symbol of source) {
    hash = Math.imul(hash, 31) + (symbol.codePointAt(0) ?? 0)
  }
  const hue = Math.abs(hash) % 360
  const darkGlyph = hue >= 40 && hue <= 185
  const lightness = darkGlyph ? 64 : 46
  return {
    backgroundColor: `hsl(${String(hue)} 62% ${String(lightness)}%)`,
    color: darkGlyph ? '#1c1915' : '#ffffff',
  }
}

export function initialFromText(text: string): string {
  const point = text.trim().codePointAt(0)
  return point === undefined ? '?' : String.fromCodePoint(point).toLocaleUpperCase('ru')
}
