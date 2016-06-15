import React, { Component, PropTypes } from "react"
import { BodyContainer } from "phenomic"
import Page from "../Page"

class Post extends Component {
  render() {
    const { props } = this
    const { head } = props

    const pageDate = head.date ? new Date(head.date) : null

    return (
      <Page
        { ...props }
        header={
          <header>
              <h1>{ head.title }</h1>
              {
                pageDate &&
                  <time key={ pageDate.toISOString() }>
                      { pageDate.toDateString() }
                  </time>
              }
          </header>
        }
      >
        <BodyContainer>{ props.body }</BodyContainer>
      </Page>
    )
  }
}

Post.propTypes = {
  head: PropTypes.object.isRequired,
}

export default Post
