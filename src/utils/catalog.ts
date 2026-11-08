import { onValue, push, ref, remove, set, update, type Unsubscribe } from 'firebase/database'
import type { Category, Item, ItemDraft } from '../types.ts'
import { catalogErrorMessage } from './errors.ts'
import { db } from './firebase.ts'
import { normalizeUrl } from './format.ts'

function itemsPath(uid: string): string {
  return `users/${uid}/items`
}

function categoriesPath(uid: string): string {
  return `users/${uid}/categories`
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function itemFromRaw(id: string, raw: Record<string, unknown>): Item {
  const categoryId = raw.categoryId
  return {
    id: text(raw.id) || id,
    name: text(raw.name),
    comment: text(raw.comment),
    url: text(raw.url),
    categoryId: typeof categoryId === 'string' && categoryId ? categoryId : null,
    createdAt: text(raw.createdAt),
    updatedAt: text(raw.updatedAt) || text(raw.createdAt),
  }
}

function categoryFromRaw(id: string, raw: Record<string, unknown>): Category {
  return {
    id: text(raw.id) || id,
    name: text(raw.name),
    createdAt: text(raw.createdAt),
  }
}

function readList<T>(value: unknown, map: (id: string, raw: Record<string, unknown>) => T): T[] {
  const record = asRecord(value)
  if (!record) return []
  return Object.entries(record).flatMap(([id, raw]) => {
    const fields = asRecord(raw)
    return fields ? [map(id, fields)] : []
  })
}

async function runWrite(action: () => Promise<void>): Promise<void> {
  try {
    await action()
  } catch (error) {
    throw new Error(catalogErrorMessage(error))
  }
}

function itemPayload(item: Item): Record<string, string> {
  const payload: Record<string, string> = {
    id: item.id,
    name: item.name,
    comment: item.comment,
    url: item.url,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
  if (item.categoryId) payload.categoryId = item.categoryId
  return payload
}

export function subscribeItems(
  uid: string,
  onData: (items: Item[]) => void,
  onError: (message: string) => void,
): Unsubscribe {
  return onValue(ref(db, itemsPath(uid)), (snapshot) => {
    onData(readList(snapshot.val(), itemFromRaw))
  }, (error) => {
    onError(catalogErrorMessage(error))
  })
}

export function subscribeCategories(
  uid: string,
  onData: (categories: Category[]) => void,
  onError: (message: string) => void,
): Unsubscribe {
  return onValue(ref(db, categoriesPath(uid)), (snapshot) => {
    onData(readList(snapshot.val(), categoryFromRaw))
  }, (error) => {
    onError(catalogErrorMessage(error))
  })
}

export function createItem(uid: string, draft: ItemDraft): Promise<void> {
  return runWrite(async () => {
    const itemRef = push(ref(db, itemsPath(uid)))
    const id = itemRef.key
    if (!id) throw new Error('Не удалось создать товар.')
    const now = new Date().toISOString()
    const item: Item = {
      id,
      name: draft.name.trim(),
      comment: draft.comment.trim(),
      url: normalizeUrl(draft.url),
      categoryId: draft.categoryId,
      createdAt: now,
      updatedAt: now,
    }
    await set(itemRef, itemPayload(item))
  })
}

export function updateItem(uid: string, current: Item, draft: ItemDraft): Promise<void> {
  return runWrite(async () => {
    const next: Item = {
      ...current,
      name: draft.name.trim(),
      comment: draft.comment.trim(),
      url: normalizeUrl(draft.url),
      categoryId: draft.categoryId,
      updatedAt: new Date().toISOString(),
    }
    await set(ref(db, `${itemsPath(uid)}/${current.id}`), itemPayload(next))
  })
}

export function removeItem(uid: string, id: string): Promise<void> {
  return runWrite(async () => {
    await remove(ref(db, `${itemsPath(uid)}/${id}`))
  })
}

export function createCategory(uid: string, name: string): Promise<void> {
  return runWrite(async () => {
    const categoryRef = push(ref(db, categoriesPath(uid)))
    const id = categoryRef.key
    if (!id) throw new Error('Не удалось создать категорию.')
    const category: Category = { id, name: name.trim(), createdAt: new Date().toISOString() }
    await set(categoryRef, category)
  })
}

export function renameCategory(uid: string, category: Category, name: string): Promise<void> {
  return runWrite(async () => {
    await update(ref(db, `${categoriesPath(uid)}/${category.id}`), { name: name.trim() })
  })
}

export function removeCategory(uid: string, categoryId: string, items: readonly Item[]): Promise<void> {
  return runWrite(async () => {
    const updates: Record<string, null> = {
      [`${categoriesPath(uid)}/${categoryId}`]: null,
    }
    for (const item of items) {
      if (item.categoryId === categoryId) updates[`${itemsPath(uid)}/${item.id}/categoryId`] = null
    }
    await update(ref(db), updates)
  })
}
