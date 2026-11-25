import Icon from './Icon'
import { Rv, useApp } from '../hooks.jsx'
import { fmt } from '../data'

export default function Card({ b, i = 0 }) {
  const { openBiz, saved, toggleSave } = useApp()
  const isSaved = saved.includes(b.id)
  return (
    <Rv
      as="article"
      i={i}
      className="card"
      tabIndex={0}
      onClick={() => openBiz(b.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && e.target === e.currentTarget) openBiz(b.id)
      }}
    >
      <div className={`ph ${b.t}`}>
        {b.v ? (
          <span className="vb">
            <Icon id="i-check" />
            Verified
          </span>
        ) : null}
        <span className="rt">
          <Icon id="i-star" />
          {b.r}
          <span style={{ color: 'var(--muted)', fontWeight: 600 }}>({b.rv})</span>
        </span>
        <button
          className={`heart${isSaved ? ' on' : ''}`}
          aria-label="Save"
          onClick={(e) => {
            e.stopPropagation()
            toggleSave(b.id)
          }}
        >
          <Icon id={isSaved ? "i-heart-on" : "i-heart"} />
        </button>
      </div>
      <div className="bd">
        <h3>{b.n}</h3>
        <div className="meta">
          <Icon id="i-pin" w={13} style={{ color: 'var(--orange)' }} />
          {b.l}, Lucknow
        </div>
        <div className="tags">
          <span className="tag">{b.io}</span>
          {b.tags.map((t) => (
            <span className="tag" key={t}>
              {t}
            </span>
          ))}
        </div>
        <div className="cf">
          <div className="price">
            <b>{fmt(b.p)}</b> <span>/ {b.u}</span>
          </div>
          <button
            className="enq"
            onClick={(e) => {
              e.stopPropagation()
              openBiz(b.id, true)
            }}
          >
            Enquire
          </button>
        </div>
      </div>
    </Rv>
  )
}

export function BlogCard({ b, i = 0 }) {
  return (
    <Rv as="article" i={i} className="blog">
      <div className={`ph ${b.k}`}></div>
      <h3>{b.t}</h3>
      <p>{b.p}</p>
      <div className="meta">
        {b.d} · {b.m} read
      </div>
    </Rv>
  )
}
