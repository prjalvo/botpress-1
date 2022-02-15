import * as sdk from 'botpress/sdk'
import { uniqueId } from 'lodash'
import { prettyId } from './utils'

const generateFlow = async (): Promise<any> => {
  return {
    transitions: createTransitions(),
    flow: {
      nodes: createNodes(),
      catchAll: {
        next: []
      }
    },
    skills: skillsFlow()
  }
}

const createNodes = () => {
  const nodes: sdk.SkillFlowNode[] = [
    {
      id: prettyId(),
      name: 'catch_from_free_text',
      next: [
        {
          condition: "event.nlu.intent.name === ''",
          node: 'END'
        },
        {
          condition: 'true',
          node: 'did_not_understand'
        }
      ],
      onEnter: [],
      onReceive: null,
      type: 'standard'
    },
    {
      id: prettyId(),
      name: 'did_not_understand',
      next: [
        {
          condition: 'true',
          node: 'choice-multi'
        }
      ],
      onEnter: [
        {
          name: 'builtin_text',
          type: sdk.NodeActionType.RenderElement,
          args: { type: 'text', text: 'I’m sorry, I didn’t get that. Please rephrase or select one of the  options' }
        }
      ],
      onReceive: null,
      type: 'standard'
    }
  ]
  return nodes
}

const createTransitions = (): sdk.NodeTransition[] => {
  const keySuffix = uniqueId()

  return [
    { caption: 'On success', condition: `temp.valid${keySuffix}`, node: '' },
    { caption: 'On failure', condition: `!temp.valid${keySuffix}`, node: '' }
  ]
}

const skillsFlow = () => {
  const flow: any[] = [
    {
      skill: 'choice',
      name: 'choice-multi',
      skillData: {
        randomId: prettyId(),
        invalidContentId: '',
        keywords: {
          option_1: ['option_1', 'Option 1'],
          option_2: ['option_2', 'Option 2'],
          option_3: ['option_3', 'Option 3']
        },
        config: {
          nbMaxRetries: 3,
          repeatChoicesOnInvalid: false,
          variableName: ''
        }
      }
    }
  ]
  return flow
}

export default { generateFlow }
