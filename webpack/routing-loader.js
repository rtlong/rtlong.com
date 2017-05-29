export default function (source, map) {
  let config = JSON.parse(source)
  this.callback(
    null,
    'module.exports = function(Component) {' +
      `Component.options.__routingConfig = ${JSON.stringify(config)}` +
    '}',
    map)
}
