const merge = require('lodash/merge')
const defaults = require('./defaults')
const { resolve, join } = require('path')
const rreaddir = require('@cwamodules/core/lib/module/rreaddir')

const libRoot = resolve(__dirname, '..')

module.exports = function (moduleOptions) {
  const options = merge({}, defaults, moduleOptions, this.options.bwstarter)
  copyCore.call(this, options)
  initPages.call(this, options)
  copyPlugin.call(this, options)
}

function copyCore () {
  const coreRoot = resolve(libRoot, 'core')
  let files = rreaddir(coreRoot)
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
      if (file === 'error.vue') {
        this.options.ErrorPage = join(this.options.buildDir, 'bwstarter/bulma', file)
      }
    }
  }
}

function initPages (options) {
  this.extendRoutes((routes, resolve) => {
    let loginExists = routes.some((route) => {
      return route.name === 'login'
    })
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
        path: ':page' + i + '?',
        component: resolve('~/.nuxt/bwstarter/bulma/pages/_base'),
        name: 'page' + i
      }
      if (lastPage) {
        page.name = lastPage.name + '-' + page.name
        lastPage.children = [page]
      } else {
        page.path = '/' + page.path
        pages = page
      }
      lastPage = page
    })
    pages && routes.push(pages)
  })
}

function copyPlugin (options) {
  this.addPlugin({
    src: resolve(__dirname, 'components.template.js'),
    fileName: join('bwstarter/bulma', 'components.js'),
    options
  })
}
