import { Dialog, DialogProps } from "@mui/material"
import "./dialog.css"

export default function DialogWrapper(props: DialogProps & {
    children: React.ReactNode,
}) {
    let {children, ...rest} = props;
    return (
        <Dialog {...rest}>
            <div className="dialog bg-secondary-50 dark:bg-secondary-950 border-2 border-secondary-500 text-secondary-950 dark:text-secondary-50">
                {children}
            </div>
        </Dialog>
    )
}