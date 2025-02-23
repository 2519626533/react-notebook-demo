import type { EmptyEditorProps } from '@/types/components'

const EmptyEditor: React.FC<EmptyEditorProps> = ({
  darkTheme,
}) => {
  return (
    <div className="empty-editor" data-theme={darkTheme ? 'dark' : 'light'}>
      <div className="text-center">
        <p>
          <strong>Create a note</strong>
        </p>
        <p>
          <kbd>CTRL</kbd>
          +
          <kbd>ALT</kbd>
          +
          <kbd>N</kbd>
        </p>
      </div>
    </div>
  )
}

export default EmptyEditor
