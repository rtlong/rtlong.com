import R from "ramda"
import React, { Component, PropTypes } from "react"
import Markdown from "react-markdown"

import Page from "../Page"
import DefinitionList from "../../components/definition-list"

import css from "./index.css"

// function ith(obj, fn) {
//   if (!obj) {
//     return null
//   }
//   return fn.call(this, obj)
// }

const compact = R.filter(x => x)

function wrapWithComponent(componentName) {
  return (children) => React.createElement(componentName, {}, children)
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
  children: PropTypes.oneOfType([ PropTypes.array, PropTypes.object ]).isRequired,
}

const ResumeHeader = ({ name, label }) => (
  <ResumeSection className={ css.name } title={ name }>
    <h3>{ label }</h3>
  </ResumeSection>
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
      <a href={ website }>{ website }</a>,
    ] })
  }
  if (location) {
    dataSet.push({ term: "Location", values: [
      R.compose(wrapWithComponent("address"), R.join(", "), compact, R.props([ "city", "region", "countryCode" ])),
    ] })
  }

  return (
    <ResumeSection className={ css.contact } title={ "Contact" }>
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
        <a href={ profile.url }>{ profile.url }</a>,
      ],
    }
  })

  return (
    <ResumeSection className={ css.profiles } title={ "Profiles" }>
      <DefinitionList data={ dataSet } />
    </ResumeSection>
  )
}

ResumeProfiles.propTypes = {
  profiles: PropTypes.arrayOf(PropTypes.object).isRequired,
}

const ResumeAbout = ({ summary, picture, availability }) => (
  <ResumeSection className={ css.about } title={ "About" }>
    { picture &&
      <img src={ picture } alt={ "my portrait" } /> }

    <p className={ "summary" }>
      <Markdown source={ summary } />
    </p>

    { availability &&
      <DefinitionList data={ [ { term: "Availability", values: [ availability ] } ] } /> }
  </ResumeSection>
)

ResumeAbout.propTypes = {
  summary: PropTypes.string.isRequired,
  picture: PropTypes.string,
  availability: PropTypes.string,
}

const ResumeWorkExperience = ({ work }) => (
  <ResumeSection className={ css.work } title={ "Work" }>
  { work.map((workItem, i) =>
    <ResumeWorkExperienceItem key={ i } {...workItem} />
  ) }
  </ResumeSection>
)

ResumeWorkExperience.propTypes = {
  work: PropTypes.arrayOf(PropTypes.object).isRequired,
}

const ResumeWorkExperienceItem = ({ company, startDate, endDate, location, position, summary, highlights, technologies }) => (
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
      <div className={ "summary" }>
        <Markdown source={ summary } />
      </div> }

    { highlights &&
      <div className={ "highlights" }>
        <h5>{ "Highlights" }</h5>
        <Markdown source={ highlights } />
      </div> }

    { technologies &&
      <div className={ "technologies" }>
        <h5>{ "Technologies Used" }</h5>
        <ul>{ technologies.map(wrapWithComponent("li")) }</ul>
      </div> }
    <hr />
  </div>
)

ResumeWorkExperienceItem.propTypes = {
  company: PropTypes.string.isRequired,
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string,
  location: PropTypes.string,
  position: PropTypes.string,
  summary: PropTypes.string,
  highlights: PropTypes.string,
  technologies: PropTypes.arrayOf(PropTypes.string),
}

const ResumeTestimonialsSection = ({ testimonials }) => (
  <ResumeSection className={ css.testimonials } title={ "References" }>
  { testimonials.map((testimonial, i) =>
    <ResumeTestimonial key={ i } {...testimonial} />
  ) }
  </ResumeSection>
)

ResumeTestimonialsSection.propTypes = {
  testimonials: PropTypes.arrayOf(PropTypes.object).isRequired,
}

const ResumeTestimonial = ({ name, body }) => (
  <blockquote className={ "reference" }>
    <p><Markdown source={ body } /></p>
    <footer><Markdown source={ name } /></footer>
  </blockquote>
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

    const pageDate = head.date ? new Date(head.date) : null
    const header = (
      <header>
      { pageDate &&
        <time key={ pageDate.toISOString() }>{ pageDate.toDateString() }</time> }
      </header>
    )

    return (
      <Page {...props} body={ "" } header={ header }>
        <ResumeHeader {...head.basics} />
        <ResumeContact {...head.basics} />
        <ResumeAbout {...head.basics} />
        <ResumeProfiles {...head.basics} />
        <ResumeWorkExperience work={ head.work } />
        <ResumeTestimonialsSection testimonials={ head.testimonials } />
      </Page>
    )
  }
}

export default Resume
