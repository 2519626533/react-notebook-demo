export enum Folder {
  NOTES = 'NOTES',
  SCRATCHPAD = 'SCRATCHPAD',
  FAVORITES = 'FAVORITES',
  TRASH = 'TRASH',
}

// mapper
export const KeyToFolderMap: Record<string, Folder> = {
  '/': Folder.NOTES,
  '/scratchpad': Folder.SCRATCHPAD,
  '/favorites': Folder.FAVORITES,
  '/trash': Folder.TRASH,
}

export const FolderToKeyMap: Record<Folder, string> = {
  [Folder.NOTES]: '/',
  [Folder.SCRATCHPAD]: '/scratchpad',
  [Folder.FAVORITES]: '/favorites',
  [Folder.TRASH]: '/trash',
}

export const SlateElementHeight: Record<string, number> = {
  'heading-one': 65,
  'heading-two': 52,
  'block-quote': 44,
  'paragraph': 30,
}
// averageHeight: 35
