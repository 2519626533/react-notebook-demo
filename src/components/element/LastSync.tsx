import type { LastSyncProps } from '@/types/layout'
import dayjs from 'dayjs'

const LastSync: React.FC<LastSyncProps> = ({
  datetime,
  darkTheme,
  syncing,
  pendingSync,
}) => {
  const renderLastSync = () => {
    if (syncing) {
      return <i>Syncing...</i>
    }
    if (pendingSync) {
      return <i>Unsaved changes</i>
    }
    if (datetime) {
      return (
        <span>
          { dayjs(datetime).format('HH:mm on YYYY/MM/DD') }
        </span>
      )
    }
  }

  return (
    <div
      className="last-synced"
      data-theme={darkTheme ? 'dark' : 'light'}
    >
      {renderLastSync()}
    </div>
  )
}

export default LastSync
