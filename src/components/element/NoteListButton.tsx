import type { NoteListButtonProps } from '@/types/components'

const NoteListButton: React.FC<NoteListButtonProps> = ({
  label,
  disabled = false,
  handler,
  darkTheme,
}) => {
  return (
    <button
      className="list-button"
      data-theme={darkTheme ? 'dark' : 'light'}
      type="button"
      title={label}
      disabled={disabled}
      onClick={handler}
    >
      {label}
    </button>
  )
}

export default NoteListButton
