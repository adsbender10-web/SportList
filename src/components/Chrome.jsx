import { useEffect, useRef, useState } from 'react'
import A from './A'
import Icon from './Icon'
import { useApp } from '../hooks.jsx'
import { D, ICON, CATEGORIES } from '../data'

export const PAGES = [
  ['home', 'Homepage'],
  ['explore', 'Explore + Map'],
  ['profile', 'Business Profile'],
  ['register', 'Register Business'],
  ['owner', 'Owner Dashboard'],
  ['admin', 'Admin Panel'],
  ['blog', 'Blog'],
]

export function PreviewBar() {
  const { page, go } = useApp()
  return (
    <div className="pv">
      <div className="wrap">
        <b>SportList · Design preview</b>
        {PAGES.map(([id, label], i) => (
          <A key={id} page={id} className={page === id ? 'on' : ''}>
            <i>{String(i + 1).padStart(2, '0')}</i>
            {label}
          </A>
        ))}
      </div>
    </div>
  )
}

const esc = (s) => s
function Hl({ t, v }) {
  const i = t.toLowerCase().indexOf(v)
  if (i < 0) return esc(t)
  return (
    <>
      {t.slice(0, i)}
      <mark>{t.slice(i, i + v.length)}</mark>
      {t.slice(i + v.length)}
    </>
  )
}

function SearchBox() {
  const { go, openBiz, setFilters } = useApp()
  const [val, setVal] = useState('')
  const [open, setOpen] = useState(false)
  const [ai, setAi] = useState(-1)
  const inputRef = useRef(null)

  const v = val.trim().toLowerCase()
  const cats = v ? CATEGORIES.map((c) => c.name).filter((c) => c.toLowerCase().includes(v)).slice(0, 2) : []
  const biz = v ? D.filter((b) => (b.n + ' ' + b.l + ' ' + b.c).toLowerCase().includes(v)).slice(0, 5) : []
  const items = [...cats.map((c) => ({ t: 'c', c })), ...biz.map((b) => ({ t: 'b', b }))]

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const close = () => {
    setOpen(false)
    setAi(-1)
  }
  const pick = (it) => {
    if (!it) return
    close()
    inputRef.current?.blur()
    setVal('')
    if (it.t === 'c') go('explore', it.c)
    else openBiz(it.b.id)
  }
  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!items.length) return
      e.preventDefault()
      setAi((a) => (a + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (ai >= 0) pick(items[ai])
      else {
        setFilters((f) => ({ ...f, q: val.trim() }))
        close()
        go('explore', 'all')
      }
    } else if (e.key === 'Escape') {
      close()
      inputRef.current?.blur()
    }
  }

  return (
    <div className="nsearch">
      <Icon id="i-search" />
      <input
        ref={inputRef}
        value={val}
        placeholder="Search gyms, cricket academies, turfs…"
        autoComplete="off"
        aria-label="Search"
        role="combobox"
        aria-expanded={open && !!v}
        onChange={(e) => {
          setVal(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(close, 120)}
        onKeyDown={onKeyDown}
      />
      <kbd>/</kbd>
      <div className={`sugg${open && v ? ' show' : ''}`} role="listbox">
        {cats.length > 0 && <div className="sh2">Categories</div>}
        {cats.map((c, i) => (
          <button key={c} className={ai === i ? 'act' : ''} onMouseDown={(e) => { e.preventDefault(); pick(items[i]) }}>
            <Icon id={ICON[c]} />
            <span><Hl t={c} v={v} /></span>
          </button>
        ))}
        {biz.length > 0 && <div className="sh2">Venues</div>}
        {biz.map((b, i) => {
          const idx = cats.length + i
          return (
            <button key={b.id} className={ai === idx ? 'act' : ''} onMouseDown={(e) => { e.preventDefault(); pick(items[idx]) }}>
              <Icon id="i-pin" />
              <span>
                <Hl t={b.n} v={v} />
                <small>{b.c} · {b.l} · ★ {b.r}</small>
              </span>
            </button>
          )
        })}
        {v && !items.length && (
          <div className="sh2" style={{ padding: '12px 10px' }}>No matches — press Enter to search anyway</div>
        )}
      </div>
    </div>
  )
}

export function Nav() {
  const { go, saved, setSavedOnly, toast } = useApp()
  const [scrolled, setScrolled] = useState(false)
  const [bump, setBump] = useState(0)
  const [menu, setMenu] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    addEventListener('scroll', onScroll, { passive: true })
    return () => removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => {
    if (saved.length || bump) setBump((b) => b + 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved.length])

  const openSaved = () => {
    if (!saved.length) {
      toast('Tap the ♥ on any venue to save it')
      return
    }
    setSavedOnly(true)
    setMenu(false)
    go('explore', 'all')
  }
  return (
    <header className={`nav${scrolled ? ' scrolled' : ''}`}>
      <div className="wrap">
        <A page="home" className="logo">
          <span className="mk">
            <svg viewBox="0 0 24 24" fill="#fff"><path d="M13 2 4 14h6l-1 8 9-12h-6z" /></svg>
          </span>
          SportList
        </A>
        <SearchBox />
        <span className="city">
          <Icon id="i-pin" w={14} style={{ color: 'var(--orange)' }} />
          Lucknow ▾
        </span>
        <nav className="nlinks">
          <A page="explore">Explore</A>
          <A page="blog">Guides</A>
          <A page="register">List your business</A>
        </nav>
        <button key={bump} className={`saved${saved.length ? ' has' : ''}${bump > 0 ? ' bump' : ''}`} aria-label="Saved venues" onClick={openSaved}>
          <Icon id={saved.length ? "i-heart-on" : "i-heart"} w={20} />
          <span>{saved.length}</span>
        </button>
        <button className="btn btn-k btn-sm signin" onClick={() => go('owner')}>Sign in</button>
        <button className="ham" aria-label={menu ? 'Close menu' : 'Open menu'} aria-expanded={menu} onClick={() => setMenu((m) => !m)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            {menu ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>
      {menu && (
        <div className="mmenu">
          <SearchBox />
          {[
            ['home', 'Home'],
            ['explore', 'Explore venues'],
            ['blog', 'Guides'],
            ['register', 'List your business'],
            ['owner', 'Owner dashboard'],
            ['admin', 'Admin panel'],
          ].map(([p, label]) => (
            <A key={p} page={p} onClick={() => setMenu(false)}>{label}</A>
          ))}
        </div>
      )}
    </header>
  )
}

export function CatBar() {
  const { cat, selectCat } = useApp()
  return (
    <div className="cats">
      <div className="wrap">
        <button className={cat === 'all' ? 'on' : ''} onClick={() => selectCat('all')}>
          <Icon id="i-grid" w={16} />All
        </button>
        {CATEGORIES.map((c) => (
          <button key={c.name} className={cat === c.name ? 'on' : ''} onClick={() => selectCat(c.name)}>
            <Icon id={c.icon} w={16} />{c.name}
          </button>
        ))}
      </div>
    </div>
  )
}

export function Footer() {
  const { go } = useApp()
  const L = ({ page, cat, children }) => <A page={page} cat={cat}>{children}</A>
  return (
    <footer>
      <div className="wrap">
        <div className="g">
          <div>
            <a className="logo" style={{ color: 'var(--black)' }}>
              <span className="mk">
                <svg viewBox="0 0 24 24" fill="#fff"><path d="M13 2 4 14h6l-1 8 9-12h-6z" /></svg>
              </span>
              SportList
            </a>
            <p style={{ marginTop: 12, fontSize: 14, maxWidth: 280 }}>India's sports business directory. Starting in Lucknow.</p>
          </div>
          <div>
            <h4>Explore</h4>
            <L page="explore" cat="Gyms & Fitness">Gyms in Lucknow</L>
            <L page="explore" cat="Football Turfs">Football turfs</L>
            <L page="explore" cat="Cricket Academies">Cricket academies</L>
            <L page="explore" cat="Swimming Pools">Swimming pools</L>
          </div>
          <div>
            <h4>Business</h4>
            <L page="register">List your business</L>
            <L page="owner">Owner login</L>
            <L page="owner">Pricing</L>
          </div>
          <div>
            <h4>Company</h4>
            <L page="blog">Guides</L>
            <a>About</a>
            <a>Contact</a>
            <a>Privacy</a>
          </div>
        </div>
        <div className="cp">
          <span>© 2026 SportList. All rights reserved.</span>
          <span>Made in Lucknow</span>
        </div>
      </div>
    </footer>
  )
}

/** Scroll progress bar + back-to-top button */
export function ScrollFx() {
  const barRef = useRef(null)
  const [show, setShow] = useState(false)
  useEffect(() => {
    let tick = false
    const rm = matchMedia('(prefers-reduced-motion: reduce)').matches
    const on = () => {
      const y = scrollY
      const h = document.documentElement.scrollHeight - innerHeight
      if (barRef.current) barRef.current.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, y / h) : 0) + ')'
      setShow(y > 700)
      if (!rm) document.documentElement.style.setProperty('--py', (Math.min(y, 700) * 0.06).toFixed(1) + 'px')
      tick = false
    }
    const handler = () => {
      if (!tick) {
        tick = true
        requestAnimationFrame(on)
      }
    }
    on()
    addEventListener('scroll', handler, { passive: true })
    addEventListener('resize', handler)
    return () => {
      removeEventListener('scroll', handler)
      removeEventListener('resize', handler)
    }
  }, [])
  return (
    <>
      <div id="sprog" ref={barRef}></div>
      <button id="toTop" className={show ? 'show' : ''} aria-label="Back to top" onClick={() => scrollTo({ top: 0, behavior: 'smooth' })}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6" /></svg>
      </button>
    </>
  )
}
