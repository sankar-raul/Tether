// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
      <App />
  // </StrictMode>,
)
// let timeout = null
// document.documentElement.onclick = (e) => {
//   e.target.style.cursor = "url('/svg/cursor-clicked.svg') 10 10, auto"
//   timeout && clearTimeout(timeout)
//   timeout = setTimeout(() => {
//     e.target.style.cursor = "url('/svg/cursor.svg') 10 10, auto"
//   }, 100)
// }
