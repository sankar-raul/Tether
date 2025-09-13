import { Outlet } from "react-router-dom"
import styles from "./home.module.css"

const Home = () => {

    return (
        <>
            <h1>Home</h1>
            <video className={styles["transparentVideo"]} autoPlay loop muted playsInline>
            <source src="/assets/output2.webm" type="video/webm" />
                Your browser does not support transparent video.
            </video>
            <Outlet />
        </>
    )
}

export default Home