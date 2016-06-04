import React, { Component, PropTypes } from "react"

import Page from "../Page"
import DefinitionList from "../../components/definition-list"

import css from "./index.css"

class Resume extends Component {
  static propTypes = {
    head: PropTypes.object.isRequired,
  }

  render() {
    const { props } = this
    const { head } = props

    const pageDate = head.date ? new Date(head.date) : null

    return (
      <Page
        {...props}

        body={ "" }

        header={
          <header>
          {
            pageDate &&
              <time key={ pageDate.toISOString() }>{ pageDate.toDateString() }</time>
          }
          </header>
        }
      >
        <div>
          <section className={ css.name }>
            <h2>{ head.basics.name }</h2>
            <h3>{ head.basics.label }</h3>
            <hr />
          </section>
          <section className={ css.contact }>
            <h2>{ "Contact" }</h2>
            <DefinitionList data={
              [
                { term: "Email", values: [ head.basics.email ] },
                { term: "Phone", values: [ head.basics.phone ] },
                {
                  term: "Website",
                  values: [
                    head.basics.website && <a href={ head.basics.website }>{ head.basics.website }</a>,
                  ],
                },
                {
                  term: "Location",
                  values: [
                    head.basics.location &&
                    <address>{ `${head.basics.location.city}, ${head.basics.location.region}, ${head.basics.location.countryCode}` }</address>,
                  ],
                },
              ]
            }
            />
            <hr />
          </section>
          {
            // <p> { "This is the resume template" } </p>
          }
          <code>{ JSON.stringify(head) }</code>
        </div>
      </Page>
    )
  }
}

export default Resume
