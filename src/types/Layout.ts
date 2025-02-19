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

export type NoteProps = {
  isScratchpad: boolean
}

export interface LastSyncProps {
  syncing: boolean
  pendingSync: boolean
  datetime: string
  darkTheme: boolean
}
