import { useEffect, useState, useCallback } from "react"

export function VDivider({onWidthChangeRequest}: {
    onWidthChangeRequest: (v: number) => void
}) {
    let [mouseX, setMouseX] = useState(0);
    let [draggingX, setDraggingX] = useState(false);

    let startDragging = useCallback((event: any) => {
        setDraggingX(true);
        console.log("Started drag");
        setMouseX(event.clientX);
    }, [])

    useEffect(() => {
        const stopDragging = (event: any) => {
            if (draggingX) {
                onWidthChangeRequest(event.clientX - mouseX);
            }
            setDraggingX(false);
            setMouseX(event.clientX);
        }
        const execDragging = (event: any) => {
            if (draggingX) {
                onWidthChangeRequest(event.clientX - mouseX);
            }
            setMouseX(event.clientX)
        }
        window.addEventListener("mousemove", execDragging);
        window.addEventListener("mouseup", stopDragging);
        return () => {
            window.removeEventListener("mousemove", execDragging);
            window.removeEventListener("mouseup", stopDragging);
        }
    }, [draggingX, mouseX, onWidthChangeRequest]);

    return (
        <button className="h-100 ml-2 px-1 border border-secondary-50 dark:border-secondary-950 bg-secondary-100 dark:bg-secondary-900" 
            onMouseDown={startDragging}>
            ||
        </button>
    )
}

export function HDivider({onWidthChangeRequest}: {
    onWidthChangeRequest: (v: number) => void
}) {
    let [mouseY, setMouseY] = useState(0);
    let [draggingY, setDraggingY] = useState(false);

    let startDragging = useCallback((event: any) => {
        setDraggingY(true);
        console.log("Started drag");
        setMouseY(event.clientY);
    }, [])

    useEffect(() => {
        const stopDragging = (event: any) => {
            if (draggingY) {
                onWidthChangeRequest(event.clientY - mouseY);
            }
            setDraggingY(false);
            setMouseY(event.clientY);
        }
        const execDragging = (event: any) => {
            if (draggingY) {
                onWidthChangeRequest(event.clientY - mouseY);
            }
            setMouseY(event.clientY)
        }
        window.addEventListener("mousemove", execDragging);
        window.addEventListener("mouseup", stopDragging);
        return () => {
            window.removeEventListener("mousemove", execDragging);
            window.removeEventListener("mouseup", stopDragging);
        }
    }, [draggingY, mouseY, onWidthChangeRequest]);

    return (
        <button className="w-100 mt-2 border border-secondary-50 dark:border-secondary-950 bg-secondary-100 dark:bg-secondary-900" 
            onMouseDown={startDragging}>
            ==
        </button>
    )
}