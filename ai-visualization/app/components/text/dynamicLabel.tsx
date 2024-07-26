export default function DynamicLabel({text}: {
    text: string
}) {
    return <div className="max-w-full h-12 text-nowrap overflow-auto">
        {text}
    </div>
}