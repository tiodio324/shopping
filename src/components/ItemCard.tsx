import type { Item } from '../types.ts'
import { linkLabel } from '../utils/format.ts'
import { CategoryMark } from './CategoryMark.tsx'
import { PencilIcon, TrashIcon } from './Icons.tsx'

interface ItemCardProps {
  item: Item
  categoryName: string | null
  onEdit: (item: Item) => void
  onDelete: (item: Item) => void
}

export function ItemCard({ item, categoryName, onEdit, onDelete }: ItemCardProps) {
  const label = categoryName ?? 'Иное'
  const safeLink = /^https?:\/\//i.test(item.url)

  return (
    <article className="card">
      <div className="card-top">
        <CategoryMark name={label} muted={!categoryName} />
        <div className="card-title">
          <p className="eyebrow">{label}</p>
          <h3>{item.name}</h3>
        </div>
        <div className="card-tools">
          <button type="button" className="icon-button" aria-label={`Изменить «${item.name}»`} onClick={() => onEdit(item)}>
            <PencilIcon />
          </button>
          <button type="button" className="icon-button icon-button-danger" aria-label={`Удалить «${item.name}»`} onClick={() => onDelete(item)}>
            <TrashIcon />
          </button>
        </div>
      </div>
      {item.comment && <p className="card-comment">{item.comment}</p>}
      {safeLink && <p className="muted link-label">{linkLabel(item.url)}</p>}
      {safeLink && (
        <div className="card-actions">
          <a className="button button-primary" href={item.url} target="_blank" rel="noopener noreferrer">
            Открыть
          </a>
        </div>
      )}
    </article>
  )
}
