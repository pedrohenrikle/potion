import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from 'react-router-dom'
import { Default } from './pages/layouts/default'
import { Blank } from './pages/blank'
import { Document } from './pages/document'

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Default />}>
      <Route path="/" element={<Blank />} />
      <Route path="/documents/:id" element={<Document />} />
    </Route>,
  ),
)
