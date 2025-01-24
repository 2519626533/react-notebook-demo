import DefaultEditor from '@/components/DefaultEditor'
import NoteMenuBar from '@/components/NoteMenuBar'
import PreviewEditor from '@/components/PreviewEditor'
import { getSettings } from '@/store/selector'
import { useSelector } from 'react-redux'

const Scratchpad = () => {
  /*
  * Selectors
 */
  const { isPreviewMode } = useSelector(getSettings)

  /*
  * Render
  */
  const renderEditor = () => {
    if (isPreviewMode) {
      return (
        <PreviewEditor />
      )
    } else {
      return (
        <DefaultEditor />
      )
    }
  }
  return (
    <div className="Scratchpad">
      {renderEditor()}
      <NoteMenuBar isNote={false} />
    </div>
  )
}

export default Scratchpad
