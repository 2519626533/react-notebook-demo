import type { MenuItems } from '@/types/layout'
import type { MenuInfo } from 'rc-menu/es/interface'
import { DeleteOutlined, FormOutlined, PlusCircleTwoTone, ReconciliationOutlined, StarOutlined } from '@ant-design/icons'
import { Layout, Menu, Tooltip } from 'antd'
import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

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
  const [selectedKey, setSelectedKey] = useState('')
  useEffect(() => {
    setSelectedKey(window.location.pathname)
  }, [])
  // 切换路由功能
  const navigate = useNavigate()
  const onSelect = (e: MenuInfo): void => {
    const { key } = e
    setSelectedKey(key)
    navigate(key)
  }

  const [collapsed, setCollapsed] = useState(false)

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={value => setCollapsed(value)}
        className="Layout-Sider"
      >
        <div className="Layout-Sider-Header">
          <PlusCircleTwoTone style={{ fontSize: '25px' }} className="Layout-Sider-Header-Icon" label="New note" />
          <Tooltip title="New notes" placement="right">
            <span className="Layout-Sider-Header-add-note">New note</span>
          </Tooltip>

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
