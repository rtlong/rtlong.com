import React, { Component, PropTypes } from "react"

const definitionListItem = ({ term, values }) => {
  values = values.filter(e => !!e)

  if (values.length == 0) {
    return null
  }
  else {
    return [
      <dt>{ term }</dt>,
      ...values.map(v => (
        <dd>{ v }</dd>
      )),
    ]
  }
}

class DefinitionList extends Component {
  static propTypes = {
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
  }

  render() {
    const { props } = this
    const { data } = props

    return (
      <dl {...props}>
      {
        data.map(({ term, values }) =>
          definitionListItem({ term: term, values: values })
        )
      }
      </dl>
    )

  }
}

export default DefinitionList
