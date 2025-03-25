type PrismToken = Prism.Token
type Token = {
  types: string[]
  content: string
  empty?: boolean
}

const newlineRe = /\r\n|\r|\n/

const normalizedEmptyLines = (line: Token[]): Token[] => {
  // 创建副本避免原数组污染
  const processedLine = [...line]
  // 空行处理：统一生成占位符
  if (processedLine.length === 0) {
    return [{
      types: ['plain'],
      content: '\n',
      empty: true,
    }]
  }
  // 单个空 Token 处理
  const [firstToken] = processedLine
  if (processedLine.length === 1 && firstToken?.content === '') {
    return [{
      ...firstToken,
      content: '\n',
      empty: true,
    }]
  }
  return processedLine
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
