import { RouterProvider } from 'react-router-dom'
import './App.css'
import { router } from './routes'
import UserInfoProvider from './context/userInfo/provider'
import AlertProvider from './context/alert/alertProvider'
// import CallBox from './components/CallBox/CallBox'
import AuthProvider from './context/auth/auth.provider'


function App() {

  return (
    <AuthProvider>
      <UserInfoProvider>
        <AlertProvider>
          <RouterProvider router={router} />
        </AlertProvider>
        {/* <CallBox /> */}
      </UserInfoProvider>
    </AuthProvider>
  )
}

export default App
