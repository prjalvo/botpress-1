import * as sdk from 'botpress/sdk'
import { uniqueId } from 'lodash'

const generateFlow = async (): Promise<sdk.FlowGenerationResult> => {
  return {
    transitions: createTransitions(),
    flow: {
      nodes: createNodes(),
      catchAll: {
        onReceive: [],
        next: []
      }
    }
  }
}

const createNodes = () => {
  const nodes: sdk.FlowNode[] = [
    {
      id: 'entry',
      name: 'entry',
      next: [
        {
          condition: 'event.state.session.greeted',
          node: 'END'
        },
        {
          condition: 'true',
          node: 'store_greeting'
        }
      ],
      onEnter: [],
      onReceive: null
    },
    {
      id: '90853b1928',
      name: 'store_greeting',
      next: [
        {
          condition: 'true',
          node: 'END'
        }
      ],
      onEnter: ['builtin/setVariable {"type":"session","name":"greeted","value":"true"}'],
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

export default { generateFlow }
