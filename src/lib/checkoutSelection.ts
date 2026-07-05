const storagePrefix = 'seapedia_checkout_product_ids'

function getStorageKey(userId?: string | null) {
  return `${storagePrefix}:${userId ?? 'guest'}`
}

export function saveCheckoutSelection(userId: string | null | undefined, productIds: string[]) {
  localStorage.setItem(getStorageKey(userId), JSON.stringify(Array.from(new Set(productIds))))
}

export function readCheckoutSelection(userId: string | null | undefined) {
  const rawValue = localStorage.getItem(getStorageKey(userId))
  if (!rawValue) return []

  try {
    const parsed = JSON.parse(rawValue)
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

export function clearCheckoutSelection(userId: string | null | undefined) {
  localStorage.removeItem(getStorageKey(userId))
}
