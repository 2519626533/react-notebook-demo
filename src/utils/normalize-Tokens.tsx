type PrismToken = Prism.Token
type Token = {
  types: string[]
  content: string
  empty?: boolean
}

const newlineRe = /\r\n|\r|\n/

const normalizedEmptyLines = (line: Token[]) => {
  if (line.length === 0) {
    line.push({
      types: ['plain'],
      content: '\n',
      empty: true,
    })
  } else if (line.length === 1 && line[0].content === '') {
    line[0].content = '\n'
    line[0].empty = true
  }
}

const appendTypes = (types: string[], add: string[] | string): string[] => {
  const typesSize = types.length
  if (typesSize > 0 && types[typesSize - 1] === add) {
    return types
  }
  return types.concat(add)
}

export const normalizeTokens = (
  tokens: Array<PrismToken | string>,
): Token[][] => {
  const typeArrStack: string[][] = [[]]
  const tokenArrStack = [tokens]
  const tokenArrIndexStack = [0]
  const tokenArrSizeStack = [tokens.length]

  let i = 0
  let stackIndex = 0
  let currentLine: { types: string[], content: string }[] = []

  const acc = [currentLine]

  while (stackIndex > -1) {
    while (tokenArrIndexStack[stackIndex] < tokenArrSizeStack[stackIndex]) {
      let content
      let types = typeArrStack[stackIndex]
      i = tokenArrIndexStack[stackIndex]++

      const tokenArr = tokenArrStack[stackIndex]
      const token = tokenArr[i]

      // console.log(token)

      if (typeof token === 'string') {
        types = stackIndex > 0 ? types : ['plain']
        content = token
      } else {
        types = appendTypes(types, token.type)
        if (token.alias) {
          types = appendTypes(types, token.alias)
        }

        content = token.content
      }

      if (typeof content !== 'string') {
        stackIndex++
        typeArrStack.push(types)
        tokenArrStack.push(content as (string | PrismToken)[])
        tokenArrIndexStack.push(0)
        tokenArrSizeStack.push(content.length)
        continue
      }

      const splitByNewlines = content.split(newlineRe)
      const newlineCount = splitByNewlines.length

      currentLine.push({ types, content: splitByNewlines[0] })

      for (let i = 1; i < newlineCount; i++) {
        normalizedEmptyLines(currentLine)
        acc.push((currentLine = []))
        currentLine.push({ types, content: splitByNewlines[i] })
      }
    }

    stackIndex--
    typeArrStack.pop()
    tokenArrStack.pop()
    tokenArrIndexStack.pop()
    tokenArrSizeStack.pop()
  }

  normalizedEmptyLines(currentLine)
  return acc
}
