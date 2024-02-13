import { useEffect, useState } from "react"

export function VDivider({onWidthChangeRequest}: {
    onWidthChangeRequest: (v: number) => void
}) {
    let [mouseX, setMouseX] = useState(0);
    let [draggingX, setDraggingX] = useState(false);

    function startDragging(_event: {clientX: number}) {
        setDraggingX(true);
        console.log("Started drag")
        mouseX = _event.clientX;
    }
    function stopDragging(_event: {clientX: number}) {
        console.log("Stopped drag")
        setDraggingX(false);
    }

    useEffect(() => {
        const handleMouseMove = (event: {clientX: number}) => {
            if (draggingX) {
                onWidthChangeRequest(event.clientX - mouseX);
                console.log(event.clientX - mouseX);
            }
            setMouseX(event.clientX);
        }
        window.addEventListener("mousemove", handleMouseMove);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [draggingX]);

    return (
        <button className="h-100 border-secondary-50 dark:border-secondary-950 ml-2 border bg-secondary-100 dark:bg-secondary-900" onMouseDown={startDragging} onMouseUp={stopDragging}>
            ||
        </button>
    )
}