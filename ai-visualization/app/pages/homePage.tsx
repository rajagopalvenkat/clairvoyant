import { APP_NAME } from "@/lib/statics/appConstants";
import Header from "../components/header";

export default function HomePage() {
    return (
        <>
            <Header selectedPage={"Home"}></Header>
            <div>
                <p>This is the home page of {APP_NAME}</p>
            </div>
        </>
    );
}