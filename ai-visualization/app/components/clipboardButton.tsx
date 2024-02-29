import Image from "next/image"
import { ToastContainer, toast } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css';

export default function ClipboardButton({textToCopy, className, customCopyMessage}: {
    textToCopy: string,
    className?: string,
    customCopyMessage?: string
}) {
    function copyToClipboard() {
        navigator.clipboard.writeText(textToCopy)
        .then(() => toast(customCopyMessage ?? "Text copied!"))
        .catch((err) => console.error(err))
    }

    return (
        <>
            <button className={className} onClick={copyToClipboard}>
                <Image className="dark:invert" width={24} height={24} src={"/clipboard_copy.webp"} alt={"Copy to Clipboard Icon"}></Image>
            </button>
            <ToastContainer/>
        </>
    )
}