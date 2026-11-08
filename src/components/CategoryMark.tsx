import { colorFromText, initialFromText } from '../utils/colorFromText.ts'

interface CategoryMarkProps {
  name: string
  muted?: boolean
}

export function CategoryMark({ name, muted = false }: CategoryMarkProps) {
  return (
    <span className={muted ? 'mark mark-muted' : 'mark'} style={muted ? undefined : colorFromText(name)} aria-hidden="true">
      {muted ? '–' : initialFromText(name)}
    </span>
  )
}
