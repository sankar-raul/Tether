import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom"
import Home from "./pages/Home/Home"
import Login from "./pages/Login/Login"
import SignUp from "./pages/SignUp/SignUp"
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

export const router = createBrowserRouter(
    createRoutesFromElements(
        <>
        <Route path="/" element={<Layout />}>
            <Route index element={<Home />}>

            </Route>
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<SignUp />} />
            <Route path="forgot" element={<>forgot password</>} />

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
        </>
    )
)
