import { APP_NAME } from "@/lib/statics/appConstants";
import Link from "next/link";

export default function Logo() {
    return (
        <Link href="/">
            <div>
                <span className="text-2xl text-accent dark:text-accent-dark">{APP_NAME}</span>
            </div>
        </Link>
    )
}