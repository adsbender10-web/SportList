import { useState } from 'react'
import A from '../components/A'
import Icon from '../components/Icon'
import Card, { BlogCard } from '../components/Card'
import { Rv, CountUp, useApp } from '../hooks.jsx'
import { D, BL, CATEGORIES } from '../data'

export default function Home() {
  const { go } = useApp()
  const [hCat, setHCat] = useState('all')
  const featured = D.filter((b) => b.v).slice(0, 3)
  const top = [...D].sort((a, b) => b.r - a.r).slice(0, 3)

  return (
    <main className="page on">
      <section className="hero">
        <div className="wrap">
          <div>
            <Rv as="h1" i={0}>
              Find Sports Businesses <span className="o">Near You.</span>
            </Rv>
            <Rv as="p" i={1} className="lead">
              Discover, compare and contact the best gyms, cricket academies, football turfs and more — all verified, all in Lucknow.
            </Rv>
            <Rv
              as="form"
              i={2}
              className="sbar"
              onSubmit={(e) => {
                e.preventDefault()
                go('explore', hCat)
              }}
            >
              <label className="f">
                <Icon id="i-search" />
                <div style={{ flex: 1 }}>
                  <small>What</small>
                  <select value={hCat} onChange={(e) => setHCat(e.target.value)}>
                    <option value="all">All categories</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </label>
              <span className="sep"></span>
              <label className="f">
                <Icon id="i-pin" />
                <div style={{ flex: 1 }}>
                  <small>City</small>
                  <select defaultValue="Lucknow">
                    <option>Lucknow</option>
                    <option disabled>Kanpur (soon)</option>
                    <option disabled>Delhi NCR (soon)</option>
                  </select>
                </div>
              </label>
              <button className="btn btn-o" type="submit" style={{ height: 50, borderRadius: 14 }}>Search</button>
            </Rv>
            <Rv i={3} className="pop">
              Popular:
              <button className="chip" onClick={() => go('explore', 'Football Turfs')}>5-a-side turf</button>
              <button className="chip" onClick={() => go('explore', 'Gyms & Fitness')}>Gym near Gomti Nagar</button>
              <button className="chip" onClick={() => go('explore', 'Cricket Academies')}>Cricket coaching</button>
              <button className="chip" onClick={() => go('explore', 'Swimming Pools')}>Swimming classes</button>
            </Rv>
          </div>
          <Rv className="heroimg ph t-night">
            <div className="badge">
              <CountUp as="b" text="2,400+" />
              verified venues in India
            </div>
          </Rv>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 24 }}>
        <div className="wrap">
          <Rv className="sh">
            <div>
              <h2>Explore by category</h2>
              <p>Ten kinds of sports businesses, one place.</p>
            </div>
          </Rv>
          <div className="catgrid">
            {CATEGORIES.map((c, i) => (
              <Rv key={c.name} i={i} className="catc" onClick={() => go('explore', c.name)}>
                <div className="ic"><Icon id={c.icon} /></div>
                <b>{c.name}</b>
                <CountUp text={c.count + ' listings'} />
              </Rv>
            ))}
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 8 }}>
        <div className="wrap">
          <Rv className="sh">
            <div>
              <h2>Featured &amp; verified</h2>
              <p>Hand-checked by the SportList team.</p>
            </div>
            <A page="explore">View all →</A>
          </Rv>
          <div className="grid3">
            {featured.map((b, i) => <Card key={b.id} b={b} i={i} />)}
          </div>
        </div>
      </section>

      <section className="sec dark">
        <div className="wrap">
          <Rv className="sh">
            <div>
              <h2>How SportList works</h2>
              <p>From search to the pitch in four steps.</p>
            </div>
          </Rv>
          <div className="steps">
            {[
              ['01', 'Search', 'Pick a category and locality. Filter by price, rating and availability.'],
              ['02', 'Compare', 'Photos, price lists, facilities and real reviews side by side.'],
              ['03', 'Enquire', 'Send an enquiry or WhatsApp the owner directly. No middleman.'],
              ['04', 'Play', 'Show up, play, then leave a review to help the next person.'],
            ].map(([n, h, p], i) => (
              <Rv key={n} i={i} className="step">
                <div className="n">{n}</div>
                <h3>{h}</h3>
                <p>{p}</p>
              </Rv>
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <Rv className="sh">
            <div>
              <h2>Top rated in Lucknow</h2>
              <p>Highest rated by players this month.</p>
            </div>
            <A page="explore">See rankings →</A>
          </Rv>
          <div className="grid3">
            {top.map((b, i) => <Card key={b.id} b={b} i={i} />)}
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <Rv className="cta">
            <div>
              <h2>Own a sports business? Get found by players.</h2>
              <p>List for free in five minutes. Upgrade to Premium for featured placement and lead analytics.</p>
              <A page="register" className="btn">List your business →</A>
            </div>
            <ul>
              <li>Free listing, always</li>
              <li>Enquiries straight to WhatsApp</li>
              <li>Verified badge builds trust</li>
              <li>Profile views &amp; lead analytics</li>
            </ul>
          </Rv>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
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
        </div>
      </section>
    </main>
  )
}
