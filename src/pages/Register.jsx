import { useState } from 'react'
import Icon from '../components/Icon'
import { Rv, useApp } from '../hooks.jsx'

const STEPS = ['Business details', 'Location & contact', 'Photos', 'Services & pricing', 'Submit']
const CATS = ['Gym', 'Cricket', 'Football turf', 'Badminton', 'Swimming', 'Personal trainer']

export default function Register() {
  const { go, toast } = useApp()
  const [st, setSt] = useState(1)
  const [done, setDone] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [cat, setCat] = useState(CATS[0])
  const [err, setErr] = useState({})
  const [terms, setTerms] = useState(false)
  const [rows, setRows] = useState([1])
  const [nextId, setNextId] = useState(2)

  const next = () => {
    if (st === 1) {
      const bad = name.trim().length < 2
      setErr({ name: bad })
      if (bad) return
    }
    if (st === 2) {
      const bad = !/^[6-9]\d{9}$/.test(phone.trim())
      setErr({ phone: bad })
      if (bad) return
    }
    if (st === 5) {
      if (!terms) return toast('Please accept the guidelines')
      return setDone(true)
    }
    setSt(st + 1)
  }

  return (
    <main className="page on">
      <div className="wrap">
        <div className="reg">
          <Rv as="aside" className="rside">
            <h2>List your business</h2>
            <p>Free forever. Goes live after a quick review by our team.</p>
            {STEPS.map((s, i) => (
              <div key={s} className={`rs${st === i + 1 ? ' on' : ''}${st > i + 1 ? ' done' : ''}`}>
                <i>{i + 1}</i>
                {s}
              </div>
            ))}
          </Rv>
          <Rv className="rmain">
            {done ? (
              <div style={{ textAlign: 'center', padding: '50px 10px' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#e5f6ec', color: 'var(--green)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
                  <Icon id="i-check" w={30} />
                </div>
                <h3 style={{ fontSize: 26 }}>Listing submitted!</h3>
                <p style={{ color: 'var(--muted)', margin: '8px 0 20px' }}>We will review it within 24 hours and email you once it is live.</p>
                <button className="btn btn-o" onClick={() => go('owner')}>Go to dashboard</button>
              </div>
            ) : (
              <>
                {st === 1 && (
                  <div className="rstep">
                    <h3>Business details</h3>
                    <div className="sub">Tell players what you offer.</div>
                    <div className={`fld${err.name ? ' err' : ''}`}>
                      <label>Business name</label>
                      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. KickOff Turf" />
                      <div className="em">Business name is required</div>
                    </div>
                    <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6 }}>Category</label>
                    <div className="ccg">
                      {CATS.map((c) => (
                        <label key={c}>
                          <input type="radio" name="rc" checked={cat === c} onChange={() => setCat(c)} />
                          {c}
                        </label>
                      ))}
                    </div>
                    <div className="fld" style={{ marginTop: 12 }}>
                      <label>Short description</label>
                      <textarea rows="3" placeholder="What makes your business special?"></textarea>
                    </div>
                  </div>
                )}
                {st === 2 && (
                  <div className="rstep">
                    <h3>Location &amp; contact</h3>
                    <div className="sub">Where can players find you?</div>
                    <div className="two">
                      <div className="fld"><label>City</label><select><option>Lucknow</option></select></div>
                      <div className="fld">
                        <label>Locality</label>
                        <select>
                          <option>Gomti Nagar</option>
                          <option>Indira Nagar</option>
                          <option>Aliganj</option>
                          <option>Hazratganj</option>
                        </select>
                      </div>
                    </div>
                    <div className="fld"><label>Full address</label><input placeholder="Street, landmark, pincode" /></div>
                    <div className="two">
                      <div className={`fld${err.phone ? ' err' : ''}`}>
                        <label>Phone</label>
                        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile" />
                        <div className="em">Enter a valid 10-digit number</div>
                      </div>
                      <div className="fld"><label>WhatsApp</label><input placeholder="Same as phone?" /></div>
                    </div>
                  </div>
                )}
                {st === 3 && (
                  <div className="rstep">
                    <h3>Photos</h3>
                    <div className="sub">Add a cover image and up to 11 gallery photos.</div>
                    <div className="drop" onClick={() => toast('File picker would open (Cloudinary upload)')}>
                      <Icon id="i-img" w={32} />
                      <div style={{ marginTop: 8, fontWeight: 700 }}>Drag photos here or click to upload</div>
                      <div style={{ fontSize: 12 }}>JPG or PNG · max 5 MB each</div>
                    </div>
                  </div>
                )}
                {st === 4 && (
                  <div className="rstep">
                    <h3>Services &amp; pricing</h3>
                    <div className="sub">List what you offer and what it costs.</div>
                    <div>
                      {rows.map((id) => (
                        <div className="sv" key={id}>
                          <input placeholder="Service" />
                          <input placeholder="Duration" />
                          <input placeholder="₹ Price" />
                          <button className="btn btn-l btn-sm" type="button" style={{ padding: 0 }} onClick={() => setRows((r) => r.filter((x) => x !== id))}>×</button>
                        </div>
                      ))}
                    </div>
                    <button
                      className="btn btn-l btn-sm"
                      type="button"
                      onClick={() => {
                        setRows((r) => [...r, nextId])
                        setNextId((n) => n + 1)
                      }}
                    >
                      <Icon id="i-plus" w={14} />Add service
                    </button>
                  </div>
                )}
                {st === 5 && (
                  <div className="rstep">
                    <h3>Ready to submit</h3>
                    <div className="sub">Our team reviews new listings within 24 hours.</div>
                    <div className="pn" style={{ background: 'var(--soft)' }}>
                      <div className="enr" style={{ border: 0 }}>
                        <span className="dot"></span>
                        <div>Status after submit<small>Pending approval</small></div>
                      </div>
                    </div>
                    <label className="ck" style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 14 }}>
                      <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} /> I agree to SportList's listing guidelines
                    </label>
                  </div>
                )}
                <div className="rrow">
                  <button className="btn btn-l" style={{ visibility: st === 1 ? 'hidden' : 'visible' }} onClick={() => setSt(st - 1)}>Back</button>
                  <button className="btn btn-o" onClick={next}>{st === 5 ? 'Submit for approval' : 'Continue'}</button>
                </div>
              </>
            )}
          </Rv>
        </div>
      </div>
    </main>
  )
}
