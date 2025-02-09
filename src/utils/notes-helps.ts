import type { noteItem } from '@/types/slice'

export const getActiveNote = (notes: noteItem[], activeNoteId: string) =>
  notes.find(note => note.id === activeNoteId)
