const { resolve, join } = require('path')
const merge = require('lodash/merge')
const rreaddir = require('@cwamodules/core/lib/module/rreaddir')
const defaults = require('./defaults')

const libRoot = resolve(__dirname, '..')

module.exports = function(moduleOptions) {
  const options = merge({}, defaults, moduleOptions, this.options.bwstarter)
  copyCore.call(this, options)
}

function copyCore(options) {
  const coreRoot = resolve(libRoot, 'core')
  const files = rreaddir(coreRoot)
  for (const file of files) {
    this.addTemplate({
      src: resolve(coreRoot, file),
      fileName: join('bwstarter/components', file)
    })
  }
}
