import { useEffect, useMemo, useRef, useState } from 'react'
import A from '../components/A'
import Icon from '../components/Icon'
import Card from '../components/Card'
import { Rv, useApp, useInView } from '../hooks.jsx'
import { D, fmt } from '../data'

const TABS = [
  ['s-over', 'Overview'],
  ['s-svc', 'Services & Pricing'],
  ['s-ph', 'Photos'],
  ['s-rev', 'Reviews (186)'],
  ['s-loc', 'Location'],
]
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const GAL = ['t-night', 't-turf2', 't-night', 't-turf']
const PGAL = ['t-night', 't-turf', 't-turf2', 't-gym', 't-night', 't-turf', 't-turf2', 't-night']
const LB_ITEMS = [...GAL, ...PGAL]
const FAC = [
  ['i-light', 'Floodlights'],
  ['i-door', 'Changing rooms'],
  ['i-car', 'Parking'],
  ['i-drop', 'Drinking water'],
  ['i-sofa', 'Rest area'],
  ['i-shield', 'First-aid kit'],
]
const REVIEWS = [
  ['RS', 'Rohit S.', 'Oct 2026', '★★★★★', 'Best turf in the city. Lights are great for night games, and the staff is genuinely helpful. Booked via WhatsApp and got a slot in minutes.'],
  ['AK', 'Aman K.', 'Sep 2026', '★★★★☆', 'Turf quality is excellent. Parking gets crowded on weekends, so arrive early.'],
  ['PM', 'Priya M.', 'Aug 2026', '★★★★★', 'We hosted our office tournament here. Clean changing rooms and fair pricing.'],
]
const BARS = [[5, 84, 156], [4, 12, 22], [3, 3, 5], [2, 1, 2], [1, 1, 1]]

function RatingBar({ s, w, n }) {
  const ref = useInView(0.5)
  return (
    <div className="rbar" ref={ref}>
      {s} <i><b style={{ width: w + '%' }}></b></i> {n}
    </div>
  )
}

function Lightbox({ index, setIndex }) {
  const closeRef = useRef(null)
  const open = index !== null
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') setIndex(null)
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + LB_ITEMS.length) % LB_ITEMS.length)
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % LB_ITEMS.length)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
  }, [open, setIndex])
  const step = (d) => setIndex((i) => (i + d + LB_ITEMS.length) % LB_ITEMS.length)
  return (
    <div className={`lb${open ? ' show' : ''}`} role="dialog" aria-modal="true" aria-label="Photo viewer" onClick={(e) => e.target === e.currentTarget && setIndex(null)}>
      <button className="x" aria-label="Close" ref={closeRef} onClick={() => setIndex(null)}>✕</button>
      <button className="pv2" aria-label="Previous" onClick={() => step(-1)}>‹</button>
      <div className="stage">{open && <div key={index} className={`ph ${LB_ITEMS[index]}`}></div>}</div>
      <button className="nx" aria-label="Next" onClick={() => step(1)}>›</button>
      <div className="cn">{open ? `${index + 1} / ${LB_ITEMS.length}` : ''}</div>
    </div>
  )
}

function EnquiryForm({ biz, formRef, nameRef }) {
  const { toast } = useApp()
  const [v, setV] = useState({ name: '', phone: '', date: '', slot: '6–8 PM', msg: '' })
  const [err, setErr] = useState({})
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const tests = {
    name: (x) => x.trim().length > 1,
    phone: (x) => /^[6-9]\d{9}$/.test(x.trim()),
    msg: (x) => x.trim().length > 4,
  }
  const upd = (k, val) => {
    setV((o) => ({ ...o, [k]: val }))
    if (err[k] && tests[k]?.(val)) setErr((e) => ({ ...e, [k]: false }))
  }
  const blur = (k) => {
    if (v[k].trim() || err[k]) setErr((e) => ({ ...e, [k]: !tests[k](v[k]) }))
  }
  const today = new Date().toISOString().slice(0, 10)

  const submit = (e) => {
    e.preventDefault()
    const bad = Object.fromEntries(Object.keys(tests).map((k) => [k, !tests[k](v[k])]))
    setErr(bad)
    if (Object.values(bad).some(Boolean)) {
      const first = ['name', 'phone', 'msg'].find((k) => bad[k])
      formRef.current?.querySelector(`[data-f="${first}"]`)?.focus()
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setV({ name: '', phone: '', date: '', slot: '6–8 PM', msg: '' })
      setSent(true)
      toast('Enquiry sent to ' + biz.n)
    }, 900)
  }

  return (
    <form className="eform" id="enq" ref={formRef} onSubmit={submit} noValidate>
      <h3>Send an enquiry</h3>
      <div className="pr">From <b>{fmt(biz.p)}</b> / {biz.u}</div>
      <div className={`fld${err.name ? ' err' : ''}`}>
        <label>Your name</label>
        <input data-f="name" ref={nameRef} value={v.name} placeholder="Full name" onChange={(e) => upd('name', e.target.value)} onBlur={() => blur('name')} />
        <div className="em">Please enter your name</div>
      </div>
      <div className={`fld${err.phone ? ' err' : ''}`}>
        <label>Phone</label>
        <input data-f="phone" value={v.phone} placeholder="10-digit mobile" inputMode="numeric" onChange={(e) => upd('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} onBlur={() => blur('phone')} />
        <div className="em">Enter a valid 10-digit number</div>
      </div>
      <div className="two">
        <div className="fld"><label>Date</label><input type="date" min={today} value={v.date} onChange={(e) => upd('date', e.target.value)} /></div>
        <div className="fld">
          <label>Slot</label>
          <select value={v.slot} onChange={(e) => upd('slot', e.target.value)}>
            <option>6–8 PM</option>
            <option>8–10 PM</option>
            <option>6–8 AM</option>
          </select>
        </div>
      </div>
      <div className={`fld${err.msg ? ' err' : ''}`}>
        <label>Message</label>
        <textarea data-f="msg" rows="3" value={v.msg} placeholder="Team size, requirements…" onChange={(e) => upd('msg', e.target.value)} onBlur={() => blur('msg')}></textarea>
        <div className="em">Tell us a little about what you need</div>
      </div>
      <button className={`btn btn-o${loading ? ' load' : ''}`} style={{ width: '100%' }} type="submit">Send enquiry</button>
      <div className="meta" style={{ marginTop: 10, justifyContent: 'center', fontSize: 12 }}>Usually replies within 30 minutes</div>
      {sent && (
        <div className="sent">
          <div className="ck"><Icon id="i-check" /></div>
          <h3>Enquiry sent!</h3>
          <p>{biz.n} usually replies within 30 minutes. We'll notify you on WhatsApp.</p>
          <button className="btn btn-l btn-sm" type="button" onClick={() => setSent(false)}>Send another</button>
        </div>
      )}
    </form>
  )
}

export default function Profile() {
  const { bizId, focusEnq, go, toast } = useApp()
  const biz = D.find((b) => b.id === bizId) || D[0]
  const [activeTab, setActiveTab] = useState('s-over')
  const [lb, setLb] = useState(null)
  const tabsRef = useRef(null)
  const formRef = useRef(null)
  const nameRef = useRef(null)

  const today = (new Date().getDay() + 6) % 7
  const related = useMemo(() => {
    const r = D.filter((x) => x.c === biz.c && x.id !== biz.id).slice(0, 2)
    return r.length ? r : D.slice(0, 2)
  }, [biz])

  // scroll-spy for the sticky tabs
  useEffect(() => {
    let tick = false
    const on = () => {
      let cur = TABS[0][0]
      TABS.forEach(([id]) => {
        const t = document.getElementById(id)
        if (t && t.getBoundingClientRect().top < 230) cur = id
      })
      setActiveTab(cur)
      tick = false
    }
    const h = () => {
      if (!tick) {
        tick = true
        requestAnimationFrame(on)
      }
    }
    addEventListener('scroll', h, { passive: true })
    return () => removeEventListener('scroll', h)
  }, [])

  useEffect(() => {
    const a = tabsRef.current?.querySelector('a.on')
    if (a) tabsRef.current.scrollTo({ left: a.offsetLeft - 20, behavior: 'smooth' })
  }, [activeTab])

  // "Enquire" on a card jumps to the form
  useEffect(() => {
    if (!focusEnq) return
    const t = setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      nameRef.current?.focus({ preventScroll: true })
    }, 150)
    return () => clearTimeout(t)
  }, [focusEnq])

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setTimeout(() => nameRef.current?.focus({ preventScroll: true }), 400)
  }

  return (
    <main className="page on">
      <div className="wrap">
        <Rv className="crumb">
          <A page="home">Home</A> › <A page="explore" cat={biz.c}>{biz.c}</A> › <span>{biz.n}</span>
        </Rv>
        <Rv className="gal">
          <div className="ph t-night big" onClick={() => setLb(0)}>
            <span className="pcount">1 / 12</span>
          </div>
          <div className="gside">
            <div className="ph t-turf2" onClick={() => setLb(1)}></div>
            <div className="ph t-night" onClick={() => setLb(2)}></div>
            <div className="ph t-turf" onClick={() => setLb(3)}>
              <div className="more">+9<br />Photos</div>
            </div>
          </div>
        </Rv>

        <Rv className="phead">
          <div>
            <h1>
              <span>{biz.n}</span>{' '}
              {biz.v ? (
                <span className="vtag"><Icon id="i-ok" />Verified</span>
              ) : null}
            </h1>
            <div className="meta" style={{ marginTop: 8, fontSize: 14 }}>
              <span style={{ color: 'var(--black)', fontWeight: 800, display: 'flex', gap: 4, alignItems: 'center' }}>
                <Icon id="i-star" w={15} style={{ color: 'var(--orange)' }} />
                {biz.r}
              </span>{' '}
              ({biz.rv} reviews) · <span>{biz.l}, Lucknow</span> · {biz.c.replace(/s$/, '')}
            </div>
          </div>
          <div className="pact">
            <a className="btn btn-o" href="#enq" onClick={(e) => { e.preventDefault(); scrollToForm() }}>Enquire Now</a>
            <button className="btn btn-l" onClick={() => toast('Calling +91 98765 43210…')}><Icon id="i-phone" w={16} />Call</button>
            <button className="btn btn-wa" onClick={() => toast('Opening WhatsApp chat…')}><Icon id="i-wa" w={17} style={{ color: '#25D366' }} />WhatsApp</button>
          </div>
        </Rv>

        <nav className="tabs" ref={tabsRef}>
          {TABS.map(([id, label]) => (
            <a
              key={id}
              className={activeTab === id ? 'on' : ''}
              href={`#${id}`}
              onClick={(e) => {
                e.preventDefault()
                setActiveTab(id)
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="pl">
          <div>
            <Rv className="blk" id="s-over">
              <h2>About</h2>
              <p style={{ color: '#444' }}>
                {biz.n} is a premium {biz.c.toLowerCase().replace(/s$/, '')} in {biz.l}, Lucknow with high-quality facilities, floodlights and modern amenities. Ideal for training sessions, matches and corporate bookings.
              </p>
              <div className="info3">
                <div><Icon id="i-clock" /><span><b style={{ color: 'var(--green)' }}>Open now</b>6:00 AM – 11:00 PM</span></div>
                <div><Icon id="i-pin" /><span><b>{biz.l}</b>Lucknow</span></div>
                <div><Icon id="i-car" /><span><b>5.4 km</b>from city centre</span></div>
              </div>
            </Rv>
            <Rv className="blk">
              <h2>Facilities</h2>
              <div className="fac">
                {FAC.map(([ic, l]) => <div key={l}><Icon id={ic} />{l}</div>)}
              </div>
            </Rv>
            <Rv className="blk" id="s-svc">
              <h2>Services &amp; pricing</h2>
              <table className="pt">
                <tbody>
                  <tr><th>Service</th><th>Duration</th><th>Price</th></tr>
                  <tr><td>5-a-side · Weekday</td><td>1 hour</td><td>₹700</td></tr>
                  <tr><td>5-a-side · Weekend</td><td>1 hour</td><td>₹900</td></tr>
                  <tr><td>7-a-side · Full turf</td><td>1 hour</td><td>₹1,200</td></tr>
                  <tr><td>Tournament booking</td><td>Full day</td><td>₹9,500</td></tr>
                  <tr><td>Monthly coaching</td><td>12 sessions</td><td>₹2,400</td></tr>
                </tbody>
              </table>
            </Rv>
            <Rv className="blk">
              <h2>Opening hours</h2>
              <div className="hrs">
                {DAYS.map((d, i) => (
                  <div key={d} className={i === today ? 'today' : ''}>
                    <span>{d}{i === today ? ' (today)' : ''}</span>
                    <span>6:00 AM – 11:00 PM</span>
                  </div>
                ))}
              </div>
            </Rv>
            <Rv className="blk" id="s-ph">
              <h2>Photos</h2>
              <div className="pgal">
                {PGAL.map((c, i) => <div key={i} className={`ph ${c}`} onClick={() => setLb(GAL.length + i)}></div>)}
              </div>
            </Rv>
            <Rv className="blk" id="s-rev">
              <h2>Customer reviews</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 24, alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-.04em', lineHeight: 1 }}>{biz.r}</div>
                  <div className="o">★★★★★</div>
                  <div className="meta">{biz.rv} reviews</div>
                </div>
                <div>{BARS.map(([s, w, n]) => <RatingBar key={s} s={s} w={w} n={n} />)}</div>
              </div>
              {REVIEWS.map(([ini, name, date, stars, text]) => (
                <div className="rev" key={name}>
                  <div className="u">
                    <span className="av">{ini}</span>
                    <div><b>{name}</b><div className="meta">{date} · <span className="o">{stars}</span></div></div>
                  </div>
                  <p>{text}</p>
                </div>
              ))}
            </Rv>
            <Rv className="blk" id="s-loc">
              <h2>Location</h2>
              <div className="map" style={{ height: 260 }}>
                <svg className="bg" viewBox="0 0 700 260" preserveAspectRatio="xMidYMid slice">
                  <rect width="700" height="260" fill="#ece7dc" />
                  <g stroke="#fff" strokeWidth="8" fill="none"><path d="M0 90H700M0 190 700 170M200 0V260M480 0 500 260" /></g>
                </svg>
                <span className="pin on" style={{ left: '50%', top: '55%' }}>{biz.n}</span>
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <span className="meta"><Icon id="i-pin" w={16} style={{ color: 'var(--orange)' }} />Sector 12, {biz.l}, Lucknow 226016</span>
                <button className="btn btn-k btn-sm" style={{ marginLeft: 'auto' }} onClick={() => toast('Opening Google Maps directions…')}>Get directions</button>
              </div>
            </Rv>
            <div className="sh" style={{ marginTop: 34 }}><div><h2 style={{ fontSize: 24 }}>Related businesses</h2></div></div>
            <div className="grid3" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
              {related.map((b, i) => <Card key={b.id} b={b} i={i} />)}
            </div>
          </div>

          <aside>
            <EnquiryForm key={biz.id} biz={biz} formRef={formRef} nameRef={nameRef} />
          </aside>
        </div>
      </div>

      <div className="mbar">
        <button className="btn btn-l" onClick={() => toast('Calling +91 98765 43210…')}>Call</button>
        <button className="btn btn-wa" onClick={() => toast('Opening WhatsApp chat…')}>WhatsApp</button>
        <button className="btn btn-o" onClick={scrollToForm}>Enquire</button>
      </div>
      <Lightbox index={lb} setIndex={setLb} />
    </main>
  )
}
