import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom"
import Home from "./pages/Home/home"
import Login from "./pages/Login/Login"
import SignUp from "./pages/SignUp/SignUp"
import Layout from "./pages/Layout/Layout"

export const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<Layout />}>
            <Route index element={<Home />}>

            </Route>
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<SignUp />} />
            <Route path="*" element={<h1>Not Found!</h1>}/>
        </Route>
    )
)