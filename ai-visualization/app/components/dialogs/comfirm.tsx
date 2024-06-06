import { buttonBaseClasses } from "@mui/material";
import { ConfirmDialog, confirmable, createConfirmation } from "react-confirm";
import DialogWrapper from "./dialogWrapper";

const ConfirmationDialogInternal: ConfirmDialog<{
    confirmation: string,
    options: Record<string, any>
}, null | boolean> = ({show, proceed, confirmation, options}) => {
    return (
        <DialogWrapper onClose={() => proceed(null)} open={show}>
            {confirmation}
            <button className={`${buttonBaseClasses}`} onClick={() => proceed(false)}>CANCEL</button>
            <button className={`${buttonBaseClasses}`} onClick={() => proceed(true)}>OK</button>
        </DialogWrapper>
    )
}

export const ConfirmationDialog = confirmable(ConfirmationDialogInternal);
export const confirm = createConfirmation(ConfirmationDialog);

export function showConfirmation(confirmation: string, options: Record<string, any> = {}) {
    return confirm({confirmation, options})
}
