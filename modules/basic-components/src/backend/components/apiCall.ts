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
      onEnter: <any>[
        {
          contentType: 'builtin_text',
          FormData: {
            text$en: "Ask Question - What's your favorite ice cream Flavor ?",
            markdown$en: true,
            typing$en: true
          }
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
      onEnter: <any>[
        {
          contentType: 'builtin_text',
          formData: { text$en: 'Hello hello', markdown$en: true, typing$en: true }
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
      startNode: 'call_from_previous_anwser',
      skillData: {
        randomId: prettyId(),
        method: 'post',
        memory: 'temp',
        // @ts-ignore
        body: '{"value": "{{temp.flavor}}"}',
        url: 'http://localhost:8080',
        variable: 'response',
        invalidJson: false
      }
    },
    {
      skill: 'choice',
      name: 'show_output',
      startNode: 'show_output',
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
