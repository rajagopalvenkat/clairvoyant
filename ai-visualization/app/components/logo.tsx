import { APP_NAME } from "@/lib/statics/appConstants";
import Link from "next/link";
import Image from "next/image";

export default function Logo() {
    return (
        <Link href="/">
            <Image src="/ClairvoyantLogoProgrammerArt.png" alt={APP_NAME} width={200} height={50} />
        </Link>
    )
}