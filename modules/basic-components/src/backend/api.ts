import * as sdk from 'botpress/sdk'

export default async (bp: typeof sdk) => {
  /**
   * This is an example route to get you started.
   * Your API will be available at `http://localhost:3000/api/v1/bots/BOT_NAME/mod/orders`
   * Just replace BOT_NAME by your bot ID
   */
  const router = bp.http.createRouterForBot('components')
}
