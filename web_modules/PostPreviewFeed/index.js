import React, { PropTypes } from "react"

import PostPreview from "../PostPreview"

const PostPreviewFeed = ({ posts }) => {
  return (
    <div>
      {
        posts.map((post) => (
          <div>
            <PostPreview key={ post.title } { ...post } />
            <hr />
          </div>
        ))
      }
    </div>
  )
}

PostPreviewFeed.propTypes = {
  posts: PropTypes.array.isRequired,
}

export default PostPreviewFeed
