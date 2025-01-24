import { getNotes } from '@/store/selector'
import ReactMarkdown from 'react-markdown'
import { useSelector } from 'react-redux'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { dark, github, githubGist } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import { serialize } from 'remark-slate'

const PreviewEditor = () => {
  const { content } = useSelector(getNotes)
  /*
 * Markdown 渲染函数
 */
  const renderPreviewEditor = () => {
    const markdownContent: string = content
      .filter(value => value.children.some(child => child.text.trim() !== ''))
      .map(value => serialize(value))
      .join('\n')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#39;/g, '\'')
      .replace(/&quot;/g, '\"')
      .replace(/&amp;/g, '\&')

    return (
      <ReactMarkdown
        className="reactmarkdown"
        children={markdownContent}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code({ children, className, ...props }) {
            // const codeText = String(children).replace(/\n$/, '')
            // const { language, value } = hljs.highlightAuto(codeText)
            const match = /language-(\w+)/.exec(className || '') || 'typescript'
            return match
              ? (
                  <SyntaxHighlighter
                    {...{ props, ref: undefined }}
                    PreTag="div"
                    children={String(children).replace(/\n$/, '')}
                    language={match[1]}
                    style={github}
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
