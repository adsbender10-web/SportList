import { useState } from 'react'
import Icon from '../components/Icon'
import { useApp } from '../hooks.jsx'
import { INITIAL_APPROVALS } from '../data'

const MENU = [
  ['a-dash', 'i-grid', 'Dashboard'],
  ['a-appr', 'i-shield', 'Business Approvals'],
  ['a-biz', 'i-list', 'All Businesses'],
  ['a-rev', 'i-star', 'Reviews'],
  ['a-usr', 'i-users', 'Users'],
  ['a-cat', 'i-tag', 'Categories'],
  ['a-city', 'i-pin', 'Cities & Localities'],
  ['a-pay', 'i-card', 'Payments'],
]

const Pane = ({ id, cur, children }) => (cur === id ? <div className="dpane on">{children}</div> : null)

export default function Admin() {
  const { toast } = useApp()
  const [pane, setPane] = useState('a-dash')
  const [list, setList] = useState(INITIAL_APPROVALS.map((x) => ({ ...x, s: undefined })))
  const [tab, setTab] = useState('pending')
  const [q, setQ] = useState('')
  const [cntA, setCntA] = useState(428)
  const [cntR, setCntR] = useState(16)
  const [flagged, setFlagged] = useState(true)

  const pending = list.filter((x) => x.s === undefined).length
  const rows = list
    .filter((x) => (x.s === undefined ? tab === 'pending' : x.s === tab))
    .filter((x) => x.n.toLowerCase().includes(q.toLowerCase()))

  const decide = (name, s) => {
    setList((l) => l.map((x) => (x.n === name ? { ...x, s } : x)))
    if (s === 'approved') setCntA((n) => n + 1)
    else setCntR((n) => n + 1)
    toast(name + ' ' + s)
  }

  return (
    <main className="page on">
      <div className="dash">
        <aside className="side">
          <div className="who">
            <span className="av"><Icon id="i-flag" w={18} /></span>
            <div><b>SportList</b><span>Admin panel</span></div>
          </div>
          {MENU.map(([id, ic, label]) => (
            <button key={id} className={pane === id ? 'on' : ''} onClick={() => { setPane(id); window.scrollTo({ top: 0 }) }}>
              <Icon id={ic} />{label}
              {id === 'a-appr' && pending > 0 && <span className="ct">{pending}</span>}
            </button>
          ))}
        </aside>
        <div className="dm">
          <Pane id="a-dash" cur={pane}>
            <h2>Platform overview</h2>
            <div className="sub">Everything happening across SportList.</div>
            <div className="kp">
              <div className="kpi"><small>Total businesses</small><b>721</b><em>↑ 38 this month</em></div>
              <div className="kpi"><small>Pending approvals</small><b>{pending}</b><em style={{ color: 'var(--orange)' }}>Needs review</em></div>
              <div className="kpi"><small>Verified listings</small><b>428</b><em>59%</em></div>
              <div className="kpi"><small>MRR</small><b>₹1.2L</b><em>↑ 14%</em></div>
            </div>
            <div className="pn">
              <h3>Recent activity</h3>
              <div className="enr"><span className="dot"></span>CityFit Gym submitted for approval<div className="r">2 min ago</div></div>
              <div className="enr"><span className="dot"></span>Review flagged on Green Valley Turf<div className="r">1 h ago</div></div>
              <div className="enr"><span className="dot"></span>Premium upgrade · Elite Football Turf<div className="r">3 h ago</div></div>
            </div>
          </Pane>

          <Pane id="a-appr" cur={pane}>
            <h2>Business approvals</h2>
            <div className="sub">
              <span>Review and approve new business listings.</span>
              <input className="chip" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by business name…" style={{ outline: 0, minWidth: 220 }} />
            </div>
            <div className="seg" style={{ display: 'inline-flex', marginBottom: 14 }}>
              <button className={tab === 'pending' ? 'on' : ''} onClick={() => setTab('pending')}>Pending ({pending})</button>
              <button className={tab === 'approved' ? 'on' : ''} onClick={() => setTab('approved')}>Approved ({cntA})</button>
              <button className={tab === 'rejected' ? 'on' : ''} onClick={() => setTab('rejected')}>Rejected ({cntR})</button>
            </div>
            <div className="pn">
              <table className="tb">
                <thead><tr><th>Business</th><th>Category</th><th>Location</th><th>Submitted</th><th>Actions</th></tr></thead>
                <tbody>
                  {rows.map((x) => (
                    <tr key={x.n}>
                      <td><div className="bn"><div className={`ph ${x.t}`}></div><b>{x.n}</b></div></td>
                      <td>{x.c}</td>
                      <td>{x.l}</td>
                      <td>{x.d}</td>
                      <td>
                        {x.s === undefined ? (
                          <>
                            <button className="bs ok" onClick={() => decide(x.n, 'approved')}>Approve</button>{' '}
                            <button className="bs no" onClick={() => decide(x.n, 'rejected')}>Reject</button>
                          </>
                        ) : (
                          <span className={`pill ${x.s === 'approved' ? 'p-g' : 'p-r'}`}>{x.s}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!rows.length && <div className="empty" style={{ border: 0 }}>Nothing to review here 🎉</div>}
            </div>
          </Pane>

          <Pane id="a-biz" cur={pane}>
            <h2>All businesses</h2>
            <div className="sub">Manage every listing on the platform.</div>
            <div className="pn">
              <table className="tb">
                <tbody>
                  <tr><th>Business</th><th>Category</th><th>Plan</th><th>Status</th></tr>
                  <tr><td>KickOff Turf</td><td>Football Turfs</td><td><span className="pill p-o">Premium</span></td><td><span className="pill p-g">Verified</span></td></tr>
                  <tr><td>The Turf Arena</td><td>Football Turfs</td><td><span className="pill p-o">Featured</span></td><td><span className="pill p-g">Verified</span></td></tr>
                  <tr><td>Iron Temple Gym</td><td>Gyms &amp; Fitness</td><td><span className="pill p-k">Free</span></td><td><span className="pill p-g">Verified</span></td></tr>
                </tbody>
              </table>
            </div>
          </Pane>

          <Pane id="a-rev" cur={pane}>
            <h2>Review moderation</h2>
            <div className="sub">Flagged reviews waiting for a decision.</div>
            <div className="pn">
              {flagged ? (
                <div className="rev">
                  <div className="u">
                    <span className="av">??</span>
                    <div><b>Anonymous</b><div className="meta">on Green Valley Turf · <span className="pill p-r">Flagged</span></div></div>
                  </div>
                  <p>"Spam link removed — check my site for cheaper turfs!"</p>
                  <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                    <button className="bs no" onClick={() => { setFlagged(false); toast('Review removed') }}>Remove</button>
                    <button className="bs ok" onClick={() => { setFlagged(false); toast('Review kept') }}>Keep</button>
                  </div>
                </div>
              ) : (
                <div className="meta">No flagged reviews 🎉</div>
              )}
            </div>
          </Pane>

          <Pane id="a-usr" cur={pane}>
            <h2>Users</h2>
            <div className="sub">Visitors, business owners and admins.</div>
            <div className="pn">
              <table className="tb">
                <tbody>
                  <tr><th>Name</th><th>Role</th><th>Joined</th></tr>
                  <tr><td>Ekansh S.</td><td><span className="pill p-k">Admin</span></td><td>Nov 2026</td></tr>
                  <tr><td>Rahul Verma</td><td><span className="pill p-o">Owner</span></td><td>Nov 2026</td></tr>
                  <tr><td>Sana Khan</td><td><span className="pill p-g">Visitor</span></td><td>Oct 2026</td></tr>
                </tbody>
              </table>
            </div>
          </Pane>

          <Pane id="a-cat" cur={pane}>
            <h2>Categories</h2>
            <div className="sub">Add or retire categories.</div>
            <div className="pn">
              {[['Gyms & Fitness', 312], ['Cricket Academies', 86], ['Football Turfs', 128], ['Badminton Courts', 94], ['Swimming Pools', 41]].map(([n, c]) => (
                <div className="enr" key={n}><b>{n}</b><span className="r">{c}</span></div>
              ))}
              <button className="btn btn-o btn-sm" style={{ marginTop: 12 }} onClick={() => toast('Add-category form would open')}>+ Add category</button>
            </div>
          </Pane>

          <Pane id="a-city" cur={pane}>
            <h2>Cities &amp; localities</h2>
            <div className="sub">Expand beyond Lucknow in one click.</div>
            <div className="pn">
              <div className="enr"><b>Lucknow</b><span className="pill p-g r">Live · 5 localities</span></div>
              <div className="enr"><b>Kanpur</b><span className="pill p-k r">Coming soon</span></div>
              <div className="enr"><b>Delhi NCR</b><span className="pill p-k r">Coming soon</span></div>
            </div>
          </Pane>

          <Pane id="a-pay" cur={pane}>
            <h2>Subscriptions &amp; payments</h2>
            <div className="sub">Verified server-side from Razorpay webhooks.</div>
            <div className="pn">
              <table className="tb">
                <tbody>
                  <tr><th>Business</th><th>Plan</th><th>Amount</th><th>Status</th></tr>
                  <tr><td>Elite Football Turf</td><td>Premium · Monthly</td><td>₹799</td><td><span className="pill p-g">Paid</span></td></tr>
                  <tr><td>The Turf Arena</td><td>Featured · Yearly</td><td>₹19,990</td><td><span className="pill p-g">Paid</span></td></tr>
                  <tr><td>CityFit Gym</td><td>Premium · Monthly</td><td>₹799</td><td><span className="pill p-o">Pending</span></td></tr>
                </tbody>
              </table>
            </div>
          </Pane>
        </div>
      </div>
    </main>
  )
}
