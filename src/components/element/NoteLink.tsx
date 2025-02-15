import type { NoteLinkProps } from '@/types/components'
import { getActiveNotefromShortUuid } from '@/utils/notes-helps'

const NoteLink: React.FC<NoteLinkProps> = ({ notes, uuid, handleNoteLinkClick }) => {
  const note = getActiveNotefromShortUuid(notes, uuid)
  const title = note !== undefined ? note.title : null

  if (note && title) {
    return (
      <a onClick={e => handleNoteLinkClick(e, note)}>
        {title}
      </a>
    )
  }

  return (
    <span className="error">
      {'<invalid note id provided>'}
    </span>
  )
}

export default NoteLink
