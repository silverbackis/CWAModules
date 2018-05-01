const { resolve, join } = require('path')
const { readdirSync } = require('fs')
const merge = require('lodash/merge')
const defaults = require('./defaults')

const libRoot = resolve(__dirname, '..')

module.exports = function (moduleOptions) {
  const options = merge({}, defaults, moduleOptions, this.options.bwstarter)
  copyCore.call(this)
  copyPlugins.call(this, options)
}

function copyCore () {
  const coreRoot = resolve(libRoot, 'core')
  for (const file of readdirSync(coreRoot)) {
    this.addTemplate({
      src: resolve(coreRoot, file),
      fileName: join('bwstarter', file)
    })
  }
}

function copyPlugins (options) {
  this.addPlugin({
    src: resolve(__dirname, 'plugin.template.js'),
    fileName: join('bwstarter', 'plugin.js'),
    options
  })

  const dir = 'plugins'
  const pluginsRoot = resolve(libRoot, dir)
  for (const file of readdirSync(pluginsRoot)) {
    let { dst } = this.addTemplate({
      src: resolve(pluginsRoot, file),
      fileName: join('bwstarter/' + dir, file)
    })
    this.options.plugins.push(resolve(this.options.buildDir, dst))
  }
}
