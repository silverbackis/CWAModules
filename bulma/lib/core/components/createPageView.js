import Page from './Page'
import baseCreatePageView from '~/.nuxt/bwstarter/components/createPageView'

export default function createPageView (depth) {
  return baseCreatePageView(Page, depth);
}
