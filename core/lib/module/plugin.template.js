import BWStarter from './bw_starter'
import './middleware'

export default function (ctx, inject) {
  const options = <%= JSON.stringify(options) %>

  // Create a new Auth instance
  const $bwstarter = new BWStarter(ctx, options)

  // Inject it to nuxt context as $auth
  inject('bwstarter', $bwstarter)
  ctx.$bwstarter = $bwstarter
}
