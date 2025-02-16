import { RouterProvider } from 'react-router-dom'
import './App.css'
import { router } from './routes'
import UserInfoProvider from './context/userInfo/provider'
import AlertProvider from './context/alert/alertProvider'

function App() {

  return (
      <UserInfoProvider>
        <AlertProvider>
          <RouterProvider router={router} />
        </AlertProvider>
      </UserInfoProvider>
  )
}

export default App
