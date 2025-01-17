export type MenuItems = {
  label: string
  key: string
  icon: React.ReactNode
  children?: MenuItems[]
}

export type HeaderType = {
  icon: React.ReactNode
  label: string
}

export type NoteMenuBarProps = {
  isNote: boolean
}
