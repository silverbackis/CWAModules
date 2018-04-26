const { resolve, join } = require('path');
const { readdirSync } = require('fs');

const libRoot = resolve(__dirname, '..');

module.exports = function(options) {
  copyCore.call(this)
  copyPlugins.call(this)
};

function copyCore () {
  const coreRoot = resolve(libRoot, 'core')

  for (const file of readdirSync(coreRoot)) {
    let { dst } = this.addTemplate({
      src: resolve(coreRoot, file),
      fileName: join('bwstarter', file)
    })
    file === 'middleware.js' && this.options.plugins.push(resolve(this.options.buildDir, dst))
  }
}

function copyPlugins () {
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
