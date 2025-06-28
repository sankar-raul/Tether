import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom"
import Home from "./pages/Home/Home"
import Login from "./pages/Login/Login"
import SignUp from "./pages/SignUp/SignUp"
import Layout from "./pages/Layout/Layout"
import ChatLayout from "./pages/ChatLayout/ChatLayout"
import Chat from "./pages/Chat/Chat"
import { ProtectedRoute } from "./hook/authSecurity"
import ContactsProvider from './context/contacts/provider'
import SettingsTab from "./components/SettingsTab/Settings"
import { Calls, Chats } from "./components/Contacts/Contacts"

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
            <Route index element={<Chats />} />
            <Route path="settings">
                <Route index element={<SettingsTab />}/>
            </Route>
            <Route path="calls" element={<Calls />} />
        </Route>
        </>
    )
)
