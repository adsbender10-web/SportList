import { useState } from 'react'
import Icon from '../components/Icon'
import { CountUp, Rv, useApp } from '../hooks.jsx'
import { SETS } from '../data'

function Chart({ data }) {
  const W = 560, H = 220, m = 30
  const mx = Math.max(...data) * 1.1
  const pts = data.map((v, i) => [m + (i * (W - m - 10)) / (data.length - 1), H - m - (v / mx) * (H - m - 14)])
  const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ')
  const last = pts[pts.length - 1]
  return (
    <svg id="chart" viewBox="0 0 560 220" style={{ width: '100%', height: 'auto' }}>
      {[0, 1, 2, 3].map((i) => {
        const y = 14 + (i * (H - m - 14)) / 3
        return (
          <g key={i}>
            <line x1={m} x2={W - 10} y1={y} y2={y} stroke="#eee" />
            <text x="0" y={y + 4} fontSize="10" fill="#999">{Math.round(mx * (1 - i / 3)).toLocaleString()}</text>
          </g>
        )
      })}
      <path d={`${line} L${last[0]} ${H - m} L${pts[0][0]} ${H - m}Z`} fill="#8e1616" opacity=".1" />
      <path d={line} fill="none" stroke="#8e1616" strokeWidth="2.5" strokeLinejoin="round" pathLength="1" className="draw" />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3.5" fill="#fff" stroke="#8e1616" strokeWidth="2" />)}
    </svg>
  )
}

const ENQUIRIES = [
  { id: 1, n: 'Rohit Sharma', i: '5-a-side · Fri 8 PM', t: '10:24 AM', replied: false },
  { id: 2, n: 'Team Booking', i: '7-a-side · Sat 6 PM', t: '9:02 AM', replied: false },
  { id: 3, n: 'College Event', i: 'Tournament · 12 Dec', t: 'Yesterday', replied: true },
]

const MENU = [
  ['o-dash', 'i-grid', 'Dashboard'],
  ['o-list', 'i-cog', 'My Listing'],
  ['o-enq', 'i-mail', 'Enquiries'],
  ['o-rev', 'i-star', 'Reviews'],
  ['o-ph', 'i-img', 'Photos'],
  ['o-sub', 'i-card', 'Subscription'],
]

const Pane = ({ id, cur, children }) => (cur === id ? <div className="dpane on">{children}</div> : null)

export default function Owner() {
  const { toast } = useApp()
  const [pane, setPane] = useState('o-dash')
  const [range, setRange] = useState('Last 30 days')
  const [enq, setEnq] = useState(ENQUIRIES)
  const [set, kpis] = SETS[range]
  const newCount = enq.filter((e) => !e.replied).length + 10 // 12 in the original design (sample)
  const go = (p) => {
    setPane(p)
    window.scrollTo({ top: 0 })
  }

  return (
    <main className="page on">
      <div className="dash">
        <aside className="side">
          <div className="who">
            <span className="av">KT</span>
            <div><b>KickOff Turf</b><span>Owner account</span></div>
          </div>
          {MENU.map(([id, ic, label]) => (
            <button key={id} className={pane === id ? 'on' : ''} onClick={() => go(id)}>
              <Icon id={ic} />{label}
              {id === 'o-enq' && <span className="ct">{newCount}</span>}
            </button>
          ))}
        </aside>
        <div className="dm">
          <Pane id="o-dash" cur={pane}>
            <h2>Dashboard</h2>
            <div className="sub">
              <span>Manage your listing, enquiries and performance.</span>
              <select className="chip" value={range} onChange={(e) => setRange(e.target.value)}>
                {Object.keys(SETS).map((k) => <option key={k}>{k}</option>)}
              </select>
            </div>
            <div className="kp">
              <Rv className="kpi"><small><Icon id="i-eye" />Profile views</small><CountUp key={range + 'a'} as="b" text={kpis[0]} /><em>↑ 24%</em></Rv>
              <Rv i={1} className="kpi"><small><Icon id="i-mail" />Enquiries</small><CountUp key={range + 'b'} as="b" text={kpis[1]} /><em>↑ 32%</em></Rv>
              <Rv i={2} className="kpi"><small><Icon id="i-phone" />Call clicks</small><CountUp key={range + 'c'} as="b" text={kpis[2]} /><em>↑ 18%</em></Rv>
              <Rv i={3} className="kpi"><small><Icon id="i-star" />Avg rating</small><b>4.8</b><em style={{ color: 'var(--muted)' }}>186 reviews</em></Rv>
            </div>
            <div className="dg">
              <Rv className="pn"><h3>Profile views</h3><Chart key={range} data={set} /></Rv>
              <Rv i={1} className="pn">
                <h3>Recent enquiries <a onClick={() => go('o-enq')}>View all</a></h3>
                <div className="enr"><span className="av">RS</span><div>Rohit Sharma<small>5-a-side · Fri 8 PM</small></div><div className="r">10:24 AM<br /><span className="dot"></span>New</div></div>
                <div className="enr"><span className="av">TB</span><div>Team Booking<small>7-a-side · Sat 6 PM</small></div><div className="r">9:02 AM</div></div>
                <div className="enr"><span className="av">CE</span><div>College Event<small>Tournament · 12 Dec</small></div><div className="r">Yesterday</div></div>
                <div className="enr"><span className="av">NG</span><div>Neha Gupta<small>Monthly coaching</small></div><div className="r">Yesterday</div></div>
              </Rv>
            </div>
            <Rv className="pn">
              <h3>Listing status</h3>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <span className="pill p-g">Approved &amp; live</span>
                <span className="pill p-o">Free plan</span>
                <span className="meta">Upgrade to Premium for featured placement.</span>
                <button className="btn btn-o btn-sm" style={{ marginLeft: 'auto' }} onClick={() => go('o-sub')}>Upgrade</button>
              </div>
            </Rv>
          </Pane>

          <Pane id="o-list" cur={pane}>
            <h2>My Listing</h2>
            <div className="sub">Edit what players see on your profile.</div>
            <div className="pn">
              <div className="two">
                <div className="fld"><label>Business name</label><input defaultValue="KickOff Turf" /></div>
                <div className="fld"><label>Phone</label><input defaultValue="+91 98765 43210" /></div>
              </div>
              <div className="fld">
                <label>Description</label>
                <textarea rows="3" defaultValue="KickOff Turf is a premium football turf in Indira Nagar, Lucknow with floodlights and modern amenities."></textarea>
              </div>
              <button className="btn btn-o btn-sm" onClick={() => toast('Listing changes saved')}>Save changes</button>
            </div>
          </Pane>

          <Pane id="o-enq" cur={pane}>
            <h2>Enquiries &amp; leads</h2>
            <div className="sub">Reply quickly — fast responders rank higher.</div>
            <div className="pn">
              <table className="tb">
                <tbody>
                  <tr><th>Name</th><th>Interest</th><th>Received</th><th>Status</th><th></th></tr>
                  {enq.map((e) => (
                    <tr key={e.id}>
                      <td>{e.n}</td>
                      <td>{e.i}</td>
                      <td>{e.t}</td>
                      <td><span className={`pill ${e.replied ? 'p-g' : 'p-o'}`}>{e.replied ? 'Replied' : 'New'}</span></td>
                      <td>
                        {!e.replied && (
                          <button
                            className="bs ok"
                            onClick={() => {
                              setEnq((l) => l.map((x) => (x.id === e.id ? { ...x, replied: true } : x)))
                              toast('Marked as replied')
                            }}
                          >
                            Mark replied
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Pane>

          <Pane id="o-rev" cur={pane}>
            <h2>Reviews</h2>
            <div className="sub">Respond publicly to build trust.</div>
            <div className="pn">
              {[['RS', 'Rohit S.', '★★★★★', 'Best turf in the city.'], ['AK', 'Aman K.', '★★★★☆', 'Parking gets crowded on weekends.']].map(([ini, n, s, t]) => (
                <div className="rev" key={n}>
                  <div className="u"><span className="av">{ini}</span><div><b>{n}</b><div className="meta o">{s}</div></div></div>
                  <p>{t}</p>
                  <button className="btn btn-l btn-sm" style={{ marginTop: 8 }} onClick={() => toast('Reply box would open')}>Reply</button>
                </div>
              ))}
            </div>
          </Pane>

          <Pane id="o-ph" cur={pane}>
            <h2>Photos</h2>
            <div className="sub">12 of 20 photos used.</div>
            <div className="pn">
              <div className="pgal">
                <div className="ph t-night"></div><div className="ph t-turf"></div><div className="ph t-turf2"></div><div className="ph t-night"></div>
              </div>
              <div className="drop" style={{ marginTop: 14 }} onClick={() => toast('Upload dialog would open')}>+ Upload photos</div>
            </div>
          </Pane>

          <Pane id="o-sub" cur={pane}>
            <h2>Subscription</h2>
            <div className="sub">Monthly or yearly. Payments are verified server-side via Razorpay.</div>
            <div className="plans">
              <div className="plan">
                <h4>Free</h4><div className="p">₹0</div>
                <ul><li>Basic listing</li><li>10 photos</li><li>Enquiry form</li></ul>
                <button className="btn btn-l" style={{ width: '100%' }} disabled>Current plan</button>
              </div>
              <div className="plan hot">
                <span className="hl">Most popular</span>
                <h4>Premium</h4><div className="p">₹799<span>/mo</span></div>
                <ul><li>Verified badge</li><li>Top of category</li><li>Lead analytics</li><li>20 photos</li></ul>
                <button className="btn btn-o" style={{ width: '100%' }} onClick={() => toast('Razorpay checkout would open')}>Upgrade</button>
              </div>
              <div className="plan">
                <h4>Featured</h4><div className="p">₹1,999<span>/mo</span></div>
                <ul><li>Homepage placement</li><li>Sponsored category</li><li>Priority support</li></ul>
                <button className="btn btn-k" style={{ width: '100%' }} onClick={() => toast('Razorpay checkout would open')}>Choose</button>
              </div>
            </div>
          </Pane>
        </div>
      </div>
    </main>
  )
}
