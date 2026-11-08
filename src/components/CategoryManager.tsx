import { useEffect, useId, useRef, useState, type FormEvent, type MouseEvent, type SyntheticEvent } from 'react'
import type { Category } from '../types.ts'
import { CategoryMark } from './CategoryMark.tsx'
import { PencilIcon, TrashIcon } from './Icons.tsx'

interface CategoryManagerProps {
  categories: readonly Category[]
  counts: ReadonlyMap<string, number>
  pending: boolean
  error: string | null
  onClose: () => void
  onCreate: (name: string) => Promise<void>
  onRename: (category: Category, name: string) => Promise<void>
  onDelete: (category: Category) => void
}

export function CategoryManager({ categories, counts, pending, error, onClose, onCreate, onRename, onDelete }: CategoryManagerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const ignoreClose = useRef(false)
  const titleId = useId()
  const [draft, setDraft] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    dialog.showModal()
    return () => {
      ignoreClose.current = true
      if (dialog.open) dialog.close()
    }
  }, [])

  function handleBackdrop(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget && !pending) onClose()
  }

  function handleCancel(event: SyntheticEvent<HTMLDialogElement>) {
    if (pending) event.preventDefault()
  }

  function addCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = draft.trim()
    if (!name) return
    void onCreate(name).then(() => setDraft(''), () => undefined)
  }

  function startRename(category: Category) {
    setEditingId(category.id)
    setEditingName(category.name)
  }

  function saveRename(event: FormEvent<HTMLFormElement>, category: Category) {
    event.preventDefault()
    const name = editingName.trim()
    if (!name) return
    void onRename(category, name).then(() => setEditingId(null), () => undefined)
  }

  return (
    <dialog
      ref={dialogRef}
      className="modal modal-wide"
      aria-labelledby={titleId}
      onCancel={handleCancel}
      onClose={() => { if (!ignoreClose.current) onClose() }}
      onMouseDown={handleBackdrop}
    >
      <div className="modal-body">
        <div className="modal-head">
          <h2 id={titleId}>Категории</h2>
          <button type="button" className="icon-button" aria-label="Закрыть" onClick={onClose} disabled={pending}>×</button>
        </div>
        <form className="category-add" onSubmit={addCategory}>
          <input value={draft} onChange={(event) => setDraft(event.target.value)} disabled={pending} placeholder="Новая категория" aria-label="Новая категория" />
          <button type="submit" className="button button-primary" disabled={pending}>Добавить</button>
        </form>
        {error && <p className="banner" role="alert">{error}</p>}
        <ul className="manager-list">
          {categories.map((category) => (
            <li key={category.id} className="category-row">
              {editingId === category.id ? (
                <form className="category-edit" onSubmit={(event) => saveRename(event, category)}>
                  <input value={editingName} onChange={(event) => setEditingName(event.target.value)} disabled={pending} aria-label={`Название «${category.name}»`} />
                  <button type="submit" className="button button-primary" disabled={pending}>Сохранить</button>
                  <button type="button" className="button button-ghost" onClick={() => setEditingId(null)} disabled={pending}>Отмена</button>
                </form>
              ) : (
                <>
                  <CategoryMark name={category.name} />
                  <span className="category-name">{category.name}</span>
                  <span className="chip-count">{counts.get(category.id) ?? 0}</span>
                  <button type="button" className="icon-button" aria-label={`Переименовать «${category.name}»`} onClick={() => startRename(category)} disabled={pending}>
                    <PencilIcon />
                  </button>
                  <button type="button" className="icon-button icon-button-danger" aria-label={`Удалить «${category.name}»`} onClick={() => onDelete(category)} disabled={pending}>
                    <TrashIcon />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </dialog>
  )
}
