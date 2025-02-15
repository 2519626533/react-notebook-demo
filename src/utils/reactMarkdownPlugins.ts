import { visit } from 'unist-util-visit'

const uuidRegexp = /\{\{[a-z0-9]{6}\}\}/g

const extractText = (string: string, start: number, end: number) => {
  const startLine = string.slice(0, start).split('\n')
  const endLine = string.slice(0, end).split('\n')

  return {
    type: 'text',
    value: string.slice(start, end),
    position: {
      start: {
        line: startLine.length,
        column: startLine[startLine.length - 1].length + 1,
      },
      end: {
        line: endLine.length,
        column: endLine[endLine.length - 1].length + 1,
      },
    },
  }
}

export const uuidPlugin = () => {
  function transformer(tree: any) {
    visit(tree, 'text', (node: any, index: any, parent: any) => {
      const newNodes = []
      let lastIndex = 0
      let match = uuidRegexp.exec(node.value)

      while (match !== null) {
        const value = match[0]
        const uuid = match[0].replace('{{', '').replace('}}', '')

        if (match.index > lastIndex) {
          newNodes.push(extractText(node.value, lastIndex, match.index))
        }

        newNodes.push({
          type: 'link',
          url: `#note://${uuid}`,
          data: {
            hName: 'a',
            hProperties: {
              href: `#note://${uuid}`,
            },
          },
          children: [
            {
              type: 'text',
              value,
            },
          ],
        })

        lastIndex = match.index + value.length
        match = uuidRegexp.exec(node.value)
      }

      if (lastIndex !== node.value.length) {
        const text = extractText(node.value, lastIndex, node.value.length)
        newNodes.push(text)
      }

      if (!parent)
        return
      parent.children.splice(index, 1, ...newNodes)
    })
  }
  return transformer
}
