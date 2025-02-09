import { getSettings } from '@/store/selector'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import DefaultEditor from '../editor/DefaultEditor'
import PreviewEditor from '../editor/PreviewEditor'
import NoteMenuBar from '../toolbar/NoteMenuBar'

const Note = () => {
  /*
  * Selectors
 */
  const { isPreviewMode } = useSelector(getSettings)
  // 路由判断
  const location = useLocation()
  const isScratchpad = location.pathname.startsWith('/scratchpad')
  /*
  * Render
  */
  const renderEditor = () => {
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
