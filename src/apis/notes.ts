import type { APINoteItem } from '@/types/api'
import type { noteItem } from '@/types/slice'
import { scratchpadNote, welcomeNote } from './local'
import request from './request'

// 转换服务器端数据到前端类型
const transformNote = (serverNote: APINoteItem): noteItem => ({
  id: serverNote.id,
  title: serverNote.title,
  content: JSON.parse(serverNote.content),
  createdAt: serverNote.created_at,
  updatedAt: serverNote.updated_at,
  scratchpad: serverNote.scratchpad,
  favorite: serverNote.favorite,
  trash: serverNote.trash,
  category: serverNote.category || null,
})

// 转换前端数据到服务器端格式
const transformToAPINote = (note: noteItem): APINoteItem => ({
  id: note.id,
  title: note.title,
  content: JSON.stringify(note.content),
  created_at: new Date(note.createdAt).toISOString() || new Date().toISOString(),
  updated_at: new Date(note.updatedAt).toISOString() || new Date().toISOString(),
  scratchpad: Boolean(note.scratchpad),
  favorite: Boolean(note.favorite),
  trash: Boolean(note.trash),
  category: note.category || null,
})

export const createNoteApi = async (noteData: noteItem): Promise<noteItem> => {
  try {
    const payload = transformToAPINote(noteData)
    const response = await request.post<APINoteItem>('/notes', payload)
    return transformNote(response.data)
  } catch (error) {
    console.error('创建笔记失败:', error)
    throw new Error('Failed to create note')
  }
}

export const getAllNotesApi = async (): Promise<noteItem[]> => {
  try {
    let response = await request.get<APINoteItem[]>('/notes')
    if (!response.data[0]) {
      await createNoteApi(scratchpadNote)
      await createNoteApi(welcomeNote)

      response = await request.get<APINoteItem[]>('/notes')
    }
    return response.data.map(transformNote)
  } catch (error) {
    console.error('获取笔记列表失败:', error)
    throw new Error('Failed to fetch notes')
  }
}

export const updateNoteApi = async (id: string, updateData: noteItem): Promise<noteItem> => {
  try {
    const payload = transformToAPINote(updateData)
    const response = await request.put<APINoteItem>(`/notes/${id}`, payload)
    return transformNote(response.data)
  } catch (error) {
    console.error('更新笔记失败:', error)
    throw new Error(`Failed to update note ${id}`)
  }
}

export const deleteNoteApi = async (id: string): Promise<void> => {
  try {
    await request.delete(`/notes/${id}`)
  } catch (error) {
    console.error('删除笔记失败:', error)
    throw new Error(`Failed to delete note ${id}`)
  }
}
