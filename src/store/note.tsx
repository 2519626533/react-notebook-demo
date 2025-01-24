import type { NoteSate } from '@/types/slice'
import { createSlice } from '@reduxjs/toolkit'

export const noteInitialState: NoteSate = {
  content: JSON.parse(localStorage.getItem('content') as string) || [
    {
      type: 'paragraph',
      children: [
        { text: 'The Power of Small Steps\n', bold: true },
      ],
    },
    {
      type: 'paragraph',
      children: [
        { text: 'In life, we often dream big and set ambitious goals. However, it’s easy to feel overwhelmed by the enormity of these aspirations. The key to achieving them lies in taking small, consistent steps.\n' },
        { text: 'Every great journey begins with a single step. Whether it’s learning a new skill, improving health, or building a career, progress is made through daily efforts. Small actions, when repeated over time, compound into significant results. For example, reading just 10 pages a day can lead to finishing dozens of books in a year. Similarly, saving a little money regularly can grow into a substantial amount over time.\n' },
        { text: 'The beauty of small steps is that they are manageable and sustainable. They reduce the pressure of perfection and allow us to focus on the process rather than the outcome. By celebrating small wins, we stay motivated and build momentum.\n' },
        { text: 'Remember, Rome wasn’t built in a day. Embrace the power of small steps, and you’ll find yourself closer to your dreams than you ever imagined.\n' },
      ],
    },
  ]
  || [
    [
      {
        type: 'paragraph',
        lineNumber: 1,
        children: [
          {
            text: '# Welcome to Takenote!',
          },
        ],
      },
      {
        type: 'paragraph',
        lineNumber: 2,
        children: [
          {
            text: '',
          },
        ],
      },
      {
        type: 'paragraph',
        lineNumber: 3,
        children: [
          {
            text: 'TakeNote is a free, open-source notes app for the web. It is a demo project only, and does not integrate with any database or cloud. Your notes are saved in local storage and will not be permanently persisted, but are available for download.',
          },
        ],
      },
      {
        type: 'paragraph',
        lineNumber: 4,
        children: [
          {
            text: '',
          },
        ],
      },
      {
        type: 'paragraph',
        lineNumber: 5,
        children: [
          {
            text: 'View the source on [Github](https://github.com/taniarascia/takenote).',
          },
        ],
      },
      {
        type: 'paragraph',
        lineNumber: 6,
        children: [
          {
            text: '',
          },
        ],
      },
      {
        type: 'paragraph',
        lineNumber: 7,
        children: [
          {
            text: '## Features',
          },
        ],
      },
      {
        type: 'paragraph',
        lineNumber: 8,
        children: [
          {
            text: '',
          },
        ],
      },
      {
        type: 'paragraph',
        lineNumber: 9,
        children: [
          {
            text: '- **Plain text notes** - take notes in an IDE-like environment that makes no assumptions',
          },
        ],
      },
      {
        type: 'paragraph',
        lineNumber: 10,
        children: [
          {
            text: '- **Markdown preview** - view rendered HTML',
          },
        ],
      },
      {
        type: 'paragraph',
        lineNumber: 11,
        children: [
          {
            text: '- **Linked notes** - use `{{uuid}}` syntax to link to notes within other notes',
          },
        ],
      },
      {
        type: 'paragraph',
        lineNumber: 12,
        children: [
          {
            text: '- **Syntax highlighting** - light and dark mode available (based on the beautiful [New Moon theme](https://taniarascia.github.io/new-moon/))',
          },
        ],
      },
      {
        type: 'paragraph',
        lineNumber: 13,
        children: [
          {
            text: '- **Keyboard shortcuts** - use the keyboard for all common tasks - creating notes and categories, toggling settings, and other options',
          },
        ],
      },
      {
        type: 'paragraph',
        lineNumber: 14,
        children: [
          {
            text: '- **Drag and drop** - drag a note or multiple notes to categories, favorites, or trash',
          },
        ],
      },
      {
        type: 'paragraph',
        lineNumber: 15,
        children: [
          {
            text: '- **Multi-cursor editing** - supports multiple cursors and other [Codemirror](https://codemirror.net/) options',
          },
        ],
      },
      {
        type: 'paragraph',
        lineNumber: 16,
        children: [
          {
            text: '- **Search notes** - easily search all notes, or notes within a category',
          },
        ],
      },
      {
        type: 'paragraph',
        lineNumber: 17,
        children: [
          {
            text: '- **Prettify notes** - use Prettier on the fly for your Markdown',
          },
        ],
      },
      {
        type: 'paragraph',
        lineNumber: 18,
        children: [
          {
            text: '- **No WYSIWYG** - made for developers, by developers',
          },
        ],
      },
      {
        type: 'paragraph',
        lineNumber: 19,
        children: [
          {
            text: '- **No database** - notes are only stored in the browser\'s local storage and are available for download and export to you alone',
          },
        ],
      },
      {
        type: 'paragraph',
        lineNumber: 20,
        children: [
          {
            text: '- **No tracking or analytics** - \'nuff said',
          },
        ],
      },
      {
        type: 'paragraph',
        lineNumber: 21,
        children: [
          {
            text: '- **GitHub integration** - self-hosted option is available for auto-syncing to a GitHub repository (not available in the demo)',
          },
        ],
      },
      {
        type: 'paragraph',
        lineNumber: 22,
        children: [
          {
            text: '',
          },
        ],
      },
      {
        type: 'paragraph',
        lineNumber: 23,
        children: [
          {
            text: '你好**你好**',
          },
        ],
      },
      {
        type: 'paragraph',
        lineNumber: 24,
        children: [
          {
            text: '{{76b456}}',
          },
        ],
      },
      {
        type: 'paragraph',
        lineNumber: 25,
        children: [
          {
            text: '',
          },
        ],
      },
    ],
  ],
}

const noteStore = createSlice({
  name: 'note',
  initialState: noteInitialState,
  reducers: {
    setContent(state, action) {
      state.content = action.payload
      localStorage.setItem('content', JSON.stringify(action.payload))
    },
    setContentLocalStorage(state) {
      localStorage.setItem('content', JSON.stringify(state.content))
    },
  },
})

export const noteReducer = noteStore.reducer
export const { setContent } = noteStore.actions
