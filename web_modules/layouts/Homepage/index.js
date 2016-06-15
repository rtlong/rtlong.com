import React, { Component, PropTypes } from "react"
import enhanceCollection from "phenomic/lib/enhance-collection"

import Page from "../Page"
import PostPreviewFeed from "../../PostPreviewFeed"

const numberOfLatestPosts = 6

class Homepage extends Component {
  static contextTypes = {
    collection: PropTypes.array.isRequired,
  }

  render() {
    const latestPosts = enhanceCollection(this.context.collection, {
      filter: { layout: "Post" },
      sort: "date",
      reverse: true,
    }).slice(0, numberOfLatestPosts)

    return (
      <Page { ...this.props } header={ null }>
        <PostPreviewFeed posts={ latestPosts } />
      </Page>
    )
  }
}

export default Homepage
