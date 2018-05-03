import BWServerBase from '@bwstarter/server'
export const BWServer = new BWServerBase(process.env)
export const Utilities = BWServer.utilities
export default BWServer
