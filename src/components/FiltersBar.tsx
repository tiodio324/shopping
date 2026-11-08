import type { Category, CategoryFilter, ItemSort } from '../types.ts'
import { CategoryMark } from './CategoryMark.tsx'

interface FiltersBarProps {
  search: string
  onSearch: (value: string) => void
  sort: ItemSort
  onSort: (sort: ItemSort) => void
  filter: CategoryFilter
  onFilter: (filter: CategoryFilter) => void
  categories: readonly Category[]
  counts: { all: number; none: number; byCategory: ReadonlyMap<string, number> }
}

function isSameFilter(current: CategoryFilter, next: CategoryFilter): boolean {
  if (current.kind !== next.kind) return false
  if (current.kind === 'category' && next.kind === 'category') return current.id === next.id
  return true
}

export function FiltersBar({ search, onSearch, sort, onSort, filter, onFilter, categories, counts }: FiltersBarProps) {
  const allFilter: CategoryFilter = { kind: 'all' }
  const otherFilter: CategoryFilter = { kind: 'none' }

  return (
    <div className="filters">
      <div className="filter-row">
        <label className="field field-grow">
          <span>Поиск</span>
          <input
            type="search"
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Название, комментарий или ссылка"
          />
        </label>
        <label className="field field-sort">
          <span>Сортировка</span>
          <select value={sort} onChange={(event) => onSort(event.target.value as ItemSort)}>
            <option value="new">Сначала новые</option>
            <option value="old">Сначала старые</option>
            <option value="name">Название А–Я</option>
            <option value="name-desc">Название Я–А</option>
          </select>
        </label>
      </div>
      <div className="chips" role="group" aria-label="Категория">
        <button
          type="button"
          className={isSameFilter(filter, allFilter) ? 'chip is-active' : 'chip'}
          aria-pressed={isSameFilter(filter, allFilter)}
          onClick={() => onFilter(allFilter)}
        >
          <CategoryMark name="Все" />
          <span>Все</span>
          <span className="chip-count">{counts.all}</span>
        </button>
        {categories.map((category) => {
          const next: CategoryFilter = { kind: 'category', id: category.id }
          const active = isSameFilter(filter, next)
          return (
            <button
              key={category.id}
              type="button"
              className={active ? 'chip is-active' : 'chip'}
              aria-pressed={active}
              onClick={() => onFilter(next)}
            >
              <CategoryMark name={category.name} />
              <span>{category.name}</span>
              <span className="chip-count">{counts.byCategory.get(category.id) ?? 0}</span>
            </button>
          )
        })}
        <button
          type="button"
          className={isSameFilter(filter, otherFilter) ? 'chip is-active' : 'chip'}
          aria-pressed={isSameFilter(filter, otherFilter)}
          onClick={() => onFilter(otherFilter)}
        >
          <CategoryMark name="Иное" muted />
          <span>Иное</span>
          <span className="chip-count">{counts.none}</span>
        </button>
      </div>
    </div>
  )
}
