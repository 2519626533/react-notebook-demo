import type { Descendant } from 'slate'
import { slateToMd } from './slateToMd'

const downloadMd
  = (value: Descendant[], title: string) => {
    const markdownContent = slateToMd(value)
    const blob = new Blob([markdownContent], { type: 'text/markdown' })
    const link = document.createElement('a')
    link.download = `${title}.md`
    link.href = URL.createObjectURL(blob)
    link.click()
    setTimeout(() => {
      URL.revokeObjectURL(link.href)
    }, 0)
  }

export {
  downloadMd,
}
