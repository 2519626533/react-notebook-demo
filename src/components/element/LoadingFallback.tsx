import type { CSSProperties } from 'react'
import { Spin } from 'antd'

const containerStyle: CSSProperties = {
  display: 'flex',
  flex: '1',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '60vh',
  width: '100vh',
  backgroundColor: 'transparent',
}

const contentStyle: CSSProperties = {
  padding: 50,
  background: 'rgba(0, 0, 0, 0.05)',
  borderRadius: 4,
}

const content = <div style={contentStyle} />

const LoadingFallback = () => {
  return (
    <div style={containerStyle}>
      <Spin
        size="large"
        tip="loading……"
        className="loadingfallback"
      >
        {content}
      </Spin>
    </div>
  )
}

export default LoadingFallback
