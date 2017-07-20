'use strict'

module.exports = {
  extends: 'standard',
  env: {
    mocha: true,
    node: true
  },
  rules: {
    'padded-blocks': ['error', {
      blocks: 'never',
      switches: 'never',
      classes: 'always'
    }],
    'space-before-function-paren': ['error', {
      anonymous: 'always',
      named: 'never',
      asyncArrow: 'always'
    }]
  }
}
