import { useCallback, useEffect, useRef, useState } from 'react'
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom'
import { AppCtx } from './hooks.jsx'
import { PreviewBar, Nav, CatBar, Footer, ScrollFx } from './components/Chrome'
import Home from './pages/Home'
import Explore, { DEFAULT_FILTERS } from './pages/Explore'
import Profile from './pages/Profile'
import Register from './pages/Register'
import Owner from './pages/Owner'
import Admin from './pages/Admin'
import Blog from './pages/Blog'
import { D } from './data'
import { parsePath, pathFor, TITLES } from './routes'

const PAGES = { home: Home, explore: Explore, profile: Profile, register: Register, owner: Owner, admin: Admin, blog: Blog }
const SHOW_CATS = ['explore', 'blog']

function Shell() {
  const location = useLocation()
  const navigate = useNavigate()
  const { page, cat, bizId } = parsePath(location.pathname)
  const focusEnq = location.state?.focus ? location.key : 0

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

  const go = useCallback((p, c, id) => navigate(pathFor(p, c, id)), [navigate])

  // category strip: from other pages jump to Explore, on Explore just filter
  const selectCat = useCallback((c) => navigate(pathFor('explore', c)), [navigate])

  const openBiz = useCallback(
    (id, focus) => navigate(pathFor('profile', undefined, id), { state: focus ? { focus: true } : undefined }),
    [navigate],
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

  // new route: back to top, correct tab title, drop the "saved only" filter when leaving Explore
  useEffect(() => {
    document.body.dataset.page = page
    document.title = page === 'profile' ? `${D.find((b) => b.id === bizId)?.n ?? 'Venue'} — SportList` : TITLES[page]
    if (page !== 'explore') setSavedOnly(false)
    window.scrollTo({ top: 0 })
  }, [location.pathname, page, bizId])

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

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  )
}
