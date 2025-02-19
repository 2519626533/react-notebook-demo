import type { noteItem } from '@/types/slice'

// 获取当前note
export const getActiveNote = (notes: noteItem[], activeNoteId: string) =>
  notes.find(note => note.id === activeNoteId)

// 获取scratchpad
export const getScratchpad = (notes: noteItem[]) =>
  notes.find(note => note.scratchpad)

// 获取6位的uuid
export const getShortUuid = (uuid: string) => {
  return uuid.substring(0, 6)
}

// 复制内容到粘贴板
export const copyToClipboard = (text: string) => {
  const textBlob = new Blob([text], { type: 'text/plain' })

  const clipboardItem = new ClipboardItem({
    'text/plain': textBlob,
  })

  navigator.clipboard.write([clipboardItem])
}

// 通过短uuid获取当前note
export const getActiveNotefromShortUuid = (notes: noteItem[], shortUuid: string) => {
  const uuidWithoutHash = shortUuid
    .replace('{{', '')
    .replace('}}', '')

  return notes.find(note => note.id.startsWith(uuidWithoutHash))
}
