import { RouterProvider } from 'react-router-dom'
import './App.css'
import { router } from './routes'
import UserInfoProvider from './context/userInfo/provider'

function App() {

  return (
      <UserInfoProvider>
        <RouterProvider router={router} />
      </UserInfoProvider>
  )
}

export default App
