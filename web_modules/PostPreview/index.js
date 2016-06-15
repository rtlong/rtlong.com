import React, { PropTypes } from "react"
import { Link } from "react-router"

const PostPreview = (props) => {
  const  { __url, title, body, date } = props
  const pageDate = date ? new Date(date) : null

  return (
    <div>
      <Link to={ __url }>
        <h1>{ title }</h1>
      </Link>
      {
        pageDate &&
          <time key={ pageDate.toISOString() }>
            { pageDate.toDateString() }
          </time>
      }
      {
        body &&
          <p>{ body }</p>
      }
    </div>
  )
}

PostPreview.propTypes = {
  __url: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  body: PropTypes.string,
  date: PropTypes.string,
  layout: PropTypes.string,
}

export default PostPreview
