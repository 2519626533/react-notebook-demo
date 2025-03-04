import LoadingFallback from '@/components/element/LoadingFallback'
// import Category from '@/pages/Category'
// import LayoutPage from '@/pages/Layout'
// import Favorites from '@/pages/Layout/Favorites'
// import Notes from '@/pages/Layout/Notes'
// import Scratchpad from '@/pages/Layout/Scratchpad'
// import Trash from '@/pages/Layout/Trash'
// import NotFound from '@/pages/NotFound'
import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'

const Category = lazy(() => import(
  /* webpackChunkName: "category" */
  '@/pages/Category'
))
const NotFound = lazy(() => import(
  /* webpackChunkName: "not-found" */
  '@/pages/NotFound'
))
const LayoutPage = lazy(() => import(
  /* webpackChunkName: "layout-views" */
  '@/pages/Layout'
))
const Favorites = lazy(() => import(
  /* webpackChunkName: "layout-views" */
  '@/pages/Layout/Favorites'
))
const Notes = lazy(() => import(
  /* webpackChunkName: "layout-views" */
  '@/pages/Layout/Notes'
))
const Scratchpad = lazy(() => import(
  /* webpackChunkName: "layout-views" */
  '@/pages/Layout/Scratchpad'
))
const Trash = lazy(() => import(
  /* webpackChunkName: "layout-views" */
  '@/pages/Layout/Trash'
))

const router = createBrowserRouter([
  {
    path: '/',
    element: <LayoutPage />,
    children: [
      {
        path: 'scratchpad',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Scratchpad />
          </Suspense>
        ),
      },
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Notes />
          </Suspense>
        ),
      },
      {
        path: 'favorites',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Favorites />
          </Suspense>
        ),
      },
      {
        path: 'trash',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Trash />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '/category',
    element: <Category />,
  },
  {
    path: '*',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <NotFound />
      </Suspense>
    ),
  },
])

export default router
