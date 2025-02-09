import type { noteItem } from '@/types/slice'
import { setActiveNote, updateNote, updateNoteTitle } from '@/store/note'
import { getNotes, getSettings } from '@/store/selector'
import { EllipsisOutlined, ReconciliationOutlined, StarOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const NoteList = () => {
  const { darkTheme } = useSelector(getSettings)
  const { notes } = useSelector(getNotes)
  const dispatch = useDispatch()

  // 双击事件：editTitle
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editedTitle, setEditedTitle] = useState<string>('')

  const handleDoubleClick = (note: noteItem) => {
    setEditingId(note.id)
    setEditedTitle(note.title)
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedTitle(e.target.value)
  }

  const saveTitle = (note: noteItem) => {
    if (editedTitle.trim() && editedTitle !== note.title) {
      dispatch(updateNoteTitle({
        ...note,
        title: editedTitle,
      }))
    }
    setEditingId(null)
  }

  // 点击事件：ActiveNote
  const handleActiveNote = (id: string) => {
    dispatch(setActiveNote(id))
  }
  return (
    <div className="note-list" data-theme={darkTheme ? 'dark' : 'light'}>
      <div className="note-list-header">
        <input placeholder="Search for notes" className="note-list-search" />
      </div>
      <div className="note-list-main">
        {notes.map((note) => {
          return (
            <div
              className="note-item"
              key={note.id}
              data-note-num={notes.indexOf(note)}
              onClick={() => handleActiveNote(note.id)}
            >
              <div className="note-item-outer">
                <div className="note-title">
                  <div className="favorite-icon"><StarOutlined /></div>
                  {editingId === note.id
                    ? (
                        <input
                          className="title-edit"
                          value={editedTitle}
                          onChange={handleTitleChange}
                          onBlur={() => saveTitle(note)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter')
                              saveTitle(note)
                            if (e.key === 'Escape')
                              setEditingId(null)
                          }}
                          autoFocus
                        />
                      )
                    : (
                        <div
                          className="title-text"
                          onDoubleClick={() => handleDoubleClick(note)}
                        >
                          {note.title}
                        </div>
                      )}
                </div>
                <div className="note-option">
                  <EllipsisOutlined />
                </div>
              </div>
              <div className="note-item-category">
                <div className="category-icon">
                  <ReconciliationOutlined />
                </div>
                <div className="category-text">
                  category
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default NoteList
