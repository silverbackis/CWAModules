const merge = require('lodash/merge');
const defaults = require('./defaults')

module.exports = function(moduleOptions) {
  const options = merge({}, defaults, moduleOptions, this.options.bwstarter)

}
