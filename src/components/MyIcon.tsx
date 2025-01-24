import type { MyIcon } from '@/types/components'
import type { GetProps } from 'antd'
import activeContext from '@/context/mycontext'
import Icon from '@ant-design/icons'
import { useContext } from 'react'

type CustomIconComponentProps = GetProps<typeof Icon> & {
  active?: boolean
}

const IconSvg: MyIcon = ({ fill, text, textColor, fontSize, x = '50', y = '85' }) => {
  const active = useContext(activeContext)
  return (
    <svg width="1em" height="1em" fill="currentColor" viewBox="0 0 100 100">
      <title>Number One Icon</title>
      {/* 正方形 */}
      <rect width="100" height="100" fill={active ? 'black' : fill} rx="10" ry="10" />
      {/* 中间text */}
      <text
        x={x}
        y={y}
        fontFamily="Arial"
        fontSize={fontSize}
        fill={active ? 'white' : textColor}
        textAnchor="middle"
      >
        {text}
      </text>
    </svg>
  )
}
const AlignJustifySvg: MyIcon = ({ fill, pathColor }) => {
  const active = useContext(activeContext)
  return (
    <svg width="1em" height="1em" fill="currentColor" viewBox="0 0 100 100">
      <title>Menu Icon</title>
      {/* 正方形 */}
      <rect width="100" height="100" fill={fill} rx="10" ry="10" />
      {/* 路径 */}
      <path
        d="M144-144v-72h672v72H144Zm0-150v-72h672v72H144Zm0-150v-72h672v72H144Zm0-150v-72h672v72H144Zm0-150v-72h672v72H144Z"
        fill={active ? 'black' : pathColor}
        transform="scale(0.118) translate(-144, 900)" // 调整路径大小和位置
      />
    </svg>
  )
}

const HeadingOneSvg = (props: CustomIconComponentProps) => (
  <IconSvg fill="#ccc" text="1" textColor="white" fontSize={100} {...props}></IconSvg>
)

const HeadingTwoSvg = (props: CustomIconComponentProps) => (
  <IconSvg fill="#ccc" text="2" textColor="white" fontSize={100} {...props}></IconSvg>
)

const QuoteSvg = (props: CustomIconComponentProps) => (
  <IconSvg y={140} fill="none" text="”" textColor="#ccc" fontSize={150} {...props}></IconSvg>
)
const AlignJustify = (props: CustomIconComponentProps) => (
  <AlignJustifySvg fill="none" {...props}></AlignJustifySvg>
)

export const HeadingOneIcon = (
  props: Partial<CustomIconComponentProps>,
) => <Icon component={() => <HeadingOneSvg />}{...props} />

export const HeadingTwoIcon = (
  props: Partial<CustomIconComponentProps>,
) => <Icon component={() => <HeadingTwoSvg />} {...props} />

export const QuoteIcon = (
  props: Partial<CustomIconComponentProps>,
) => <Icon component={() => <QuoteSvg />} {...props} />

export const AlignJustifyIcon = (
  props: Partial<CustomIconComponentProps>,
) => <Icon component={() => <AlignJustify />} {...props} />
