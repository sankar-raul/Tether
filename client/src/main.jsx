// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const root = createRoot(document.getElementById('root'))
root.render(<App />)

// let timeout = null
// document.documentElement.onclick = (e) => {
//   e.target.style.cursor = "url('/svg/cursor-clicked.svg') 10 10, auto"
//   timeout && clearTimeout(timeout)
//   timeout = setTimeout(() => {
//     e.target.style.cursor = "url('/svg/cursor.svg') 10 10, auto"
//   }, 100)
// }