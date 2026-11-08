export interface Category {
  id: string
  name: string
  createdAt: string
}

export interface Item {
  id: string
  name: string
  comment: string
  url: string
  categoryId: string | null
  createdAt: string
  updatedAt: string
}

export interface ItemDraft {
  name: string
  comment: string
  url: string
  categoryId: string | null
}

export type CategoryFilter =
  | { kind: 'all' }
  | { kind: 'none' }
  | { kind: 'category'; id: string }

export type ItemSort = 'new' | 'old' | 'name' | 'name-desc'
