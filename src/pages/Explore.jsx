import { useEffect, useMemo, useState } from 'react'
import Card from '../components/Card'
import { prefersReducedMotion, useApp } from '../hooks.jsx'
import { D, LOCALITIES, fmt } from '../data'

const PER = 6
export const DEFAULT_FILTERS = { q: '', loc: 'all', price: 3000, indoor: true, outdoor: true, minR: 0, open: false, ver: false, sort: 'rel' }

const SkeletonCard = () => (
  <article className="card skel">
    <div className="ph"></div>
    <div className="bd">
      <div className="sk" style={{ width: '70%', height: 18 }}></div>
      <div className="sk" style={{ width: '45%' }}></div>
      <div className="sk" style={{ width: '60%' }}></div>
      <div className="sk" style={{ width: '35%', height: 22, marginTop: 'auto' }}></div>
    </div>
  </article>
)

export default function Explore() {
  const { cat, selectCat, filters, setFilters, savedOnly, setSavedOnly, saved, openBiz } = useApp()
  const [view, setView] = useState('grid')
  const [pg, setPg] = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [activePin, setActivePin] = useState(null)
  const [loading, setLoading] = useState(!prefersReducedMotion())
  const f = filters

  useEffect(() => {
    if (!loading) return
    const t = setTimeout(() => setLoading(false), 420)
    return () => clearTimeout(t)
  }, [loading])

  // any change to the filter inputs sends you back to page 1
  useEffect(() => setPg(1), [cat, filters, savedOnly])

  const set = (patch) => setFilters((old) => ({ ...old, ...patch }))

  const results = useMemo(() => {
    const q = f.q.trim().toLowerCase()
    const r = D.filter(
      (b) =>
        (cat === 'all' || b.c === cat) &&
        (f.loc === 'all' || b.l === f.loc) &&
        b.p <= f.price &&
        b.r >= f.minR &&
        ((b.io === 'Indoor' && f.indoor) || (b.io === 'Outdoor' && f.outdoor)) &&
        (!f.open || b.open) &&
        (!f.ver || b.v) &&
        (!q || (b.n + b.l + b.c + b.tags.join(' ')).toLowerCase().includes(q)) &&
        (!savedOnly || saved.includes(b.id)),
    )
    if (f.sort === 'rating') r.sort((a, b) => b.r - a.r)
    else if (f.sort === 'pop') r.sort((a, b) => b.pop - a.pop)
    else if (f.sort === 'plow') r.sort((a, b) => a.p - b.p)
    return r
  }, [cat, f, savedOnly, saved])

  const pages = Math.max(1, Math.ceil(results.length / PER))
  const page = Math.min(pg, pages)
  const shown = results.slice((page - 1) * PER, page * PER)
  const pinB = D.find((b) => b.id === activePin)

  const resetAll = () => {
    setFilters(DEFAULT_FILTERS)
    setSavedOnly(false)
    selectCat('all', { stay: true })
  }

  const chips = []
  if (cat !== 'all') chips.push(['cat', cat, () => selectCat('all', { stay: true })])
  if (f.loc !== 'all') chips.push(['loc', f.loc, () => set({ loc: 'all' })])
  if (f.price < 3000) chips.push(['price', 'Under ' + fmt(f.price), () => set({ price: 3000 })])
  if (f.minR > 0) chips.push(['rate', f.minR + '★ & up', () => set({ minR: 0 })])
  if (!f.indoor) chips.push(['io', 'Outdoor only', () => set({ indoor: true, outdoor: true })])
  if (!f.outdoor) chips.push(['io2', 'Indoor only', () => set({ indoor: true, outdoor: true })])
  if (f.open) chips.push(['open', 'Open now', () => set({ open: false })])
  if (f.ver) chips.push(['ver', 'Verified', () => set({ ver: false })])
  if (f.q.trim()) chips.push(['q', '“' + f.q.trim() + '”', () => set({ q: '' })])
  if (savedOnly) chips.push(['saved', 'Saved only', () => setSavedOnly(false)])

  return (
    <main className="page on">
      <div className="wrap">
        <div className={`xl showmap${view === 'map' ? ' mapview' : ''}`}>
          <aside className={`filters${filtersOpen ? ' open' : ''}`}>
            <h3>
              Filters <a onClick={resetAll}>Reset</a>
            </h3>
            <div className="fg" style={{ border: 0, paddingTop: 0 }}>
              <label className="t">Keyword</label>
              <input type="text" value={f.q} onChange={(e) => set({ q: e.target.value })} placeholder="e.g. floodlights" />
            </div>
            <div className="fg">
              <label className="t">Locality</label>
              <select value={f.loc} onChange={(e) => set({ loc: e.target.value })}>
                <option value="all">All Lucknow</option>
                {LOCALITIES.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className="fg">
              <label className="t">Max price (₹ / hour or month)</label>
              <input type="range" min="300" max="3000" step="50" value={f.price} onChange={(e) => set({ price: +e.target.value })} />
              <div className="meta" style={{ justifyContent: 'space-between' }}>
                <span>₹300</span>
                <b style={{ color: 'var(--black)' }}>{fmt(f.price)}</b>
              </div>
            </div>
            <div className="fg">
              <label className="t">Venue type</label>
              <label className="ck"><input type="checkbox" checked={f.indoor} onChange={(e) => set({ indoor: e.target.checked })} /> Indoor</label>
              <label className="ck"><input type="checkbox" checked={f.outdoor} onChange={(e) => set({ outdoor: e.target.checked })} /> Outdoor</label>
            </div>
            <div className="fg">
              <label className="t">Minimum rating</label>
              <div className="stars">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} className={n <= f.minR ? 'on' : ''} onClick={() => set({ minR: f.minR === n ? 0 : n })}>★</button>
                ))}
              </div>
            </div>
            <div className="fg">
              <label className="t">Availability</label>
              <label className="ck"><input type="checkbox" checked={f.open} onChange={(e) => set({ open: e.target.checked })} /> Open now</label>
              <label className="ck"><input type="checkbox" checked={f.ver} onChange={(e) => set({ ver: e.target.checked })} /> Verified only</label>
            </div>
          </aside>

          <section>
            <div className="xtop">
              <div>
                <h2>{(cat === 'all' ? 'All sports businesses' : cat) + ' in Lucknow'}</h2>
                <div className="meta">{loading ? 'Searching…' : `${results.length} result${results.length === 1 ? '' : 's'} found`}</div>
              </div>
              <div className="ctl">
                <button className="ftog" type="button" onClick={() => setFiltersOpen((o) => !o)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M7 12h10M10 18h4" /></svg>
                  Filters
                </button>
                <select value={f.sort} onChange={(e) => set({ sort: e.target.value })}>
                  <option value="rel">Sort: Relevance</option>
                  <option value="rating">Rating</option>
                  <option value="pop">Popularity</option>
                  <option value="plow">Price: low to high</option>
                </select>
                <div className="seg">
                  {[['grid', 'Grid'], ['list', 'List'], ['map', 'Map']].map(([v, l]) => (
                    <button key={v} className={view === v ? 'on' : ''} onClick={() => setView(v)}>{l}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="achips">
              {chips.map(([k, label, clear]) => (
                <button key={k} className="fchip" aria-label={`Remove filter ${label}`} onClick={clear}>
                  {label}
                  <span>×</span>
                </button>
              ))}
              {chips.length > 1 && <button className="fclear" onClick={resetAll}>Clear all</button>}
            </div>

            <div className={`xgrid${view === 'list' ? ' list' : ''}`}>
              {loading ? (
                Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)
              ) : shown.length ? (
                shown.map((b, i) => <Card key={b.id} b={b} i={i} />)
              ) : (
                <div className="empty">
                  <b>No venues match these filters</b>
                  Try widening your search or removing a filter.
                  <br />
                  <button className="btn btn-o btn-sm" onClick={resetAll}>Reset filters</button>
                </div>
              )}
            </div>
            {!loading && pages > 1 && (
              <div className="pgn">
                {Array.from({ length: pages }, (_, i) => (
                  <button
                    key={i}
                    className={i + 1 === page ? 'on' : ''}
                    onClick={() => {
                      setPg(i + 1)
                      window.scrollTo({ top: 60, behavior: 'smooth' })
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </section>

          <aside className="mapcol">
            <div className="map">
              <svg className="bg" viewBox="0 0 380 620" preserveAspectRatio="xMidYMid slice">
                <rect width="380" height="620" fill="#ece7dc" />
                <path d="M-10 420C80 380 150 470 240 430S350 350 400 380V460C350 430 270 520 220 500S80 460-10 500z" fill="#bcd6e2" />
                <g stroke="#fff" strokeWidth="7" fill="none" strokeLinecap="round">
                  <path d="M0 120H380M0 250 380 210M0 340H380M70 0V620M190 0 160 620M300 0 330 620" />
                </g>
                <g stroke="#d8d1c3" strokeWidth="2" fill="none">
                  <path d="M0 60H380M0 180H380M0 300H380M0 560H380M120 0V620M250 0V620" />
                </g>
                <g fill="#cfe3c4">
                  <rect x="210" y="60" width="70" height="60" rx="8" />
                  <rect x="20" y="260" width="60" height="55" rx="8" />
                </g>
                <text x="24" y="470" fill="#6a8fa3" fontSize="12" fontWeight="700" fontFamily="sans-serif" opacity=".8">Gomti River</text>
                <text x="150" y="330" fill="#8b8576" fontSize="22" fontWeight="800" fontFamily="sans-serif" opacity=".5">Lucknow</text>
              </svg>
              <div>
                {results.map((b) => (
                  <span
                    key={b.id}
                    className={`pin${activePin === b.id ? ' on' : ''}`}
                    style={{ left: b.x + '%', top: b.y + 8 + '%' }}
                    onClick={() => setActivePin(b.id)}
                  >
                    {fmt(b.p)}
                  </span>
                ))}
              </div>
              {pinB && results.includes(pinB) && (
                <div className="mpop">
                  <div className={`ph ${pinB.t}`}></div>
                  <div style={{ flex: 1 }}>
                    <b>{pinB.n}</b>
                    <div className="meta">{pinB.l} · ★ {pinB.r}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                      <b>
                        {fmt(pinB.p)}
                        <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}> /{pinB.u}</span>
                      </b>
                      <button className="enq" onClick={() => openBiz(pinB.id, true)}>Enquire</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
