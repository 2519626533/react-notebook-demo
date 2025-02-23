import type { MenuItems } from '@/types/layout'
import type { noteItem } from '@/types/slice'
import type { MenuInfo } from 'rc-menu/es/interface'
import { addNote, loadNote, swapFolder } from '@/store/note'
import { getNotes } from '@/store/selector'
import { loadSetting } from '@/store/setting'
import { sync } from '@/store/sync'
import { useInterval } from '@/utils/editorHooks'
import { FolderToKeyMap, KeyToFolderMap } from '@/utils/enums'
import { DeleteOutlined, FormOutlined, PlusCircleTwoTone, ReconciliationOutlined, StarOutlined } from '@ant-design/icons'
import { Layout, Menu } from 'antd'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { v4 as uuid } from 'uuid'

const { Content, Sider } = Layout

const items: MenuItems[] = [{
  label: 'Scratchpad',
  key: '/scratchpad',
  icon: <FormOutlined />,
}, {
  label: 'Notes',
  key: '/',
  icon: <ReconciliationOutlined />,
}, {
  label: 'Favorites',
  key: '/favorites',
  icon: <StarOutlined />,
}, {
  label: 'Trash',
  key: '/trash',
  icon: <DeleteOutlined />,
}]

const LayoutPage = () => {
  // Redux state
  const { notes, activeFolder } = useSelector(getNotes)
  const [selectedKey, setSelectedKey] = useState(FolderToKeyMap[activeFolder])
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  // TakeNote应用初始化
  useEffect(() => {
    dispatch(loadNote())
    dispatch(loadSetting())
  }, [])

  // 定时自动sync
  useInterval(() => {
    dispatch(sync({ notes }))
  }, 30000)

  // 路由更新时同步activeFolder
  useEffect(() => {
    const path = location.pathname
    const newFolder = KeyToFolderMap[path]

    if (newFolder && newFolder !== activeFolder) {
      dispatch(swapFolder({ folder: newFolder }))
      setSelectedKey(path)
    }
  }, [location.pathname, dispatch])

  // activeFolder更新时同步路由
  useEffect(() => {
    const newPath = FolderToKeyMap[activeFolder]
    if (selectedKey !== newPath) {
      setSelectedKey(newPath)
      navigate(newPath)
    }
  }, [activeFolder, navigate, selectedKey])

  const onSelect = (e: MenuInfo): void => {
    const { key } = e
    const newFolder = KeyToFolderMap[key]

    if (newFolder) {
      dispatch(swapFolder({ folder: newFolder }))
    }
  }

  const [collapsed, setCollapsed] = useState(false)

  // 新增note功能
  const handleAddNote = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    const newNote: noteItem = {
      id: uuid(),
      title: 'Untitled',
      content: [{
        type: 'paragraph',
        children: [{
          text: '',
        }],
        lineNumber: 1,
      }],
      // favorite: false,
      // trash: false,
      createdAt: dayjs().format('YYYY-MM-DD HH-mm-ss'),
      updatedAt: dayjs().format('YYYY-MM-DD HH-mm-ss'),
    }
    dispatch(addNote(newNote))
  }

  return (
    <Layout style={{ minHeight: '100vh', overflow: 'visible' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={value => setCollapsed(value)}
        className="Layout-Sider"
      >
        <div className="Layout-Sider-Header" onClick={handleAddNote}>
          <PlusCircleTwoTone style={{ fontSize: '25px' }} className="Layout-Sider-Header-Icon" label="New note" />
          <span className="Layout-Sider-Header-add-note">New note</span>

        </div>
        <Menu
          className="Layout-Sider-Menu"
          selectedKeys={[selectedKey]}
          mode="inline"
          items={items}
          onSelect={onSelect}
        />
      </Sider>
      <Layout className="layout">
        <Content className="layout-content">
          <Outlet></Outlet>
        </Content>
      </Layout>
    </Layout>
  )
}

export default LayoutPage
