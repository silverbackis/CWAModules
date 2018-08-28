const merge = require('lodash/merge')
const defaults = require('./defaults')
const { resolve, join } = require('path')
const rreaddir = require('@bwstarter/core/lib/module/rreaddir')

const libRoot = resolve(__dirname, '..')

module.exports = function (moduleOptions) {
  const options = merge({}, defaults, moduleOptions, this.options.bwstarter)
  copyCore.call(this, options)
}

function copyCore (options) {
  const coreRoot = resolve(libRoot, 'core')
  let files = rreaddir(coreRoot)
  for (const file of files) {
    this.addTemplate({
      src: resolve(coreRoot, file),
      fileName: join('bwstarter/components', file)
    })
  }
}
