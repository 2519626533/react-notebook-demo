import type { noteItem } from '@/types/slice'
import type { Descendant } from 'slate'

export const saveNotesLocal = (notes: noteItem[]) => localStorage.setItem('notes', JSON.stringify(notes))

export const saveScratchpadLocal = (value: Descendant[]) => localStorage.setItem('scratchpad-content', JSON.stringify(value))
