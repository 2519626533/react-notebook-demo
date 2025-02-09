import Note from '@/components/container/Note'
import NoteList from '@/components/container/NoteList'
import { getNotes } from '@/store/selector'
import { useSelector } from 'react-redux'

const Notes = () => {
  const { activeNoteId } = useSelector(getNotes)
  return (
    <div className="notes">
      <div className="note-list">
        <NoteList />
      </div>
      <div className="note-main">
        {activeNoteId && <Note />}
      </div>

    </div>
  )
}

export default Notes
