import { FlowGenerationResult } from 'botpress/sdk'

/**
 * Component Snippet is piece of flow you can integrate into your Flow.
 */
export default interface ComponentSnippet {
  /** An identifier for the skill. Use only a-z_- characters. */
  id: string
  /** The name that will be displayed in the toolbar for the skill */
  name: string
  /**
   * This Function will return the Component Snippet to paste in the studio
   *
   * @param skillData Provided by the skill view, those are fields edited by the user on the Flow Editor
   * @param metadata Some metadata automatically provided, like the bot id
   * @return The method should return
   */
  flowGenerator: () => Promise<FlowGenerationResult>
  skillsFlow?: () => Promise<any>
}
