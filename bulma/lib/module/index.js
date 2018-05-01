// const merge = require('lodash/merge')
// const defaults = require('./defaults')
const { resolve, join } = require('path')
const rreaddir = require('@bwstarter/components/lib/module/rreaddir')

const libRoot = resolve(__dirname, '..')

module.exports = function (moduleOptions) {
  // const options = merge({}, defaults, moduleOptions, this.options.bwstarter)
  return copyCore.call(this)
}

async function copyCore () {
  const coreRoot = resolve(libRoot, 'core')
  let files = await rreaddir(coreRoot)
  for (const file of files) {
    if (file.startsWith('layouts/')) {
      this.addLayout({
        src: resolve(coreRoot, file),
        fileName: join('bwstarter/bulma', file)
      })
    } else {
      this.addTemplate({
        src: resolve(coreRoot, file),
        fileName: join('bwstarter/bulma', file)
      })
    }
  }
}
