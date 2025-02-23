import Note from '@/components/container/Note'
import NoteList from '@/components/container/NoteList'

const Notes = () => {
  return (
    <div className="notes">
      <div className="note-list">
        <NoteList />
      </div>
      <div className="note-main">
        <Note />
      </div>
    </div>
  )
}

export default Notes
