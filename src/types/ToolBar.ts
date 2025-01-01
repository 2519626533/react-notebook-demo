import type { CustomFormat } from './slate'

export type ButtonType = (props: {
  format: CustomFormat
  icon: React.ReactElement
}) => JSX.Element

export type MyIconProps = {
  fill: string
  active?: boolean
  text?: string
  textColor?: string
  fontSize?: number
  x?: number
  y?: number
  pathColor?: string
}

export type MyIcon = (props: MyIconProps) => JSX.Element
