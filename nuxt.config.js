module.exports = {
  // Headers of the page
  head: {
    titleTemplate: '%s - RTLong',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport',
        content: 'width=device-width, initial-scale=1' },
      { hid: 'description',
        name: 'description',
        content: 'RTLong' },
    ],
    link: [
      { rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico' },
      { rel: 'stylesheet',
        href: 'https://opensource.keycdn.com/fontawesome/4.7.0/font-awesome.min.css',
        integrity: 'sha384-dNpIIXE8U05kAbPhy3G1cz+yZmTzA6CY8Vg/u2L9xRnHjJiAK76m2BIEaSEV+/aU',
        crossorigin: 'anonymous' },
    ]
  },

  // Customize the progress-bar color
  loading: {
    color: '#3B8070',
  },

  // Build configuration
  build: {
    // Run ESLINT on save
    extend (config, ctx) {
      if (ctx.isClient) {
        config.devtool = 'eval-source-map'
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules(!?\/buefy))/,
        })
      }
    },

    vendor: [
    ],
  },

  css: [
  ],

  plugins: [
    '~plugins/global-components',
    '~plugins/ui-framework',
  ],
}
