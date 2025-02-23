import Note from '@/components/container/Note'
import NoteList from '@/components/container/NoteList'

const Trash = () => {
  return (
    <div className="trash">
      <div className="note-list">
        <NoteList />
      </div>
      <div className="note-main">
        <Note />
      </div>
    </div>
  )
}

export default Trash
