import React, { Component, PropTypes } from "react"
import { BodyContainer } from "phenomic"
import Page from "../Page"

class SimplePage extends Component {
  render() {
    const { props } = this

    return (
      <Page {...props}>
        <BodyContainer>{ props.body }</BodyContainer>
      </Page>
    )
  }
}

SimplePage.propTypes = {
  body: PropTypes.string.isRequired,
}

export default SimplePage
