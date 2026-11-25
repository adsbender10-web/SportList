import { CATEGORIES, D } from './data'

export const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export const catFromSlug = (slug) => CATEGORIES.find((c) => slugify(c.name) === slug)?.name ?? 'all'

/** Page id -> URL path. */
export function pathFor(page, cat, id) {
  switch (page) {
    case 'explore':
      return cat && cat !== 'all' ? `/explore/${slugify(cat)}` : '/explore'
    case 'profile': {
      const b = D.find((x) => x.id === id) || D[0]
      return `/venue/${b.id}-${slugify(b.n)}`
    }
    case 'blog':
      return '/guides'
    case 'register':
    case 'owner':
    case 'admin':
      return '/' + page
    default:
      return '/'
  }
}

/** URL pathname -> { page, cat, bizId } (unknown paths fall back to home). */
export function parsePath(pathname) {
  const parts = pathname.replace(/\/+$/, '').split('/').filter(Boolean)
  const [a, b] = parts
  if (!a) return { page: 'home', cat: 'all', bizId: 1 }
  if (a === 'explore') return { page: 'explore', cat: b ? catFromSlug(b) : 'all', bizId: 1 }
  if (a === 'venue') {
    const id = parseInt(b, 10)
    return { page: 'profile', cat: 'all', bizId: D.some((x) => x.id === id) ? id : 1 }
  }
  if (a === 'guides') return { page: 'blog', cat: 'all', bizId: 1 }
  if (['register', 'owner', 'admin'].includes(a)) return { page: a, cat: 'all', bizId: 1 }
  return { page: 'home', cat: 'all', bizId: 1 }
}

export const TITLES = {
  home: 'SportList — Find Sports Businesses Near You',
  explore: 'Explore sports venues in Lucknow — SportList',
  profile: 'SportList',
  register: 'List your business — SportList',
  owner: 'Owner dashboard — SportList',
  admin: 'Admin panel — SportList',
  blog: 'Sports guides — SportList',
}
