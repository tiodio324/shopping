import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Category, CategoryFilter, Item, ItemDraft, ItemSort } from '../types.ts'
import { useAuth } from '../hooks/useAuth.ts'
import { createCategory, createItem, removeCategory, removeItem, renameCategory, subscribeCategories, subscribeItems, updateItem } from '../utils/catalog.ts'
import { itemsLabel } from '../utils/format.ts'
import { CategoryManager } from './CategoryManager.tsx'
import { FiltersBar } from './FiltersBar.tsx'
import { Header } from './Header.tsx'
import { ItemCard } from './ItemCard.tsx'
import { ItemDialog } from './ItemDialog.tsx'

type ItemMode = { type: 'create' } | { type: 'edit'; item: Item }

const emptyDraft: ItemDraft = { name: '', comment: '', url: '', categoryId: null }
const noItems: Item[] = []
const noCategories: Category[] = []

function draftFromItem(item: Item): ItemDraft {
  return { name: item.name, comment: item.comment, url: item.url, categoryId: item.categoryId }
}

export function Cabinet() {
  const { user } = useAuth()
  const uid = user?.uid ?? ''
  const [itemsState, setItemsState] = useState<{ uid: string; items: Item[] } | null>(null)
  const [categoriesState, setCategoriesState] = useState<{ uid: string; categories: Category[] } | null>(null)
  const items = useMemo(
    () => (itemsState?.uid === uid ? itemsState.items : noItems),
    [itemsState, uid],
  )
  const categories = useMemo(
    () => (categoriesState?.uid === uid ? categoriesState.categories : noCategories),
    [categoriesState, uid],
  )
  const itemsReady = itemsState?.uid === uid
  const categoriesReady = categoriesState?.uid === uid
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<CategoryFilter>({ kind: 'all' })
  const [sort, setSort] = useState<ItemSort>('new')
  const [itemMode, setItemMode] = useState<ItemMode | null>(null)
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!uid) return
    const unsubscribeItems = subscribeItems(uid, (next) => {
      setItemsState({ uid, items: next })
    }, setError)
    const unsubscribeCategories = subscribeCategories(uid, (next) => {
      setCategoriesState({ uid, categories: next })
    }, setError)
    return () => {
      unsubscribeItems()
      unsubscribeCategories()
    }
  }, [uid])

  const sortedCategories = useMemo(
    () => categories.slice().sort((a, b) => a.name.localeCompare(b.name, 'ru')),
    [categories],
  )

  const knownCategoryIds = useMemo(() => new Set(categories.map((category) => category.id)), [categories])

  const assignedCategoryId = useCallback((item: Item): string | null => {
    if (item.categoryId && knownCategoryIds.has(item.categoryId)) return item.categoryId
    return null
  }, [knownCategoryIds])

  const visibleItems = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('ru')
    return items
      .filter((item) => {
        const categoryId = assignedCategoryId(item)
        if (filter.kind === 'none' && categoryId !== null) return false
        if (filter.kind === 'category' && categoryId !== filter.id) return false
        if (!query) return true
        return [item.name, item.comment, item.url].some((part) => part.toLocaleLowerCase('ru').includes(query))
      })
      .sort((a, b) => {
        if (sort === 'name') return a.name.localeCompare(b.name, 'ru')
        if (sort === 'name-desc') return b.name.localeCompare(a.name, 'ru')
        if (sort === 'old') return a.createdAt.localeCompare(b.createdAt) || a.name.localeCompare(b.name, 'ru')
        return b.createdAt.localeCompare(a.createdAt) || a.name.localeCompare(b.name, 'ru')
      })
  }, [items, search, filter, sort, assignedCategoryId])

  const counts = useMemo(() => {
    const byCategory = new Map<string, number>()
    for (const category of categories) byCategory.set(category.id, 0)
    let none = 0
    for (const item of items) {
      const categoryId = item.categoryId && knownCategoryIds.has(item.categoryId) ? item.categoryId : null
      if (!categoryId) {
        none += 1
        continue
      }
      byCategory.set(categoryId, (byCategory.get(categoryId) ?? 0) + 1)
    }
    return { all: items.length, none, byCategory }
  }, [items, categories, knownCategoryIds])

  const loading = !itemsReady || !categoriesReady

  function summary(): string {
    if (loading) return 'Загрузка…'
    if (visibleItems.length !== items.length) return `Показано ${String(visibleItems.length)} из ${String(items.length)}`
    return itemsLabel(items.length)
  }

  function categoryName(categoryId: string | null): string | null {
    if (!categoryId || !knownCategoryIds.has(categoryId)) return null
    return categories.find((category) => category.id === categoryId)?.name ?? null
  }

  function openCreateItem() {
    setFormError(null)
    setItemMode({ type: 'create' })
  }

  function openEditItem(item: Item) {
    setFormError(null)
    setItemMode({ type: 'edit', item })
  }

  function openCategories() {
    setFormError(null)
    setCategoriesOpen(true)
  }

  function saveItem(draft: ItemDraft) {
    if (!uid || !itemMode) return
    void (async () => {
      setPending(true)
      setFormError(null)
      try {
        if (itemMode.type === 'create') await createItem(uid, draft)
        else await updateItem(uid, itemMode.item, draft)
        setItemMode(null)
      } catch (caught) {
        setFormError(caught instanceof Error ? caught.message : 'Не удалось сохранить товар.')
      } finally {
        setPending(false)
      }
    })()
  }

  function deleteListedItem(item: Item) {
    if (!uid) return
    if (!window.confirm(`Удалить «${item.name}»?`)) return
    void (async () => {
      setError(null)
      try {
        await removeItem(uid, item.id)
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'Не удалось удалить товар.')
      }
    })()
  }

  function createListedCategory(name: string): Promise<void> {
    if (!uid) return Promise.resolve()
    setPending(true)
    setFormError(null)
    return createCategory(uid, name).catch((caught: unknown) => {
      setFormError(caught instanceof Error ? caught.message : 'Не удалось сохранить категорию.')
      throw caught
    }).finally(() => setPending(false))
  }

  function renameListedCategory(category: Category, name: string): Promise<void> {
    if (!uid) return Promise.resolve()
    setPending(true)
    setFormError(null)
    return renameCategory(uid, category, name).catch((caught: unknown) => {
      setFormError(caught instanceof Error ? caught.message : 'Не удалось сохранить категорию.')
      throw caught
    }).finally(() => setPending(false))
  }

  function deleteListedCategory(category: Category) {
    if (!uid) return
    if (!window.confirm(`Удалить категорию «${category.name}»? Товары останутся в «Иное».`)) return
    void (async () => {
      setError(null)
      try {
        await removeCategory(uid, category.id, items)
        setFilter((current) => (current.kind === 'category' && current.id === category.id ? { kind: 'all' } : current))
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'Не удалось удалить категорию.')
      }
    })()
  }

  const itemDialog = itemMode && (
    <ItemDialog
      key={itemMode.type === 'create' ? 'create-item' : itemMode.item.id}
      title={itemMode.type === 'create' ? 'Новый товар' : 'Изменить товар'}
      initial={itemMode.type === 'create' ? emptyDraft : draftFromItem(itemMode.item)}
      categories={sortedCategories}
      pending={pending}
      error={formError}
      onClose={() => { if (!pending) setItemMode(null) }}
      onSubmit={saveItem}
    />
  )

  return (
    <main className="shell">
      <Header />
      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Товары</h2>
            <p className="muted">{summary()}</p>
          </div>
          <div className="actions">
            <button type="button" className="button button-primary" onClick={openCreateItem}>Добавить товар</button>
            <button type="button" className="button button-ghost" onClick={openCategories}>Категории</button>
          </div>
        </div>
        <FiltersBar
          search={search}
          onSearch={setSearch}
          sort={sort}
          onSort={setSort}
          filter={filter}
          onFilter={setFilter}
          categories={sortedCategories}
          counts={counts}
        />
        {error && <p className="banner" role="alert">{error}</p>}
        {loading ? <p className="muted">Загрузка товаров…</p> : visibleItems.length === 0 ? (
          <div className="empty">
            <h3>{items.length === 0 ? 'Пока пусто' : 'Ничего не нашлось'}</h3>
          </div>
        ) : (
          <div className="grid">
            {visibleItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                categoryName={categoryName(item.categoryId)}
                onEdit={openEditItem}
                onDelete={deleteListedItem}
              />
            ))}
          </div>
        )}
      </section>
      {itemDialog}
      {categoriesOpen && (
        <CategoryManager
          categories={sortedCategories}
          counts={counts.byCategory}
          pending={pending}
          error={formError}
          onClose={() => { if (!pending) setCategoriesOpen(false) }}
          onCreate={createListedCategory}
          onRename={renameListedCategory}
          onDelete={deleteListedCategory}
        />
      )}
    </main>
  )
}
