import { createContext, useContext, useEffect, useRef } from 'react'

export const AppCtx = createContext(null)
export const useApp = () => useContext(AppCtx)

export const prefersReducedMotion = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/* One shared observer for reveal-on-scroll */
let revealIO
function getRevealIO() {
  if (!revealIO) {
    revealIO = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (!en.isIntersecting) return
          const e = en.target
          revealIO.unobserve(e)
          e.classList.add('in')
          const d = (parseFloat(e.style.transitionDelay) || 0) * 1000
          setTimeout(() => {
            e.classList.remove('rv', 'in')
            e.style.transitionDelay = ''
          }, 950 + d)
        }),
      { threshold: 0.1, rootMargin: '0px 0px -5% 0px' },
    )
  }
  return revealIO
}

/** Reveal-on-scroll wrapper. Renders <Tag className="... rv"> and fades it in when visible. */
export function Rv({ as: Tag = 'div', i = 0, className = '', children, ...rest }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    el.classList.add('rv')
    el.style.transitionDelay = (Math.min(i, 6) * 0.08).toFixed(2) + 's'
    const io = getRevealIO()
    io.observe(el)
    return () => io.unobserve(el)
  }, [i])
  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  )
}

/** Adds .in to an element once it is half visible (rating bars). */
export function useInView(threshold = 0.5) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (prefersReducedMotion()) {
      el.classList.add('in')
      return
    }
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('in')
            io.unobserve(en.target)
          }
        }),
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return ref
}

/** Number that counts up when scrolled into view. `text` like "2,400+" or "₹1.2L" (non-numeric left as-is). */
export function CountUp({ text, as: Tag = 'span', ...rest }) {
  const ref = useRef(null)
  const m = String(text).trim().match(/^(₹?)(\d[\d,]*)(?![.\d])(.*)$/)
  useEffect(() => {
    const el = ref.current
    if (!el || !m || prefersReducedMotion()) return
    const [, pre, num, suf] = m
    const to = +num.replace(/,/g, '')
    el.textContent = pre + '0' + suf
    let raf
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((en) => {
          if (!en.isIntersecting) return
          io.disconnect()
          const t0 = performance.now()
          const step = (t) => {
            const p = Math.min(1, (t - t0) / 1300)
            const e = 1 - Math.pow(1 - p, 3)
            el.textContent = pre + Math.round(to * e).toLocaleString('en-US') + suf
            if (p < 1) raf = requestAnimationFrame(step)
          }
          step(t0)
        }),
      { threshold: 0.6 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text])
  return (
    <Tag ref={ref} {...rest}>
      {text}
    </Tag>
  )
}
