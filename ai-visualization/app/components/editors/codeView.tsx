import ReactCodeMirror, { EditorView, Extension, ReactCodeMirrorProps } from "@uiw/react-codemirror"
import React, { useEffect } from "react"

type CodeViewProps = {

} & ReactCodeMirrorProps

export default function CodeView(props: CodeViewProps) {
    let containerRef = React.useRef<HTMLDivElement>(null)
    let { extensions, ...codeMirrorProps } = props
    let [fontSize, setFontSize] = React.useState(14);
    let [extraExtensions, setExtraExtensions] = React.useState<Extension[]>([]);

    useEffect(() => {
        let listener = (e: WheelEvent) => {
            if (e.ctrlKey) {
                e.preventDefault();
                let newFontSize = fontSize - e.deltaY / 100;
                console.log(`Setting editor font size to ${newFontSize}`);
                setFontSize(newFontSize);
                setExtraExtensions([
                    EditorView.theme({
                        "&": {fontSize: `${newFontSize}px`}
                    })
                ])
            }
        }
        if (containerRef.current) {
            containerRef.current.addEventListener("wheel", listener);
        }
        return () => {
            if (containerRef.current) {
                containerRef.current.removeEventListener("wheel", listener);
            }
        }
    }, [containerRef, fontSize])

    return (
        <div ref={containerRef}>
            <ReactCodeMirror extensions={[...extensions ?? [], extraExtensions]} {...codeMirrorProps}>

            </ReactCodeMirror>
        </div>
    )
}