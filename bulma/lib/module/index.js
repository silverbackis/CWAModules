const merge = require('lodash/merge')
const defaults = require('./defaults')
const { resolve, join } = require('path')
const rreaddir = require('@bwstarter/core/lib/module/rreaddir')

const libRoot = resolve(__dirname, '..')

module.exports = function (moduleOptions) {
  const options = merge({}, defaults, moduleOptions, this.options.bwstarter)
  copyCore.call(this, options)

  this.extendRoutes((routes, resolve) => {
    let loginExists = routes.some((route) => {
      return route.name === 'login'
    });
    if (!loginExists) {
      routes.push({
        name: 'login',
        path: '/login',
        component: resolve('~/.nuxt/bwstarter/bulma/pages/login')
      })
    }

    let pages
    let lastPage
    [...Array(options.pagesDepth)].forEach((_, i) => {
      let page = {
        path: ":page" + i + "?",
        component: resolve('~/.nuxt/bwstarter/bulma/pages/_base'),
        name: "page" + i
      };
      if (lastPage) {
        page.name = lastPage.name + '-' + page.name
        lastPage.children = [page]
      } else {
        page.path = '/' + page.path
        pages = page
      }
      lastPage = page
    });
    pages && routes.push(pages)
  })
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
      let { dst } = this.addTemplate({
        src: resolve(coreRoot, file),
        fileName: join('bwstarter/bulma', file)
      })
      if (file === 'error.vue') {
        this.options.ErrorPage = join(this.options.buildDir, 'bwstarter/bulma', file)
      }
    }
  }
}
