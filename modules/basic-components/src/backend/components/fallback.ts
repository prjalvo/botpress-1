import * as sdk from 'botpress/sdk'
import { uniqueId } from 'lodash'
import { prettyId } from './utils'

const generateFlow = async (): Promise<sdk.FlowGenerationResult> => {
  return {
    transitions: createTransitions(),
    flow: {
      nodes: createNodes(),
      catchAll: {
        next: []
      }
    }
  }
}

const createNodes = () => {
  // cat main.flow.json | jq '.nodes | .[] | select(has("skill") | not)'
  const nodes: sdk.SkillFlowNode[] = [
    {
      id: prettyId(),
      name: 'yes-answer',
      next: [
        {
          condition: 'true',
          node: ''
        }
      ],
      onEnter: <any>[
        {
          contentType: 'builtin_text',
          formData: { text$en: 'Yes answer', markdown$en: true, typing$en: true }
        }
      ],
      onReceive: null,
      type: 'standard'
    },
    {
      id: prettyId(),
      name: 'no-answer',
      next: [
        {
          condition: 'true',
          node: ''
        }
      ],
      onEnter: <any>[
        {
          contentType: 'builtin_text',
          formData: { text$en: 'Yes answer', markdown$en: true, typing$en: true }
        }
      ],
      onReceive: null,
      type: 'standard'
    },
    {
      id: prettyId(),
      name: 'didnt-understand',
      next: [
        {
          condition: 'true',
          node: 'choice-fe0bb7'
        }
      ],
      onEnter: <any>[
        {
          contentType: 'builtin_single-choice',
          formData: {
            dropdownPlaceholder$en: '',
            choices$en: [
              {
                title: 'Yes',
                value: 'yes'
              },
              {
                title: 'No',
                value: 'no'
              }
            ],
            markdown$en: true,
            disableFreeText$en: true,
            typing$en: true,
            text$en: 'Yes/No Question'
          }
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

export default { generateFlow }
