import { Outlet } from "react-router-dom"
import Navbar from "../../components/Navbar/Navbar"
import styles from './layout.module.css'
const Layout = () => {

    return (
        <div className={styles["layout"]}>
            <Navbar />
            <Outlet />
        </div>
    )
}

export default Layout