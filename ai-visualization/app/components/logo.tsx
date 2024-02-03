import { APP_NAME } from "@/lib/statics/appConstants";

export default function Logo() {
    return (
        <a href="/home">
            <div>
                <span className="text-2xl text-accent dark:text-accent-dark">{APP_NAME}</span>
            </div>
        </a>
    )
}