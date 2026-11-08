import { useEffect, useId, useRef, useState, type FormEvent, type MouseEvent, type SyntheticEvent } from 'react'
import type { Category, ItemDraft } from '../types.ts'
import { normalizeUrl } from '../utils/format.ts'

interface ItemDialogProps {
  title: string
  initial: ItemDraft
  categories: readonly Category[]
  pending: boolean
  error: string | null
  onClose: () => void
  onSubmit: (draft: ItemDraft) => void
}

export function ItemDialog({ title, initial, categories, pending, error, onClose, onSubmit }: ItemDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const ignoreClose = useRef(false)
  const titleId = useId()
  const [name, setName] = useState(initial.name)
  const [comment, setComment] = useState(initial.comment)
  const [url, setUrl] = useState(initial.url)
  const [categoryId, setCategoryId] = useState(initial.categoryId ?? '')
  const [localError, setLocalError] = useState<string | null>(null)
  const message = localError ?? error

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    dialog.showModal()
    return () => {
      ignoreClose.current = true
      if (dialog.open) dialog.close()
    }
  }, [])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim()) {
      setLocalError('Добавьте название.')
      return
    }
    try {
      const nextUrl = normalizeUrl(url)
      setLocalError(null)
      onSubmit({ name, comment, url: nextUrl, categoryId: categoryId || null })
    } catch (caught) {
      setLocalError(caught instanceof Error ? caught.message : 'Некорректная ссылка.')
    }
  }

  function handleBackdrop(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget && !pending) onClose()
  }

  function handleCancel(event: SyntheticEvent<HTMLDialogElement>) {
    if (pending) event.preventDefault()
  }

  return (
    <dialog ref={dialogRef} className="modal" aria-labelledby={titleId} onCancel={handleCancel} onClose={() => { if (!ignoreClose.current) onClose() }} onMouseDown={handleBackdrop}>
      <form className="modal-body" onSubmit={handleSubmit}>
        <div className="modal-head">
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="icon-button" aria-label="Закрыть" onClick={onClose} disabled={pending}>
            ×
          </button>
        </div>
        <label className="field">
          <span>Название</span>
          <input value={name} onChange={(event) => setName(event.target.value)} disabled={pending} autoFocus />
        </label>
        <label className="field">
          <span>Комментарий</span>
          <textarea value={comment} onChange={(event) => setComment(event.target.value)} disabled={pending} rows={4} />
        </label>
        <label className="field">
          <span>Ссылка</span>
          <input value={url} onChange={(event) => setUrl(event.target.value)} disabled={pending} inputMode="url" spellCheck={false} placeholder="https://" />
        </label>
        <label className="field">
          <span>Категория</span>
          <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} disabled={pending}>
          {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
            <option value="">Иное</option>
          </select>
        </label>
        {message && <p className="banner" role="alert">{message}</p>}
        <div className="form-actions">
          <button type="button" className="button button-ghost" onClick={onClose} disabled={pending}>Отмена</button>
          <button type="submit" className="button button-primary" disabled={pending}>{pending ? 'Сохраняем…' : 'Сохранить'}</button>
        </div>
      </form>
    </dialog>
  )
}
