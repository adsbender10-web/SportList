import { useEffect, useMemo, useRef, useState } from 'react'
import A from '../components/A'
import Icon from '../components/Icon'
import { BlogCard } from '../components/Card'
import Venue3D, { SLOTS as SLOTS3D } from '../components/Venue3D'
import { Rv, CountUp, useApp, useInView, useScrollVar } from '../hooks.jsx'
import { D, BL, CATEGORIES, ICON, fmt } from '../data'
import './home.css'

const IMG = {
  't-night': '/images/night-turf.jpg',
  't-turf': '/images/day-turf.jpg',
  't-turf2': '/images/day-turf.jpg',
  't-gym': '/images/gym.jpg',
  't-pool': '/images/pool.jpg',
  't-crick': '/images/cricket.jpg',
  't-court': '/images/badminton.jpg',
}
const SPORTS = [
  { cat: 'Football Turfs', label: 'Football', img: '/images/night-turf.jpg' },
  { cat: 'Cricket Academies', label: 'Cricket', img: '/images/cricket.jpg' },
  { cat: 'Badminton Courts', label: 'Badminton', img: '/images/badminton.jpg' },
  { cat: 'Swimming Pools', label: 'Swimming', img: '/images/pool.jpg' },
  { cat: 'Gyms & Fitness', label: 'Fitness', img: '/images/gym.jpg' },
]
const bg = (t) => ({ backgroundImage: `url(${IMG[t] || t})` })

export default function Home() {
  return (
    <main className="page on hm">
      <Hero />
      <Venue3DSection />
      <Trust />
      <Marquee />
      <Spotlight />
      <SportPicker />
      <Tour />
      <Steps />
      <OwnerCta />
      <section className="hm-guides wrap">
        <Rv className="sh">
          <div>
            <h2>Sports guides</h2>
            <p>Local advice for choosing where to play.</p>
          </div>
          <A page="blog">All guides →</A>
        </Rv>
        <div className="blogs">
          {BL.slice(0, 3).map((b, i) => <BlogCard key={b.t} b={b} i={i} />)}
        </div>
      </section>
    </main>
  )
}

/* ---------- 1. Hero ---------- */
function Hero() {
  const { go, openBiz } = useApp()
  const ref = useScrollVar('exit')
  const [cat, setCat] = useState('all')
  const star = D[0]
  return (
    <section className="hm-hero" ref={ref}>
      <div className="hm-stage">
        <div className="hm-bgwrap"><div className="hm-bg" style={bg('t-night')} /></div>
        <div className="hm-shade" />

        <div className="hm-top">
          <span>Lucknow<br />Season ’26</span>
          <span className="hm-live"><i /> {CATEGORIES.reduce((s, c) => s + c.count, 0)} venues listed</span>
        </div>

        <h1 className="hm-title" aria-label="Play anywhere">
          <span className="l1"><span>PLAY</span></span>
          <span className="l2"><span>ANYWHERE</span></span>
        </h1>

        <button className="hm-float f1" onClick={() => openBiz(star.id)}>
          <span className="hm-pin" />
          <span className="th" style={bg(star.t)} />
          <span className="tx">
            <small>Featured · {star.c.replace(/s$/, '')}</small>
            <b>{star.n}</b>
            <span>★ {star.r} · {fmt(star.p)}/{star.u}</span>
            <em>View venue →</em>
          </span>
        </button>

        <div className="hm-bottom">
          <div>
            <p className="hm-kicker">Find it.<br />Play it.</p>
            <form
              className="hm-search"
              onSubmit={(e) => {
                e.preventDefault()
                go('explore', cat)
              }}
            >
              <Icon id="i-search" w={18} />
              <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category">
                <option value="all">All sports in Lucknow</option>
                {CATEGORIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
              <button type="submit">Search</button>
            </form>
          </div>
          <div className="hm-float f2">
            <div>
              <CountUp as="b" text="2,400+" />
              <div className="avs">
                {['AK', 'RS', 'NP'].map((x) => <i key={x}>{x}</i>)}
                <span>verified venues</span>
              </div>
            </div>
            <span className="th" style={bg('t-court')} />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- 1b. 3D venue preview ---------- */
const PREVIEW_IDS = [1, 8, 10, 12, 6]

function Venue3DSection() {
  const { openBiz } = useApp()
  const venues = useMemo(() => PREVIEW_IDS.map((id) => D.find((b) => b.id === id)), [])
  const [vid, setVid] = useState(venues[0].id)
  const [unit, setUnit] = useState(null)
  const v = venues.find((b) => b.id === vid)
  return (
    <section className="hm-3d wrap">
      <Rv className="hm-3d-head">
        <div>
          <small>3D venue preview</small>
          <h2>Walk the venue before you book.</h2>
          <p>Spin the map, check which pitch or court is free for your slot, and see the route from the gate.</p>
        </div>
        <div className="hm-3d-tabs" role="tablist" aria-label="Choose a venue">
          {venues.map((b) => (
            <button
              key={b.id}
              role="tab"
              aria-selected={b.id === vid}
              className={b.id === vid ? 'on' : ''}
              onClick={() => {
                setVid(b.id)
                setUnit(null)
              }}
            >
              <Icon id={ICON[b.c]} w={15} />
              {SPORTS.find((s) => s.cat === b.c).label}
            </button>
          ))}
        </div>
      </Rv>
      <Rv i={1} className="hm-3d-stage">
        <Venue3D key={v.id} biz={v} selectedId={unit?.id ?? null} onSelect={(u, slot) => setUnit(u ? { ...u, slot } : null)} />
        <div className="hm-3d-bar">
          <span className="th" style={bg(v.t)} />
          <div>
            <b>{v.n}</b>
            <small>{unit ? `${unit.name} · ${unit.slot} · ${fmt(unit.price)}/${unit.u}` : `${v.l}, Lucknow · ★ ${v.r}`}</small>
          </div>
          <button className="go" onClick={() => openBiz(v.id, !!unit)}>
            {unit ? `Enquire for ${unit.name}` : 'View venue'} →
          </button>
        </div>
      </Rv>
    </section>
  )
}

/* ---------- 2. Trust row ---------- */
function Trust() {
  const ringRef = useInView(0.6)
  return (
    <section className="hm-trust wrap">
      <Rv className="hm-ring">
        <div ref={ringRef} className="rg">
          <svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="54" /><circle className="on" cx="60" cy="60" r="54" /></svg>
          <div>
            <b>100%</b>
            <span>Listings checked<br />by our team</span>
          </div>
        </div>
      </Rv>
      <Rv i={1} className="hm-intro">
        <h2>
          The sports directory for people who’d rather be <span className="hm-pill" style={bg('t-turf')} /> playing than searching.
        </h2>
      </Rv>
      <Rv i={2} className="hm-no1">
        <b>#01</b>
        <div>
          <h3>Lucknow’s most trusted</h3>
          <p>Thousands of players use SportList to find turfs, courts and coaches — <span>with real photos, prices and reviews.</span></p>
        </div>
      </Rv>
    </section>
  )
}

/* ---------- 3. Marquee ---------- */
function Marquee() {
  const words = ['Football', 'Cricket', 'Badminton', 'Swimming', 'Fitness']
  const row = (
    <div className="mq-row">
      {words.map((w, i) => (
        <span key={w} className={i % 2 ? 'ol' : ''}>{w}<i>✦</i></span>
      ))}
    </div>
  )
  return (
    <div className="hm-marquee" aria-hidden="true">
      <div className="mq-track">{row}{row}</div>
    </div>
  )
}

/* ---------- 4. Big statement + tilted card carousel ---------- */
function Spotlight() {
  const { openBiz } = useApp()
  const ref = useScrollVar('fill')
  const list = useMemo(() => D.filter((b) => b.v).slice(0, 5), [])
  const [i, setI] = useState(0)
  const b = list[i]
  const step = (d) => setI((x) => (x + d + list.length) % list.length)
  return (
    <section className="hm-show" ref={ref}>
      <div className="hm-words">
        <span className="ln a">Verified, rated</span>
        <div className="hm-card" onClick={() => openBiz(b.id)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && openBiz(b.id)}>
          <div key={b.id} className="in" style={bg(b.t)}>
            <span className="tag">
              <b>{b.n}</b>
              <small>{b.c} · {b.l}</small>
            </span>
            <span className="rt">★ {b.r}</span>
          </div>
        </div>
        <span className="ln b">&amp; ready to play</span>
      </div>
      <div className="hm-ctrl">
        <button className="prev" aria-label="Previous venue" onClick={() => step(-1)}>‹</button>
        <div className="dots">
          {list.map((x, k) => (
            <button key={x.id} className={k === i ? 'on' : ''} aria-label={x.n} onClick={() => setI(k)} />
          ))}
        </div>
        <button className="nx" aria-label="Next venue" onClick={() => step(1)}>›</button>
      </div>
    </section>
  )
}

/* ---------- 5. Dark: choose your sport + pick a slot ---------- */
const SLOTS = ['06:00 – 07:00', '07:00 – 08:00', '16:00 – 17:00', '17:30 – 18:30', '19:00 – 20:00', '20:00 – 21:00']

function SportPicker() {
  const { openBiz, toast } = useApp()
  const scroller = useRef(null)
  const [si, setSi] = useState(0)
  const grounds = useMemo(() => D.filter((b) => b.c === SPORTS[si].cat), [si])
  const [gid, setGid] = useState(grounds[0].id)
  const g = grounds.find((b) => b.id === gid) || grounds[0]
  const [day, setDay] = useState(0)
  const [slot, setSlot] = useState(null)
  const [view, setView] = useState('photo')
  const [unit, setUnit] = useState(null)

  const days = useMemo(() => {
    const t = new Date()
    return Array.from({ length: 7 }, (_, k) => {
      const d = new Date(t.getFullYear(), t.getMonth(), t.getDate() + k)
      return { n: d.getDate(), w: d.toLocaleDateString('en-IN', { weekday: 'short' }) }
    })
  }, [])
  const booked = (k) => (g.id * 3 + day * 5 + k * 7) % 5 === 0

  const pickSport = (k) => {
    if (k === si) return
    setSi(k)
    setGid(D.find((b) => b.c === SPORTS[k].cat).id)
    setSlot(null)
    setUnit(null)
  }
  const centerCard = (k) => {
    const sc = scroller.current
    const c = sc?.children[k]
    if (c) sc.scrollTo({ left: c.offsetLeft - (sc.clientWidth - c.offsetWidth) / 2, behavior: 'smooth' })
  }
  // whichever card is nearest the middle of the strip is the active sport
  useEffect(() => {
    const sc = scroller.current
    if (!sc) return
    let raf = 0
    const on = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const mid = sc.scrollLeft + sc.clientWidth / 2
        let best = 0
        let bd = Infinity
        ;[...sc.children].forEach((c, k) => {
          const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid)
          if (d < bd) [bd, best] = [d, k]
        })
        pickSport(best)
      })
    }
    sc.addEventListener('scroll', on, { passive: true })
    return () => {
      sc.removeEventListener('scroll', on)
      cancelAnimationFrame(raf)
    }
  })

  return (
    <section className="hm-dark">
      <div className="wrap">
        <Rv className="hm-dhead">
          <small>Pick · Compare · Enquire</small>
          <h2>Your next game is one tap away.</h2>
        </Rv>
        <div className="hm-panels">
          <Rv className="hm-panel">
            <div className="ph-h">
              <b>Choose your sport</b>
              <span>
                <button aria-label="Previous sport" onClick={() => centerCard(Math.max(0, si - 1))}>‹</button>
                <button aria-label="Next sport" onClick={() => centerCard(Math.min(SPORTS.length - 1, si + 1))}>›</button>
              </span>
            </div>
            <div className="hm-sports" ref={scroller}>
              {SPORTS.map((s, k) => (
                <button key={s.cat} className={k === si ? 'on' : ''} style={bg(s.img)} onClick={() => centerCard(k)}>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
            <div className="ph-h sm"><b>Grounds near you</b><span>{grounds.length} in Lucknow</span></div>
            <div className="hm-grounds">
              {grounds.slice(0, 4).map((b) => (
                <button
                  key={b.id}
                  className={b.id === g.id ? 'on' : ''}
                  onClick={() => {
                    setGid(b.id)
                    setSlot(null)
                    setUnit(null)
                  }}
                >
                  <span className="th" style={bg(b.t)} />
                  <span className="tx"><b>{b.n}</b><small>{b.l}, Lucknow</small></span>
                  <span className="pr">{fmt(b.p)}</span>
                </button>
              ))}
            </div>
          </Rv>

          <Rv i={1} className="hm-panel hm-book">
            <div className="vtabs" role="tablist" aria-label="Venue view">
              {[['photo', 'Photo'], ['3d', '3D map']].map(([k, l]) => (
                <button key={k} role="tab" aria-selected={view === k} className={view === k ? 'on' : ''} onClick={() => setView(k)}>{l}</button>
              ))}
            </div>
            {view === '3d' ? (
              <Venue3D
                compact
                key={g.id}
                biz={g}
                slot={slot == null ? 1 : slot % SLOTS3D.length}
                selectedId={unit?.id ?? null}
                onSelect={(u) => setUnit(u)}
              />
            ) : (
              <div key={g.id} className="cover" style={bg(g.t)}>
                <span className="ic"><Icon id={ICON[g.c]} w={18} /></span>
                <div>
                  <small>{g.c.replace(/s$/, '')}</small>
                  <b>{g.n}</b>
                  <span className="top">★ {g.r} · {g.rv} reviews</span>
                </div>
              </div>
            )}
            <div className="bd">
              <h4>Amenities</h4>
              <div className="am">
                {[g.io, ...g.tags, 'Free parking', 'Drinking water'].map((t) => <span key={t}>{t}</span>)}
              </div>
              <h4><Icon id="i-clock" w={13} /> Select a date</h4>
              <div className="days">
                {days.map((d, k) => (
                  <button
                    key={k}
                    className={k === day ? 'on' : ''}
                    onClick={() => {
                      setDay(k)
                      setSlot(null)
                    }}
                  >
                    <b>{d.n}</b>
                    <span>{d.w}</span>
                  </button>
                ))}
              </div>
              <h4><Icon id="i-clock" w={13} /> Select a time slot</h4>
              <div className="slots">
                {SLOTS.map((s, k) => (
                  <button key={s} disabled={booked(k)} className={slot === k ? 'on' : ''} onClick={() => setSlot(k)}>
                    {booked(k) ? 'Booked' : s}
                  </button>
                ))}
              </div>
              <div className="ft">
                <div>
                  <small>{unit ? unit.name : 'Price'}</small>
                  <b>{fmt(unit?.price ?? g.p)}</b>
                  <span>/ {g.u}</span>
                </div>
                <button
                  className="go"
                  onClick={() => {
                    if (slot == null) return toast('Pick a time slot first')
                    openBiz(g.id, true)
                  }}
                >
                  Enquire now
                </button>
              </div>
            </div>
          </Rv>
        </div>
      </div>
    </section>
  )
}

/* ---------- 6. Pinned horizontal tour ---------- */
function Tour() {
  const ref = useScrollVar('pin')
  const view = useRef(null)
  const track = useRef(null)
  const list = useMemo(() => [...D].sort((a, b) => b.r - a.r).slice(0, 6), [])
  const { openBiz } = useApp()

  useEffect(() => {
    const set = () => {
      if (!track.current || !view.current || !ref.current) return
      const dist = Math.max(0, track.current.scrollWidth - view.current.clientWidth + 40)
      ref.current.style.setProperty('--dist', dist + 'px')
    }
    set()
    const ro = new ResizeObserver(set)
    ro.observe(view.current)
    return () => ro.disconnect()
  }, [ref])

  return (
    <section className="hm-tour" ref={ref}>
      <div className="hm-tour-pin">
        <div className="hm-tour-head">
          <span className="th" style={bg('t-turf')} />
          <h2>Take a tour of the top-rated venues</h2>
          <p>Turfs, courts and pools players rated highest this month. Scroll to look around, tap one to see prices and photos.</p>
          <A page="explore" className="lnk">See all venues →</A>
          <div className="bar"><i /></div>
        </div>
        <div className="hm-tour-view" ref={view}>
          <div className="hm-tour-track" ref={track}>
            {list.map((b, k) => (
              <article key={b.id} className="tc" style={bg(b.t)} onClick={() => openBiz(b.id)} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && openBiz(b.id)}>
                <span className="no">{String(k + 1).padStart(2, '0')}</span>
                <span className="rt">★ {b.r}</span>
                <div className="cap">
                  <b>{b.n}</b>
                  <small>{b.c} · {b.l}</small>
                  <span>{fmt(b.p)} / {b.u}</span>
                </div>
              </article>
            ))}
            <A page="explore" className="tc more">
              <b>2,400+</b>
              <span>more venues to explore →</span>
            </A>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- 7. How it works ---------- */
function Steps() {
  const ref = useScrollVar('fill')
  const steps = [
    ['Search', 'Pick a sport and locality. Filter by price, rating and timing.'],
    ['Compare', 'Photos, price lists, facilities and real reviews side by side.'],
    ['Enquire', 'Message the owner or WhatsApp them directly. No middleman.'],
    ['Play', 'Show up and play, then leave a review for the next person.'],
  ]
  return (
    <section className="hm-steps wrap" ref={ref}>
      <Rv className="sh">
        <div>
          <h2>From search to the pitch</h2>
          <p>Four steps. No booking fees.</p>
        </div>
      </Rv>
      <div className="hm-track"><i /></div>
      <div className="hm-sg">
        {steps.map(([h, p], k) => (
          <div key={h} className="st" style={{ '--at': k / 4 + 0.05 }}>
            <span className="num">{String(k + 1).padStart(2, '0')}</span>
            <h3>{h}</h3>
            <p>{p}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ---------- 8. Owner CTA ---------- */
function OwnerCta() {
  return (
    <section className="wrap">
      <Rv className="hm-cta">
        <div className="tx">
          <small>For venue owners</small>
          <h2>Own a sports business? Get found by players.</h2>
          <ul>
            <li>Free listing, always</li>
            <li>Enquiries straight to WhatsApp</li>
            <li>Verified badge builds trust</li>
            <li>Profile views &amp; lead analytics</li>
          </ul>
          <A page="register" className="btn">List your business →</A>
        </div>
        <div className="im" style={bg('t-gym')} />
      </Rv>
    </section>
  )
}
