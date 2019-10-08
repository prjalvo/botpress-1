import _ from 'lodash'

import { Token } from '../typings'

import { IsLatin } from './chars'

export const SPACE = '\u2581'
const CHARS_TO_MERGE: string[] = '¿÷≥≤µ˜∫√≈æ…¬˚˙©"+-_!@#$%?&*()~`/\\[]{}:;<>='.split('').map(c => `\\${c}`)
export const isWord = (str: string) => _.every(CHARS_TO_MERGE, c => !str.includes(c)) && !isSpace(str)

export const isSpace = (str: string) => _.every(str, c => c === SPACE || c === ' ')

export const makeTokens = (stringTokens: string[], text: string) => {
  return stringTokens.reduce(reduceTokens(text), [] as Token[])
}

const reduceTokens = (text: string) => (currentTokens: Token[], token: string) => {
  const trimedToken = token.replace(SPACE, '')

  const previousToken = currentTokens[currentTokens.length - 1]
  const cursor = previousToken ? previousToken.end : 0

  const cutText = text.substring(cursor).toLowerCase()
  const start = cutText.indexOf(trimedToken) + cursor
  const sanitized = text.substr(start, trimedToken.length)

  const newToken = {
    value: token,
    cannonical: sanitized,
    start,
    end: start + trimedToken.length,
    matchedEntities: []
  } as Token

  return currentTokens.concat(newToken)
}

function tokenIsAllMadeOf(tok: string, chars: string[]) {
  const tokenCharsLeft = _.without(tok.split(''), ...chars)
  return _.isEmpty(tokenCharsLeft)
}

export const mergeSpecialCharactersTokens = (tokens: Token[], specialChars: string[] = CHARS_TO_MERGE) => {
  let current: Token | undefined
  const final: Token[] = []

  for (const head of tokens) {
    if (!current) {
      current = { ...head }
      continue
    }

    const currentIsAllSpecialChars = tokenIsAllMadeOf(current!.value.replace(SPACE, ''), specialChars)

    const headHasNoSpace = !head.value.includes(SPACE)
    const headIsAllSpecialChars = tokenIsAllMadeOf(head.value, specialChars)

    const shouldMergeSpecialChars = currentIsAllSpecialChars && headIsAllSpecialChars && headHasNoSpace
    const shouldMergeLatinWords = headHasNoSpace && IsLatin(head.value) && IsLatin(current.value.replace(SPACE, ''))

    if (shouldMergeSpecialChars || shouldMergeLatinWords) {
      current.value += head.value
      current.cannonical += head.cannonical
      current.end = head.end
      current.matchedEntities = current.matchedEntities.concat(head.matchedEntities)
    } else {
      final.push(current)
      current = { ...head }
    }
  }
  return current ? [...final, current] : final
}

/**
 * Basically mimics the language server tokenizer. Use this function for testing purposes
 * @param text text you want to tokenize
 */
export function tokenizeLatinTextForTests(text: string): string[] {
  return splitSpaceToken(text.replace(/\s/g, SPACE))
}

export function splitSpaceToken(token: string): string[] {
  return token.split(new RegExp(`(${SPACE})`, 'g')).filter(_.identity)
}

/**
 * Merges consecutive tokens that all respect the provided regex
 * @param tokens list of string representing a sentence
 * @param charMatchers (string patterns) that **every** characters in a token **can** match
 * @example ['13', 'lo', '34', '56'] with a char pool of numbers ==> ['13', 'lo', '3456']
 * @example ['_', '__', '_', 'abc'] with a char pool of ['_'] ==> ['____', 'abc']
 */
export const mergeSimilarTokens = (tokens: string[], charMatchers: string[]): string[] => {
  const matcher = new RegExp(`^(${charMatchers.join('|')})+$`)
  return tokens.reduce((mergedToks: string[], nextTok: string) => {
    if (matcher.test(_.last(mergedToks)) && matcher.test(nextTok)) {
      return [...mergedToks.slice(0, mergedToks.length - 1), `${_.last(mergedToks) || ''}${nextTok}`]
    } else {
      return [...mergedToks, nextTok]
    }
  }, [])
}

export const processUtteranceTokens = (tokens: string[]): string[] => {
  return _.chain(tokens)
    .flatMap(splitSpaceToken)
    .thru(tokens => mergeSimilarTokens(tokens, [SPACE])) // merge spaces
    .thru(tokens => mergeSimilarTokens(tokens, ['[0-9]'])) // merge numerical
    .thru(tokens => mergeSimilarTokens(tokens, CHARS_TO_MERGE)) // merge special chars
    .thru(tokens => (tokens.length && tokens[0].startsWith(SPACE) ? tokens.slice(1) : tokens)) // remove 1st token if space
    .value()
}

export const restoreOriginalUtteranceCasing = (utteranceTokens: string[], utterance: string): string[] => {
  let offset = 0
  return utteranceTokens.map(t => {
    const original = isSpace(t) ? t : utterance.substr(offset, t.length)
    offset += t.length
    return original
  })
}
