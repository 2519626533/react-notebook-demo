import type { CustomElement, MyNodeTypes } from '@/types/slate'
import { getNotes } from '@/store/selector'
import { BlockType, myRemarkSlateNodeTypes } from '@/types/components'
import Markdown from 'react-markdown'
import { useSelector } from 'react-redux'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { coy } from 'react-syntax-highlighter/dist/esm/styles/prism'
import rehypeRaw from 'rehype-raw'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'
import { type OptionType, serialize } from 'remark-slate'
import { Element, Node } from 'slate'

const PreviewEditor = () => {
  const { content } = useSelector(getNotes)
  /*
 * Markdown 渲染函数
 */
  const remarkSlateOpts: OptionType<MyNodeTypes> & { nodeTypes: MyNodeTypes } = {
    nodeTypes: myRemarkSlateNodeTypes,
  }

  const renderPreviewEditor = () => {
    const markdownContent: string = content
      .filter(value => value.children.some(child => child.text !== ''))
      .map((value) => {
        if (Element.isElement(value) && BlockType.includes(value.type as string)) {
          if (value.type === 'code-block') {
            const modifiedCodeBlock: CustomElement = {
              ...value,
              children: value.children.map((codeLine) => {
                const modifiedCodeLine = {
                  ...codeLine,
                  children: codeLine.children.map((textNode) => {
                    if ('text' in textNode) {
                      const text = textNode.text.endsWith('\n')
                        ? textNode.text
                        : `${textNode.text}\n`
                      return { ...textNode, text }
                    }
                    return textNode
                  }),
                }
                return modifiedCodeLine
              }),
            }
            return serialize(modifiedCodeBlock, remarkSlateOpts)
          } else {
            return serialize(value, remarkSlateOpts)
          }
        } else {
          return Node.string(value)
        }
      })
      .join('\n')
      .replace(/&amp;lt;/g, '<')
      .replace(/&amp;gt;/g, '>')
      .replace(/&amp;#39;/g, '\'')
      .replace(/&amp;quot;/g, '\"')
      .replace(/&amp;amp;/g, '\&')

    return (
      <Markdown
        className="react-markdown"
        children={markdownContent}
        remarkPlugins={[[remarkGfm], [remarkBreaks]]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code({ children, className, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            return match
              ? (
                  <SyntaxHighlighter
                    {...{ props, ref: undefined }}
                    PreTag="div"
                    children={String(children).replace(/\n$/, '')}
                    language={match ? match[1] : 'typescript'}
                    style={coy}
                  />
                )
              : (
                  <code {...props} className={className}>
                    {children}
                  </code>
                )
          },
        }}
      />
    )
  }
  return (
    <div className="preview-editor">
      {renderPreviewEditor()}
    </div>
  )
}

export default PreviewEditor
