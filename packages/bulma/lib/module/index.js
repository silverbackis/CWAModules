import { join, resolve } from 'path'
import merge from 'lodash/merge'
import rreaddir from '@cwamodules/core/lib/module/rreaddir'
import defaults from './defaults'

const libRoot = resolve(__dirname, '..')

function copyCore (options) {
  const coreRoot = resolve(libRoot, 'core')
  let files = rreaddir(coreRoot)
  for (const file of files) {
    if (file.startsWith('layouts/')) {
      this.addLayout({
        src: resolve(coreRoot, file),
        fileName: join('bwstarter/bulma', file)
      })
    } else {
      if (options.componentEnabledVoter(options, { component: file })) {
        this.addTemplate({
          src: resolve(coreRoot, file),
          fileName: join('bwstarter/bulma', file)
        })
      }
      if (file === 'error.vue' && !this.options.ErrorPage) {
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
    [ ...Array(options.pagesDepth) ].forEach((_, i) => {
      let page = {
        path: ':page' + i + '?',
        component: resolve('~/.nuxt/bwstarter/bulma/pages/_base'),
        name: 'page' + i
      }
      if (lastPage) {
        page.name = lastPage.name + '-' + page.name
        lastPage.children = [ page ]
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
  this.addPlugin({
    src: resolve(join(__dirname, '/../core/plugins/dialog', 'index.js')),
    fileName: join('bwstarter/bulma/plugins/dialog', 'index.js'),
    ssr: false,
    options
  })
}

export default async function (moduleOptions) {
  const photoswipeInstalled = await new Promise((resolve) => {
    import('photoswipe')
      .then(() => { resolve(true) })
      .catch(() => { resolve(false) })
  })
  const options = merge(
    defaults,
    moduleOptions,
    this.options.bwstarter,
    { photoswipeInstalled }
  )
  copyCore.call(this, options)
  initPages.call(this, options)
  copyPlugin.call(this, options)
}
