const { resolve, join } = require('path')
const merge = require('lodash/merge')
const defaults = require('./defaults')
const rreaddir = require('./rreaddir')

const libRoot = resolve(__dirname, '..')

module.exports = function (moduleOptions) {
  const options = merge({}, defaults, moduleOptions, this.options.bwstarter)
  copyPlugins.call(this, options)
  copyCore.call(this)
};

function copyCore () {
  const coreRoot = resolve(libRoot, 'core')
  for (const file of rreaddir(coreRoot)) {
    this.addTemplate({
      src: resolve(coreRoot, file),
      fileName: join('bwstarter/core', file)
    })
  }
}

function copyPlugins (options) {
  this.addPlugin({
    src: resolve(__dirname, 'plugin.template.js'),
    fileName: join('bwstarter/core', 'plugin.js'),
    options
  })

  const dir = 'plugins'
  const pluginsRoot = resolve(libRoot, dir)
  for (const file of rreaddir(pluginsRoot)) {
    let { dst } = this.addTemplate({
      src: resolve(pluginsRoot, file),
      fileName: join('bwstarter/core/' + dir, file)
    })
    this.options.plugins.push({
      src: resolve(this.options.buildDir, dst),
      ssr: file !== 'quill.js'
    })
  }
}
