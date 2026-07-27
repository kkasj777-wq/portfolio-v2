import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import DirectorPortfolio from './DirectorPortfolio.jsx'
import RayDirectorPortfolio from './RayDirectorPortfolio.jsx'

const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/'
const Page = normalizedPath === '/director-cut'
  ? DirectorPortfolio
  : normalizedPath === '/ray-director'
    ? RayDirectorPortfolio
    : App

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Page />
  </StrictMode>,
)
