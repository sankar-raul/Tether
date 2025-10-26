import { RouterProvider } from 'react-router-dom'
import './App.css'
import { router } from './routes'
import UserInfoProvider from './context/userInfo/provider'
import AlertProvider from './context/alert/alertProvider'
// import CallBox from './components/CallBox/CallBox'
import AuthProvider from './context/auth/auth.provider'
import CallProvider from './context/call/call.provider'
import { ConfirmProvider } from './context/confirm/confirm.provider'


function App() {

  return (
    <ConfirmProvider>
    <AuthProvider>
      <UserInfoProvider>
        <CallProvider>
          <AlertProvider>
            <RouterProvider router={router} />
          </AlertProvider>
        </CallProvider>
        {/* <CallBox /> */}
      </UserInfoProvider>
    </AuthProvider>
    </ConfirmProvider>
  )
}

export default App
