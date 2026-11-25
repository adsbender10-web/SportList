import { useEffect, useMemo, useRef, useState } from 'react'
import Icon from './Icon'
import { prefersReducedMotion } from '../hooks.jsx'
import { fmt } from '../data'
import './venue3d.css'

/* Interactive isometric 3D floor plan of a venue, built with CSS 3D transforms (no WebGL).
   Plan coordinates are 640 x 440 "px" on the floor plane. */
const W = 640
const H = 440
const ENTRY = [380, 430]
export const SLOTS = ['6–8 AM', '6–8 PM', '8–10 PM']
const ISO = { tilt: 56, spin: -34, zoom: 1 }
const TOP = { tilt: 0, spin: 0, zoom: 1 }

const KIND = {
  'Football Turfs': 'football',
  'Cricket Academies': 'cricket',
  'Badminton Courts': 'badminton',
  'Swimming Pools': 'pool',
  'Gyms & Fitness': 'gym',
}

function unitsFor(kind, biz) {
  const p = biz.p
  const u = biz.u
  switch (kind) {
    case 'football':
      return [
        { id: 'A', name: 'Pitch A', sub: '5-a-side · artificial grass', x: 34, y: 34, w: 178, d: 252, price: p, u },
        { id: 'B', name: 'Pitch B', sub: '7-a-side · full turf', x: 232, y: 34, w: 184, d: 252, price: Math.round(p * 1.6), u },
      ]
    case 'cricket':
      return [0, 1, 2, 3].map((i) => ({
        id: 'N' + (i + 1), name: 'Net ' + (i + 1), sub: i < 2 ? 'Turf wicket · bowling machine' : 'Cement wicket', x: 36 + i * 98, y: 34, w: 84, d: 252, price: p, u,
      }))
    case 'badminton':
      return [0, 1, 2].map((i) => ({
        id: 'C' + (i + 1), name: 'Court ' + (i + 1), sub: 'Wooden floor · BWF lines', x: 38 + i * 130, y: 40, w: 112, d: 240, price: p, u,
      }))
    case 'pool':
      return [
        { id: 'L1', name: 'Lanes 1–2', sub: 'Lap swimming · 25 m', x: 44, y: 44, w: 290, d: 66, price: p, u },
        { id: 'L2', name: 'Lanes 3–4', sub: 'Coaching lanes', x: 44, y: 114, w: 290, d: 66, price: p, u },
        { id: 'L3', name: 'Lanes 5–6', sub: 'Open swim', x: 44, y: 184, w: 290, d: 66, price: p, u },
        { id: 'K', name: 'Kids pool', sub: '0.6 m deep · lifeguard', x: 352, y: 44, w: 66, d: 120, price: Math.round(p * 0.6), u },
      ]
    default:
      return [
        { id: 'Z1', name: 'Cardio zone', sub: 'Treadmills, bikes, rowers', x: 34, y: 34, w: 186, d: 120, price: p, u },
        { id: 'Z2', name: 'Strength zone', sub: 'Racks, benches, dumbbells', x: 236, y: 34, w: 182, d: 120, price: p, u },
        { id: 'Z3', name: 'Functional area', sub: 'Turf strip, sleds, kettlebells', x: 34, y: 170, w: 186, d: 118, price: p, u },
        { id: 'Z4', name: 'Studio', sub: 'Yoga, Zumba, HIIT classes', x: 236, y: 170, w: 182, d: 118, price: p, u },
      ]
  }
}

const AMEN = [
  { id: 'rec', name: 'Reception', sub: 'Check in, rent kit, pay at the desk', icon: 'i-users', x: 452, y: 22, w: 166, d: 88 },
  { id: 'chg', name: 'Changing rooms', sub: 'Lockers and hot showers, separate for men and women', icon: 'i-door', x: 452, y: 124, w: 166, d: 86 },
  { id: 'cafe', name: 'Café & lounge', sub: 'Snacks, drinks and a screen for live matches', icon: 'i-sofa', x: 452, y: 224, w: 166, d: 76 },
  { id: 'park', name: 'Parking', sub: 'Free for 40 cars and two-wheelers', icon: 'i-car', x: 22, y: 322, w: 288, d: 98 },
  { id: 'aid', name: 'First aid & water', sub: 'First-aid kit, drinking water and washrooms', icon: 'i-shield', x: 452, y: 322, w: 166, d: 98 },
]

const SPORT_ICON = { football: 'i-ball', cricket: 'i-bat', badminton: 'i-shuttle', pool: 'i-wave', gym: 'i-dumb' }

const center = (z) => [z.x + z.w / 2, z.y + z.d / 2]
const route = (z) => {
  const [cx, cy] = center(z)
  return `M${ENTRY[0]} ${ENTRY[1]} V310 H${cx} V${cy}`
}

/* ---- primitives ---- */
function Box({ x, y, w, d, h, z = 0, c = '', style }) {
  return (
    <div className={`bx ${c}`} style={{ left: x, top: y, width: w, height: d, transform: `translateZ(${z}px)`, ...style }}>
      <i className="f n" style={{ width: w, height: h }} />
      <i className="f w" style={{ width: h, height: d }} />
      <i className="f s" style={{ top: d, width: w, height: h }} />
      <i className="f e" style={{ left: w, width: h, height: d }} />
      <i className="f t" style={{ width: w, height: d, transform: `translateZ(${h}px)` }} />
    </div>
  )
}
function Tile({ x, y, w, d, z = 1, c = '', style, children, ...rest }) {
  return (
    <div className={`tl ${c}`} style={{ left: x, top: y, width: w, height: d, transform: `translateZ(${z}px)`, ...style }} {...rest}>
      {children}
    </div>
  )
}
function Room({ x, y, w, d, c = '' }) {
  const t = 4
  const h = 26
  const gap = 34
  const half = (w - gap) / 2
  return (
    <>
      <Tile x={x} y={y} w={w} d={d} c={`room ${c}`} />
      <Box x={x} y={y} w={w} d={t} h={h} c="wall" />
      <Box x={x} y={y} w={t} d={d} h={h} c="wall" />
      <Box x={x + w - t} y={y} w={t} d={d} h={h} c="wall" />
      <Box x={x} y={y + d - t} w={half} d={t} h={h * 0.45} c="wall" />
      <Box x={x + half + gap} y={y + d - t} w={half} d={t} h={h * 0.45} c="wall" />
    </>
  )
}
function Lamp({ x, y, h = 92 }) {
  return (
    <>
      <Box x={x} y={y} w={4} d={4} h={h} c="pole" />
      <Box x={x - 5} y={y - 3} w={14} d={10} h={6} z={h} c="lamp" />
    </>
  )
}

/* ---- sport furniture ---- */
function Markings({ kind }) {
  if (kind === 'football')
    return (
      <>
        <i className="mk half" />
        <i className="mk circ" />
        <i className="mk boxT" />
        <i className="mk boxB" />
      </>
    )
  if (kind === 'cricket') return <i className="mk strip" />
  if (kind === 'badminton')
    return (
      <>
        <i className="mk half" />
        <i className="mk svcT" />
        <i className="mk svcB" />
        <i className="mk mid" />
      </>
    )
  if (kind === 'pool') return <i className="mk lane" />
  return null
}

function Props({ kind, units }) {
  const out = []
  if (kind === 'football') {
    units.forEach((u) => {
      const gx = u.x + u.w / 2 - 22
      out.push(<Box key={u.id + 'g1'} x={gx} y={u.y - 6} w={44} d={6} h={16} c="goal" />)
      out.push(<Box key={u.id + 'g2'} x={gx} y={u.y + u.d} w={44} d={6} h={16} c="goal" />)
    })
    ;[[24, 24], [424, 24], [24, 292], [424, 292]].forEach(([x, y], i) => out.push(<Lamp key={'l' + i} x={x} y={y} />))
  }
  if (kind === 'cricket') {
    units.forEach((u, i) => {
      out.push(<Box key={u.id + 'n1'} x={u.x - 4} y={u.y} w={3} d={u.d} h={46} c="net" />)
      if (i === units.length - 1) out.push(<Box key={u.id + 'n2'} x={u.x + u.w + 2} y={u.y} w={3} d={u.d} h={46} c="net" />)
      out.push(<Box key={u.id + 'st'} x={u.x + u.w / 2 - 6} y={u.y + 16} w={12} d={3} h={14} c="stumps" />)
    })
    out.push(<Box key="back" x={30} y={28} w={396} d={3} h={46} c="net" />)
    ;[[24, 24], [424, 24], [24, 292], [424, 292]].forEach(([x, y], i) => out.push(<Lamp key={'l' + i} x={x} y={y} h={80} />))
  }
  if (kind === 'badminton') {
    units.forEach((u) => out.push(<Box key={u.id + 'nt'} x={u.x - 6} y={u.y + u.d / 2 - 1} w={u.w + 12} d={2} h={20} c="net" />))
  }
  if (kind === 'pool') {
    ;[0, 1, 2, 3, 4, 5].forEach((i) => out.push(<Box key={'b' + i} x={36} y={50 + i * 34} w={8} d={14} h={9} c="block" />))
    out.push(<Box key="chair" x={392} y={190} w={16} d={16} h={36} c="pole" />)
    out.push(<Box key="chairT" x={388} y={186} w={24} d={24} h={4} z={36} c="lamp" />)
  }
  if (kind === 'gym') {
    ;[0, 1, 2, 3].forEach((i) => out.push(<Box key={'tm' + i} x={50 + i * 42} y={60} w={26} d={52} h={12} c="machine" />))
    ;[0, 1, 2].forEach((i) => out.push(<Box key={'rk' + i} x={256 + i * 56} y={52} w={34} d={30} h={40} c="rack" />))
    out.push(<Box key="db" x={256} y={118} w={150} d={10} h={10} c="machine" />)
    out.push(<Box key="mir" x={238} y={286} w={178} d={3} h={34} c="mirror" />)
  }
  return out
}

function Cars() {
  return [40, 92, 144, 196, 248].map((x, i) => (
    <Box key={i} x={x} y={i % 2 ? 340 : 352} w={30} d={50} h={14} c={`car c${i % 3}`} />
  ))
}

function Furniture() {
  return (
    <>
      <Box x={480} y={52} w={90} d={18} h={16} c="desk" />
      {[0, 1, 2, 3, 4].map((i) => <Box key={'lk' + i} x={466 + i * 28} y={130} w={22} d={12} h={30} c="locker" />)}
      {[[478, 248], [530, 262], [580, 246]].map(([x, y], i) => <Box key={'tb' + i} x={x} y={y} w={22} d={22} h={12} c="desk" />)}
      <Box x={470} y={344} w={40} d={30} h={16} c="locker" />
      <Box x={560} y={360} w={30} d={30} h={22} c="desk" />
    </>
  )
}

/* ---- main component ---- */
export default function Venue3D({ biz, compact = false, onSelect, selectedId, slot: slotProp, onSlot }) {
  const kind = KIND[biz.c] || 'football'
  const units = useMemo(() => unitsFor(kind, biz), [kind, biz])
  const [slotState, setSlotState] = useState(1)
  const slot = slotProp ?? slotState
  const setSlot = (s) => (onSlot ? onSlot(s) : setSlotState(s))
  const [selLocal, setSelLocal] = useState(null)
  const sel = selectedId !== undefined ? selectedId : selLocal
  const [focus, setFocus] = useState(null) // id of zone shown in the info card
  const [hover, setHover] = useState(null)
  const [cam, setCam] = useState(prefersReducedMotion() ? ISO : { tilt: 0, spin: 0, zoom: 0.82 })
  const [anim, setAnim] = useState(true)
  const [lit, setLit] = useState(true)
  const [touched, setTouched] = useState(false)
  const [fit, setFit] = useState(1)
  const vp = useRef(null)
  const drag = useRef(null)

  const booked = (u, s = slot) => (biz.id * 7 + units.indexOf(u) * 3 + s * 5) % 4 === 0
  const all = [...units.map((u) => ({ ...u, unit: true })), ...AMEN]
  const shown = all.find((z) => z.id === (hover || focus || sel))
  const routeFor = all.find((z) => z.id === (hover || sel || focus))

  // fit plan to the box
  useEffect(() => {
    const el = vp.current
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect()
      setFit(Math.min(r.width / 740, r.height / 500))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // fly in from top-down to 3D the first time it's on screen
  useEffect(() => {
    if (prefersReducedMotion()) return
    const io = new IntersectionObserver(
      ([en]) => {
        if (!en.isIntersecting) return
        io.disconnect()
        setAnim(true)
        setTimeout(() => setCam(ISO), 120)
      },
      { threshold: 0.4 },
    )
    io.observe(vp.current)
    return () => io.disconnect()
  }, [])

  // reset the info card when the venue changes
  useEffect(() => {
    setFocus(null)
    setSelLocal(null)
  }, [biz.id])

  const moveTo = (c) => {
    setAnim(true)
    setCam((o) => ({ ...o, ...c }))
  }

  const onDown = (e) => {
    if (e.target.closest('button, .unit, .amen')) return
    drag.current = { x: e.clientX, y: e.clientY, cam }
    setAnim(false)
    setTouched(true)
    vp.current.setPointerCapture?.(e.pointerId)
  }
  const onMove = (e) => {
    const d = drag.current
    if (!d) return
    const spin = d.cam.spin + (e.clientX - d.x) * 0.35
    const tilt = e.pointerType === 'touch' ? d.cam.tilt : Math.max(0, Math.min(72, d.cam.tilt - (e.clientY - d.y) * 0.3))
    setCam({ ...d.cam, spin, tilt })
  }
  const onUp = () => {
    drag.current = null
  }
  const onKey = (e) => {
    const k = { ArrowLeft: [0, -12], ArrowRight: [0, 12], ArrowUp: [-6, 0], ArrowDown: [6, 0] }[e.key]
    if (!k) return
    e.preventDefault()
    moveTo({ tilt: Math.max(0, Math.min(72, cam.tilt + k[0])), spin: cam.spin + k[1] })
  }

  const pick = (u) => {
    setFocus(u.id)
    setTouched(true)
  }
  const choose = (u) => {
    if (booked(u)) return
    const next = sel === u.id ? null : u.id
    setSelLocal(next)
    onSelect?.(next ? u : null, SLOTS[slot])
  }

  const zoneEvents = (z) => ({
    onClick: () => (z.unit && focus === z.id ? choose(z) : pick(z)),
    onPointerEnter: (e) => e.pointerType === 'mouse' && setHover(z.id),
    onPointerLeave: () => setHover(null),
  })

  const camStyle = {
    '--tilt': cam.tilt + 'deg',
    '--spin': cam.spin + 'deg',
    transform: `translate(-50%,-50%) scale(${fit * cam.zoom}) rotateX(${cam.tilt}deg) rotateZ(${cam.spin}deg)`,
  }

  return (
    <div className={`v3${compact ? ' compact' : ''}${lit ? ' lit' : ''}`}>
      <div
        className={`v3-vp${anim ? ' anim' : ''}`}
        ref={vp}
        tabIndex={0}
        aria-label={`3D map of ${biz.n}. Use arrow keys to rotate.`}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onKeyDown={onKey}
      >
        <div className="v3-cam" style={camStyle}>
          <Box x={-14} y={-14} w={W + 28} d={H + 28} h={16} z={-16} c="slab" />
          <Tile x={0} y={0} w={W} d={H} z={0.5} c="floor" />

          {/* play area */}
          <Tile x={20} y={20} w={410} d={284} c={`play ${kind}`} />
          {units.map((u) => (
            <Tile
              key={u.id}
              x={u.x}
              y={u.y}
              w={u.w}
              d={u.d}
              z={2}
              c={`unit ${kind}${booked(u) ? ' busy' : ' free'}${sel === u.id ? ' sel' : ''}${(hover || focus) === u.id ? ' hot' : ''}`}
              {...zoneEvents({ ...u, unit: true })}
            >
              <Markings kind={kind} />
            </Tile>
          ))}
          <Props kind={kind} units={units} />
          {/* indoor venues get a hall wall, outdoor ones a low mesh fence */}
          <Box x={20} y={20} w={410} d={3} h={kind === 'football' || kind === 'cricket' ? 22 : 30} c={kind === 'football' || kind === 'cricket' ? 'net' : 'wall'} />
          <Box x={20} y={20} w={3} d={284} h={kind === 'football' || kind === 'cricket' ? 22 : 30} c={kind === 'football' || kind === 'cricket' ? 'net' : 'wall'} />

          {/* amenities */}
          {AMEN.filter((a) => a.id !== 'park').map((a) => <Room key={a.id} {...a} />)}
          <Tile x={22} y={322} w={288} d={98} c="parking" />
          <Cars />
          <Furniture />
          {AMEN.map((a) => (
            <Tile key={'h' + a.id} x={a.x} y={a.y} w={a.w} d={a.d} z={3} c={`amen${(hover || focus) === a.id ? ' hot' : ''}`} {...zoneEvents(a)} />
          ))}

          {/* entrance */}
          <Tile x={330} y={322} w={100} d={118} c="entry" />
          <Box x={330} y={426} w={6} d={10} h={40} c="gate" />
          <Box x={424} y={426} w={6} d={10} h={40} c="gate" />
          <Box x={330} y={424} w={100} d={6} h={6} z={40} c="gate lampbar" />

          {/* routes */}
          <svg className="v3-routes" width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ transform: 'translateZ(4px)' }}>
            {all.map((z) => <path key={z.id} d={route(z)} className="r" />)}
            {routeFor && <path key={'on' + routeFor.id} d={route(routeFor)} className={`r on${routeFor.id === sel ? ' sel' : ''}`} />}
          </svg>

          {/* hotspots */}
          {all.map((z) => {
            const [cx, cy] = center(z)
            const state = z.unit ? (booked(z) ? 'busy' : 'free') : 'info'
            return (
              <div key={'hs' + z.id} className={`hs ${state}${sel === z.id ? ' sel' : ''}${(hover || focus) === z.id ? ' hot' : ''}`} style={{ left: cx, top: cy }}>
                <i className="stalk" />
                <button className="bb" aria-label={z.name} {...zoneEvents(z)}>
                  <span className="ring"><Icon id={z.unit ? SPORT_ICON[kind] : z.icon} w={14} /></span>
                  <em>{z.name}</em>
                </button>
              </div>
            )
          })}
          <div className="hs entry-hs" style={{ left: ENTRY[0], top: ENTRY[1] - 6 }}>
            <i className="stalk" />
            <span className="bb"><span className="ring"><Icon id="i-pin" w={14} /></span><em>Entrance</em></span>
          </div>
        </div>

        {/* overlays */}
        <div className="v3-slots" role="group" aria-label="Time slot">
          {SLOTS.map((s, i) => (
            <button key={s} className={slot === i ? 'on' : ''} onClick={() => setSlot(i)}>{s}</button>
          ))}
        </div>
        <div className="v3-ctrl">
          <button aria-label="Rotate left" onClick={() => moveTo({ spin: cam.spin - 45 })}>⟲</button>
          <button aria-label="Rotate right" onClick={() => moveTo({ spin: cam.spin + 45 })}>⟳</button>
          <button aria-label="Zoom out" onClick={() => moveTo({ zoom: Math.max(0.6, cam.zoom - 0.15) })}>−</button>
          <button aria-label="Zoom in" onClick={() => moveTo({ zoom: Math.min(1.9, cam.zoom + 0.15) })}>+</button>
          <button className="txt" onClick={() => moveTo(cam.tilt > 10 ? TOP : ISO)}>{cam.tilt > 10 ? 'Top' : '3D'}</button>
          <button aria-label={lit ? 'Lights off' : 'Lights on'} className={lit ? 'on' : ''} onClick={() => setLit((l) => !l)}>
            <Icon id="i-light" w={15} />
          </button>
        </div>
        <div className={`v3-hint${touched ? ' gone' : ''}`}>Drag to rotate · tap a {kind === 'gym' ? 'zone' : kind === 'pool' ? 'lane' : kind === 'cricket' ? 'net' : kind === 'football' ? 'pitch' : 'court'} to check it</div>

        {shown && (
          <div className="v3-card" key={shown.id + slot}>
            <button className="x" aria-label="Close" onClick={() => { setFocus(null); setHover(null) }}>✕</button>
            <small>{shown.unit ? biz.c.replace(/s$/, '') : 'Facility'}</small>
            <b>{shown.name}</b>
            <p>{shown.sub}</p>
            {shown.unit && (
              <>
                <div className={`st ${booked(shown) ? 'busy' : 'free'}`}>
                  <i />{booked(shown) ? `Booked ${SLOTS[slot]}` : `Free ${SLOTS[slot]}`}
                  <span>{fmt(shown.price)} / {shown.u}</span>
                </div>
                <button className="go" disabled={booked(shown)} onClick={() => choose(shown)}>
                  {booked(shown) ? 'Try another slot' : sel === shown.id ? 'Selected ✓' : `Select ${shown.name}`}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="v3-legend">
        {units.map((u) => (
          <button
            key={u.id}
            className={`${booked(u) ? 'busy' : 'free'}${sel === u.id ? ' sel' : ''}`}
            onClick={() => {
              pick(u)
              choose(u)
            }}
            disabled={booked(u)}
          >
            <i />
            <span>{u.name}</span>
            <small>{booked(u) ? 'Booked' : fmt(u.price)}</small>
          </button>
        ))}
      </div>
    </div>
  )
}
