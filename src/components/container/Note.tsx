import { getNotes, getSettings } from '@/store/selector'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import DefaultEditor from '../editor/DefaultEditor'
import EmptyEditor from '../editor/EmptyEditor'
import PreviewEditor from '../editor/PreviewEditor'
import NoteMenuBar from '../toolbar/NoteMenuBar'

const Note = () => {
  /*
  * Selectors
 */
  const { activeNoteId } = useSelector(getNotes)
  const { isPreviewMode, darkTheme } = useSelector(getSettings)
  // 路由判断
  const location = useLocation()
  const isScratchpad = location.pathname.startsWith('/scratchpad')
  /*
  * Render
  */
  const renderEditor = () => {
    if (activeNoteId === '') {
      return <EmptyEditor darkTheme={darkTheme} />
    }
    if (isPreviewMode) {
      return (
        <PreviewEditor isScratchpad={isScratchpad} />
      )
    } else {
      return (
        <DefaultEditor isScratchpad={isScratchpad} />
      )
    }
  }
  return (
    <div className="note">
      {renderEditor()}
      <NoteMenuBar isScratchpad={isScratchpad} />
    </div>
  )
}

export default Note
