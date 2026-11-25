import { Link } from 'react-router-dom'
import { pathFor } from '../routes'

/** Real link to one of the site's pages: <A page="explore" cat="Football Turfs">…</A> */
export default function A({ page, cat, id, ...rest }) {
  return <Link to={pathFor(page, cat, id)} {...rest} />
}
