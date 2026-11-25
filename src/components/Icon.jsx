/** 3D icon from /public/icons (Microsoft Fluent Emoji 3D, MIT). Falls back to the SVG sprite in index.html. */
const HAS_3D = new Set(
  'search pin star heart heart-on check ok dumb bat ball shuttle wave clock phone eye mail grid list img card cog users shield tag flag chart light car drop sofa door wa'.split(' '),
)

/** Set to true to use the 3D PNG icons in /public/icons instead of the SVG sprite. */
const USE_3D = false

export default function Icon({ id, w, h, style, className }) {
  const name = id.replace(/^i-/, '')
  if (USE_3D && HAS_3D.has(name)) {
    return (
      <img
        src={`/icons/${id}.png`}
        alt=""
        aria-hidden="true"
        draggable="false"
        className={`ic3d${className ? ' ' + className : ''}`}
        width={w}
        height={h ?? w}
        style={style}
      />
    )
  }
  return (
    <svg width={w} height={h ?? w} style={style} className={className} aria-hidden="true">
      <use href={`#${id}`} />
    </svg>
  )
}
