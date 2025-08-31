import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom"
import Home from "./pages/Home/Home"
import Login from "./pages/Auth/Login/Login"
import SignUp from "./pages/Auth/SignUp/SignUp"
import Layout from "./pages/Layout/Layout"
import ChatLayout from "./pages/ChatLayout/ChatLayout"
import { ProtectedRoute } from "./hook/authSecurity"
import ContactsProvider from './context/contacts/provider'
import SettingsTab from "./components/SettingsTab/Settings"
import { Calls, Chats } from "./components/Contacts/Contacts"
import ChatChildlayout from './pages/ChatLayout/ChatChildLayout'
import ChatBox from "./components/ChatBox/ChatBox"
import DefaultChatView from "./components/ChatBox/DefaultView/DefaultView"
import ProfileSettings from "./components/Setttings/ProfileSettings/ProfileSettings"
import AccountSettings from "./components/Setttings/AccountSettings/AccountSettings"
import ThemeSettings from "./components/Setttings/ThemeSettings/AccountSettings"
import SessionSettings from "./components/Setttings/SessionSettings/AccountSettings"
import Test from "./pages/test/test"
import Verify from "./pages/Auth/SignUp/Verify/Verify"
import AuthLayout from "./pages/Auth/authLayout"

export const router = createBrowserRouter(
    createRoutesFromElements(
        <>
        <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<AuthLayout />} >
                <Route index element={<Login />} />
                <Route path="forgot" element={<h1>Forgot password</h1>} />
            </Route>
            <Route path="signup" element={<AuthLayout />} >
                <Route index element={<SignUp />} />
                <Route path="verify/:otp_token" element={<Verify />} />
            </Route>
            <Route path="*" element={<h1>Not Found!</h1>}/>
        </Route>
        <Route path="/chat/*" element={(
            <ProtectedRoute>
                <ContactsProvider>
                    <ChatLayout />
                </ContactsProvider>
            </ProtectedRoute>
            )}>
            <Route index element={<ChatChildlayout CurrentTabComponent={Chats} />} />
            <Route path="c" element={<ChatChildlayout CurrentTabComponent={Chats} />}>
                <Route index element={<ChatBox />} />
            </Route>

            <Route path="settings" element={<ChatChildlayout CurrentTabComponent={SettingsTab} hideContactBtn={true} />}>
                <Route index element={<DefaultChatView />}/>
                <Route path="edit-profile" element={<ProfileSettings />} />
                <Route path="accounts" element={<AccountSettings />} />
                <Route path="themes" element={<ThemeSettings />} />
                <Route path="sessions" element={<SessionSettings />} />
                <Route path="*" element={<h1>Invalid Path</h1>} />
            </Route>
            <Route path="calls" element={<ChatChildlayout CurrentTabComponent={Calls} />} />
            <Route path="*" element={<h1>Page Not Found!</h1>} />
        </Route>
        <Route path="/test" element={<Test />} />
        </>
    )
)
