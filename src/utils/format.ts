export function normalizeUrl(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) throw new Error('Добавьте ссылку на товар.')

  const withProtocol = /^[a-z][a-z\d+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`
  let url: URL
  try {
    url = new URL(withProtocol)
  } catch {
    throw new Error('Ссылка выглядит некорректно.')
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Ссылка должна открываться по http:// или https://.')
  }

  return url.href
}

export function linkLabel(value: string): string {
  try {
    return new URL(value).host
  } catch {
    return value
  }
}

export function itemsLabel(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return `${String(count)} товар`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${String(count)} товара`
  return `${String(count)} товаров`
}
