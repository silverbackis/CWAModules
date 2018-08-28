import BWStarter from './bw_starter'
import './middleware'

export const options = <%= JSON.stringify(options) %>

export default function (ctx, inject) {
  // Create a new instance
  const $bwstarter = new BWStarter(ctx, options)

  // Inject it to nuxt context as $bwstarter and into context
  inject('bwstarter', $bwstarter)
  ctx.$bwstarter = $bwstarter
}
