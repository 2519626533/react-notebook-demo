import type { NoteMenuBarProps } from '@/types/Layout'
import { CopyOutlined, DeleteOutlined, DownloadOutlined, EyeOutlined, MoonOutlined, ReloadOutlined, SettingOutlined, StarOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'

const NoteMenuBar: React.FC<NoteMenuBarProps> = ({ isNote }) => {
  const [currentTime, setCurrentTime] = useState(dayjs())

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(dayjs())
    }, 10000)
    return () => clearInterval(timerId)
  }, [])

  const formatTime = useMemo(() => {
    return currentTime.format('HH:mm on YYYY/MM/DD')
  }, [currentTime])
  return (
    <div className="note-menu-bar">
      <nav>
        <button className="note-menu-bar-button" type="button">
          <EyeOutlined />
        </button>
        {isNote && (
          <button className="note-menu-bar-button" type="button">
            <StarOutlined />
          </button>
        )}
        {isNote && (
          <button className="note-menu-bar-button" type="button">
            <DeleteOutlined />
          </button>
        )}
        <button className="note-menu-bar-button" type="button">
          <DownloadOutlined />
        </button>
        <button className="note-menu-bar-button" type="button">
          <CopyOutlined />
        </button>
      </nav>
      <nav>
        <div className="last-synced">
          {formatTime}
        </div>
        <button className="note-menu-bar-button" type="button">
          <ReloadOutlined />
        </button>
        <button className="note-menu-bar-button" type="button">
          <MoonOutlined />
        </button>
        <button className="note-menu-bar-button" type="button">
          <SettingOutlined />
        </button>
      </nav>
    </div>
  )
}

export default NoteMenuBar
