import Note from '@/components/container/Note'
import NoteList from '@/components/container/NoteList'

const Favorites = () => {
  return (
    <div className="favorites">
      <div className="note-list">
        <NoteList />
      </div>
      <div className="note-main">
        <Note />
      </div>
    </div>
  )
}

export default Favorites
