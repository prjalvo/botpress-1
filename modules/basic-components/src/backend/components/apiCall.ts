import * as sdk from 'botpress/sdk'
import { uniqueId } from 'lodash'
import { prettyId } from './utils'

const generateFlow = async (): Promise<any> => {
  // Return normal flow and skill flow. I need to do this. Because skills need to be created
  return {
    transitions: createTransitions(),
    flow: {
      nodes: createNodes(),
      catchAll: {
        onReceive: [],
        next: []
      }
    },
    skills: skillsFlow()
  }
}

const createNodes = () => {
  const nodes: sdk.FlowNode[] = [
    {
      id: prettyId(),
      name: 'entry',
      next: [
        {
          condition: 'true',
          node: 'call_from_previous_answer'
        }
      ],
      onEnter: [
        {
          name: 'builtin_text',
          type: sdk.NodeActionType.RenderElement,
          args: { type: 'text', text: "Ask Question - What's your favorite ice cream Flavor ?" }
        }
      ],
      onReceive: ['builtin/setVariable {"type":"temp","name":"flavor","value":"{{event.payload.text}}"}']
    },
    {
      id: '6806a1521a',
      name: 'show_output',
      next: [
        {
          condition: 'true',
          node: 'END'
        }
      ],
      onEnter: [
        {
          name: 'builtin_text',
          type: sdk.NodeActionType.RenderElement,
          args: { type: 'text', text: '{{temp.flavor}}' }
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
      skill: 'CallAPI',
      name: 'call_from_previous_anwser',
      skillData: {
        randomId: prettyId(),
        method: 'post',
        memory: 'temp',
        randomId: prettyId(),
        body: '{"value": "{{temp.flavor}}"}',
        url: 'http://localhost:8080',
        variable: 'response',
        invalidJson: false
      }
    },
    {
      skill: 'choice',
      name: 'show_output',
      skillData: {
        randomId: prettyId(),
        invalidContentId: '',
        keywords: {
          yes: ['yes', 'Yes'],
          no: ['no', 'No']
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
