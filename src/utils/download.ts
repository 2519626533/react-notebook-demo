import type { Descendant } from 'slate'
import { slateToMd } from './slateToMd'

const downloadMd = (content: Descendant[]) => {
  const markdownContent = slateToMd(content)
  const blob = new Blob([markdownContent], { type: 'text/markdown' })
  const link = document.createElement('a')
  link.download = 'content.md'
  link.href = URL.createObjectURL(blob)
  link.click()
  setTimeout(() => {
    URL.revokeObjectURL(link.href)
  }, 0)
}

export {
  downloadMd,
}
