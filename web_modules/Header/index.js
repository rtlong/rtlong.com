import React, { Component, PropTypes } from "react"
import { Link } from "react-router"
import FAIcon from "react-fontawesome"
// import SVGInline from 'react-svg-inline'
// import Iconic from "react-iconic"
import styles from "./index.css"

export default class Header extends Component {

  static contextTypes = {
    metadata: PropTypes.object.isRequired,
  }

  render() {
    // const {
    //   pkg,
    // } = this.context.metadata

    // const funIcons = [
    //   "bicycle",
    //   "train",
    //   "subway",
    //   "ship",
    //   "plane",
    //   "bus",
    // ]

    const navLinks = [
      {
        href: "/about",
        title: "About",
      },
      {
        href: "/resume/standard",
        title: "Resume",
      },
    ]

    const profileLinks = [
      {
        href: "posts.xml",
        title: "RSS Feed",
        icon: "feed",
      },
      {
        href: "https://twitter.com/rtlong",
        title: "Twitter",
        icon: "twitter",
      },
      {
        href: "https://github.com/rtlong",
        title: "Github",
        icon: "github",
      },
      {
        href: "https://www.instagram.com/r_t_long/",
        title: "Instagram",
        icon: "instagram",
      },
      {
        href: "mailto:ryan@rtlong.com",
        title: "Email Me",
        icon: "envelope",
      },
    ]

    return (
      <header className={ styles.header }>
        <nav>
          <div className={ styles.siteTitle }>
            <Link to={ "/" }>{ "RTLong" }</Link>
          </div>

          <div>
            { navLinks.map(({ href, title }, i) =>
              <Link key={ i } to={ href }>{ title }</Link>
            ) }
          </div>

          <div>
            { profileLinks.map(({ href, title, icon }, i) =>
              <a key={ i } href={ href } title={ title }>
                <FAIcon name={ icon } />
                <span className={ styles.label }>{ title }</span>
              </a>
            ) }
          </div>
        </nav>
      </header>
    )
  }
}
