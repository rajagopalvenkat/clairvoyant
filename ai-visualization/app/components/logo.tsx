import { APP_NAME } from "@/lib/statics/appConstants";
import Link from "next/link";
import Image from "next/image";

export default function Logo({height}: {height?: number}) {
    let h = height ?? 50;
    return (
        <Link href="/">
            <Image src="/ClairvoyantLogoProgrammerArt.png" alt={APP_NAME} width={200 * h / 50} height={h} priority className="w-auto"/>
        </Link>
    )
}