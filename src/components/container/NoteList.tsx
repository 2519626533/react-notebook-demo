import type { noteItem } from '@/types/slice'
import { setActiveNote, updateNoteTitle, updateSearchValue } from '@/store/note'
import { getNotes, getSettings } from '@/store/selector'
import { Folder } from '@/utils/enums'
import { EllipsisOutlined, ReconciliationOutlined, StarOutlined } from '@ant-design/icons'
import classnames from 'classnames'
import { debounce } from 'lodash'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import SearchBar from '../element/SearchBar'

const NoteList = () => {
  const { darkTheme } = useSelector(getSettings)
  const { notes, activeNoteId, searchValue, activeFolder } = useSelector(getNotes)
  const dispatch = useDispatch()

  // 搜索词正则表达式及匹配
  const searchReg = new RegExp(searchValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
  const titleMatch = (result: noteItem) => searchReg.test(result.title)
  // const contentMatch = (result: noteItem) => searchReg.test(result.content.toString())

  // 过滤notes
  const filter: Record<Folder, (note: noteItem) => boolean> = {
    [Folder.SCRATCHPAD]: note => !!note.scratchpad,
    [Folder.NOTES]: note => !note.scratchpad && !note.trash,
    [Folder.FAVORITES]: note => !!note.favorite && !note.trash,
    [Folder.TRASH]: note => !!note.trash,
  }

  // 渲染组件所需数据
  const filteredNotes = notes
    .filter(filter[activeFolder])
    .filter(titleMatch)

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

  // 输入事件：searchNotes
  const handleSearchNotes = debounce(
    (searchValue: string) => dispatch(updateSearchValue(searchValue)),
  )
  return (
    <div className="note-list" data-theme={darkTheme ? 'dark' : 'light'}>
      <div className="note-list-header">
        <SearchBar searchNotes={handleSearchNotes} />
      </div>
      <div className="note-list-main" data-theme={darkTheme ? 'dark' : 'light'}>
        {filteredNotes.map((note) => {
          let noteTitle: string | React.ReactElement = note.title

          if (searchValue) {
            const highlightStart = noteTitle.search(searchReg)

            if (highlightStart !== -1) {
              const highlightEnd = highlightStart + searchValue.length

              noteTitle = (
                <>
                  {noteTitle.slice(0, highlightStart)}
                  <strong className="search-value-highlight">
                    {noteTitle.slice(highlightStart, highlightEnd)}
                  </strong>
                  {noteTitle.slice(highlightEnd)}
                </>
              )
            }
          }

          return (
            <div
              className={classnames(
                'note-item',
                { selected: activeNoteId === note.id },
              )}
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
                          {noteTitle}
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
