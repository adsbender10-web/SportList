import { BlogCard } from '../components/Card'
import { Rv } from '../hooks.jsx'
import { BL } from '../data'

export default function Blog() {
  return (
    <main className="page on">
      <div className="wrap">
        <Rv className="bh">
          <h1>Sports Guides &amp; Blogs</h1>
          <p>Tips, guides and local updates to help you choose the best sports facilities in Lucknow.</p>
        </Rv>
        <Rv className="bfeat">
          <div className="ph t-night" style={{ height: 340, borderRadius: 20 }}></div>
          <div>
            <span className="pill p-o">Featured guide</span>
            <h2 style={{ fontSize: 34, margin: '12px 0' }}>How to choose the right football turf in Lucknow?</h2>
            <p style={{ color: 'var(--muted)' }}>
              Surface type, floodlights, booking flexibility and price per hour — here is exactly what to check before you book.
            </p>
            <div className="meta" style={{ margin: '12px 0' }}>Nov 12, 2026 · 6 min read</div>
            <button className="btn btn-k">Read guide</button>
          </div>
        </Rv>
        <div className="sec" style={{ paddingTop: 30 }}>
          <div className="blogs">
            {BL.map((b, i) => <BlogCard key={b.t} b={b} i={i} />)}
          </div>
        </div>
      </div>
    </main>
  )
}
