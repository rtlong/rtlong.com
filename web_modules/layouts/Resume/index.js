import R from "ramda"
import React, { Component, PropTypes } from "react"
import Markdown from "react-markdown"
import invariant from "invariant"

import Page from "../Page"
import DefinitionList from "../../components/definition-list"

import css from "./index.css"

const cssClass = (className) => {
  const value = css[className]
  invariant(value, `CSS Class .${className} not defined!`)
  return value
}

const compact = R.filter(x => x)
// const pp = R.tap(x => console.log(x))

const wrapWithComponent = (componentName) => (children) => React.createElement(componentName, {}, children)

const Location = R.compose(
  wrapWithComponent("address"),
  R.join(", "),
  compact,
  R.props([ "description", "city", "region", "countryCode" ]),
  R.prop("location"),
)

Location.propTypes = {
  description: PropTypes.string,
  city: PropTypes.string,
  region: PropTypes.string,
  countryCode: PropTypes.string,
}

const ResumeSection = ({ className, title, children }) => (
  <section className={ className }>
    <h2>{ title }</h2>
    { children }
    <hr />
  </section>
)

ResumeSection.propTypes = {
  title: PropTypes.string.isRequired,
  className: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]).isRequired,
}

const ResumeCollectionSection = ({ className, title, itemElement, collection }) => (
  <ResumeSection className={ className } title={ title }>
    { collection.map((item, index) => (
      React.createElement(itemElement, { key: index, ...item })
    )) }
  </ResumeSection>
)

ResumeCollectionSection.propTypes = {
  title: PropTypes.string.isRequired,
  className: PropTypes.string.isRequired,
  itemElement: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.string,
    PropTypes.func, // FIXM: how can I better validate that it's a 'Stateless Functional Component' function?
  ]).isRequired,
  collection: PropTypes.arrayOf(PropTypes.object).isRequired,
}

const ResumeHeader = ({ name, label }) => (
  <header className={ cssClass("header") }>
    <h1>{ name }</h1>
    <h2>{ label }</h2>
  </header>
)

ResumeHeader.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
}

const ResumeContact = ({ email, phone, website, location }) => {
  let dataSet = []
  if (email) {
    dataSet.push({ term: "Email", values: [ email ] })
  }
  if (phone) {
    dataSet.push({ term: "Phone", values: [ phone ] })
  }
  if (website) {
    dataSet.push({ term: "Website", values: [
      (<a href={ website }>{ website }</a>),
    ] })
  }
  if (location) {
    dataSet.push({ term: "Location", values: [
      (<Location location={ location } />),
    ] })
  }

  return (
    <ResumeSection className={ cssClass("contact") } title={ "Contact" }>
      <DefinitionList data={ dataSet } />
    </ResumeSection>
  )
}

ResumeContact.propTypes = {
  phone: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  website: PropTypes.string.isRequired,
  location: PropTypes.object,
}

const ResumeProfiles = ({ profiles }) => {
  const dataSet = profiles.map(profile => {
    return {
      term: profile.network,
      values: [
        (<a href={ profile.url }>{ profile.url }</a>),
      ],
    }
  })

  return (
    <ResumeSection className={ cssClass("profiles") } title={ "Profiles" }>
      <DefinitionList data={ dataSet } />
    </ResumeSection>
  )
}

ResumeProfiles.propTypes = {
  profiles: PropTypes.arrayOf(PropTypes.object).isRequired,
}

const ResumeAbout = ({ summary, picture, availability }) => (
  <ResumeSection className={ cssClass("about") } title={ "About" }>
    { picture &&
    <img src={ picture } alt={ "my portrait" } /> }

    <Markdown className={ "summary" } source={ summary } />

    { availability &&
    <DefinitionList data={ [ { term: "Availability", values: [ availability ] } ] } /> }
  </ResumeSection>
)

ResumeAbout.propTypes = {
  summary: PropTypes.string.isRequired,
  picture: PropTypes.string,
  availability: PropTypes.string,
}

const ResumeWorkExperience = ({ company, startDate, endDate, location, position, summary, highlights, technologies }) => (
  <div>
    <header>
      <h4>{ company }</h4>
      <div className={ "date-location" }>
        <div className={ "date" }>{ [ startDate, endDate || "present" ].join(" – ") }</div>
        { location &&
        <div className={ "location" }>{ location }</div> }
      </div>
      { position &&
      <div className={ "position" }>{ position }</div> }
    </header>

    { summary &&
      <Markdown className={ "summary" } source={ summary } /> }

      { highlights &&
        <div className={ "highlights" }>
            <h5>{ "Highlights" }</h5>
            <Markdown source={ highlights } />
        </div> }

        { technologies &&
          <div className={ cssClass("technologies") }>
              <h5>{ "Technologies Used" }</h5>
                <ul>{ technologies.map((t, i) => (
                  <li key={ i }>{ t }</li>
                )) }</ul>
          </div> }
    <hr />
    </div>
)

ResumeWorkExperience.propTypes = {
  company: PropTypes.string.isRequired,
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string,
  location: PropTypes.string,
  position: PropTypes.string,
  summary: PropTypes.string,
  highlights: PropTypes.string,
  technologies: PropTypes.arrayOf(PropTypes.string),
}

const ResumeVolunteerExperience = ({
  organization,
  startDate,
  endDate,
  location,
  // website,
  position,
  summary,
  highlights,
}) => (
  <div>
    <header>
      <h4>{ organization }</h4>
      <div className={ "date-location" }>
        <div className={ "date" }>{ [ startDate, endDate || "present" ].join(" – ") }</div>
        { location &&
          <div className={ "location" }>{ location }</div> }
      </div>
      { position &&
        <div className={ "position" }>{ position }</div> }
    </header>

    { summary &&
      <Markdown className={ "summary" } source={ summary } /> }

    { highlights &&
      <div className={ "highlights" }>
        <h5>{ "Highlights" }</h5>
        <Markdown source={ highlights } />
      </div> }
    <hr />
  </div>
)

ResumeVolunteerExperience.propTypes = {
  organization: PropTypes.string.isRequired,
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string,
  location: PropTypes.string,
  website: PropTypes.string,
  position: PropTypes.string,
  summary: PropTypes.string,
  highlights: PropTypes.string,
}

const ResumeEducation = ({
  institution,
  studyType,
  startDate,
  location,
  endDate,
}) => (
  <div>
    <h4>{ institution }</h4>
    <div className={ "date-location" }>
      <div className={ "date" }>{ [ startDate, endDate || "present" ].join(" – ") }</div>
      { location &&
      <div className={ "location" }>{ location }</div> }
    </div>
    { studyType &&
      <div className={ "studyType" }>{ studyType }</div> }
    <hr />
  </div>
)

ResumeEducation.propTypes = {
  institution: PropTypes.string.isRequired,
  studyType: PropTypes.string.isRequired,
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string,
  location: PropTypes.string,
}

const ResumeTestimonial = ({ name, body }) => (
  <figure className={ "reference" }>
    <blockquote>
      <Markdown source={ body } />
    </blockquote>
    <figcaption><Markdown source={ name } /></figcaption>
  </figure>
)

ResumeTestimonial.propTypes = {
  body: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
}

class Resume extends Component {
  static propTypes = {
    head: PropTypes.object.isRequired,
  }

  render() {
    const { props } = this
    const { head } = props

    if (!head.title) {
      head.title = head.basics.name
    }
    if (!head.metaTitle) {
      head.metaTitle = "Resume"
    }

    const header = <ResumeHeader {...head.basics} />

    const pageDate = head.date ? new Date(head.date) : null
    const footer = (
      <footer>
        { pageDate &&
          <div className={ "date" }>
            { "Last updated: " }
            <time key={ pageDate.toISOString() }>{ pageDate.toDateString() }</time>
          </div> }
      </footer>
    )

    return (
      <Page {...props} body={ "" } header={ header } footer={ footer }>
        <ResumeContact {...head.basics} />
        <ResumeAbout {...head.basics} />
        <ResumeProfiles {...head.basics} />
        <ResumeCollectionSection
          className={ cssClass("work") }
          title={ "Work" }
          itemElement={ ResumeWorkExperience }
          collection={ head.work }
        />
        <ResumeCollectionSection
          className={ cssClass("volunteer") }
          title={ "Volunteer" }
          itemElement={ ResumeVolunteerExperience }
          collection={ head.volunteer }
        />
        <ResumeCollectionSection
          className={ cssClass("education") }
          title={ "Education" }
          itemElement={ ResumeEducation }
          collection={ head.education }
        />
        <ResumeCollectionSection
          className={ cssClass("testimonials") }
          title={ "Testimonials" }
          itemElement={ ResumeTestimonial }
          collection={ head.testimonials }
        />
      </Page>
    )
  }
}

export default Resume
