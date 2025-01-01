import Category from '@/pages/Category'
import NotFound from '@/pages/NotFound'
import { createBrowserRouter } from 'react-router-dom'
import LayoutPage from '../pages/Layout'
import Favorites from '../pages/Layout/Favorites'
import Notes from '../pages/Layout/Notes'
import Scratchpad from '../pages/Layout/Scratchpad'
import Trash from '../pages/Layout/Trash'

const router = createBrowserRouter([
  {
    path: '/',
    element: <LayoutPage />,
    children: [
      {
        path: 'scratchpad',
        element: <Scratchpad />,
      },
      {
        index: true,
        element: <Notes />,
      },
      {
        path: 'favorites',
        element: <Favorites />,
      },
      {
        path: 'trash',
        element: <Trash />,
      },
    ],
  },
  {
    path: '/category',
    element: <Category />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
])

export default router
