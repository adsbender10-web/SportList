import { useCallback, useEffect, useRef, useState } from 'react'
import { AppCtx } from './hooks.jsx'
import { PreviewBar, Nav, CatBar, Footer, ScrollFx } from './components/Chrome'
import Home from './pages/Home'
import Explore, { DEFAULT_FILTERS } from './pages/Explore'
import Profile from './pages/Profile'
import Register from './pages/Register'
import Owner from './pages/Owner'
import Admin from './pages/Admin'
import Blog from './pages/Blog'

const PAGES = { home: Home, explore: Explore, profile: Profile, register: Register, owner: Owner, admin: Admin, blog: Blog }
const SHOW_CATS = ['home', 'explore', 'blog']

export default function App() {
  const [page, setPage] = useState('home')
  const [cat, setCat] = useState('all')
  const [bizId, setBizId] = useState(1)
  const [focusEnq, setFocusEnq] = useState(0)
  const [saved, setSaved] = useState([])
  const [savedOnly, setSavedOnly] = useState(false)
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [toastMsg, setToastMsg] = useState('')
  const [toastOn, setToastOn] = useState(false)
  const toastTimer = useRef()

  const toast = useCallback((m) => {
    setToastMsg(m)
    setToastOn(true)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastOn(false), 2200)
  }, [])

  const go = useCallback((p, c) => {
    if (c !== undefined) setCat(c)
    if (p !== 'explore') setSavedOnly((s) => (p === 'explore' ? s : false))
    setPage(p)
    window.scrollTo({ top: 0 })
  }, [])

  // category strip: from other pages jump to Explore, on Explore just filter
  const selectCat = useCallback(
    (c, opts = {}) => {
      setCat(c)
      if (!opts.stay && page !== 'explore') go('explore')
    },
    [page, go],
  )

  const openBiz = useCallback(
    (id, focus) => {
      setBizId(id)
      if (focus) setFocusEnq((n) => n + 1)
      go('profile')
    },
    [go],
  )

  const toggleSave = useCallback(
    (id) => {
      setSaved((s) => {
        const has = s.includes(id)
        toast(has ? 'Removed from favourites' : 'Saved to favourites')
        return has ? s.filter((x) => x !== id) : [...s, id]
      })
    },
    [toast],
  )

  useEffect(() => {
    document.body.dataset.page = page
  }, [page])

  const Page = PAGES[page]
  const ctx = { page, cat, bizId, focusEnq, saved, savedOnly, setSavedOnly, filters, setFilters, go, selectCat, openBiz, toggleSave, toast }

  return (
    <AppCtx.Provider value={ctx}>
      <PreviewBar />
      <Nav />
      {SHOW_CATS.includes(page) && <CatBar />}
      <Page key={page === 'profile' ? 'profile-' + bizId : page} />
      <Footer />
      <ScrollFx />
      <div className={`toast${toastOn ? ' show' : ''}`} role="status" aria-live="polite">{toastMsg}</div>
    </AppCtx.Provider>
  )
}
