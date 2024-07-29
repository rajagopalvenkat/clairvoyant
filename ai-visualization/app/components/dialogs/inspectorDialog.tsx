import { ConfirmDialog, confirmable, createConfirmation } from "react-confirm";
import { ItemProperty } from "@/lib/utils/properties";
import { PropertyInspector } from "../editors/propertyEditor";
import { useEffect, useState } from "react";
import DialogWrapper from "./dialogWrapper";
import { buttonStyleClassNames } from "@/lib/statics/styleConstants";

const InspectorDialogInternal: ConfirmDialog<{
    title: string,
    message: string,
    options: Record<string, any>,
    properties: ItemProperty[]
}, Record<string, any> | null> = ({show, proceed, title, message, options, properties}) => {
    let [internalProperties, setInternalProperties] = useState(properties);

    useEffect(() => {
        setInternalProperties(properties);
    }, [properties])

    function handleChange(name: string, oldValue: any, newValue: any) {
        let newProperties = internalProperties.map(p => p.name === name ? {...p, value: newValue} : p);
        setInternalProperties(newProperties);
    }

    function handleSubmit() {
        let result: Record<string, any> = {};
        for (let p of internalProperties) {
            result[p.name] = p.value;
        }
        proceed(result);
    }

    return (
        <DialogWrapper onClose={() => proceed(null)} open={show}>
            <h1 className="dialog-title">{title}</h1>
            <p className="dialog-message">{message}</p>
            <PropertyInspector properties={internalProperties} onChange={handleChange} />
            <div className="flex flex-row justify-center mt-4">
                <button className={`${buttonStyleClassNames} mx-2 px-2 py-1 rounded-xl`} onClick={() => handleSubmit()}>OK</button>
                <button className={`${buttonStyleClassNames} mx-2 px-2 py-1 rounded-xl`} onClick={() => proceed(null)}>CANCEL</button>
            </div>
        </DialogWrapper>
    )
}

export const InspectorDialog = confirmable(InspectorDialogInternal);
export const inspect = createConfirmation(InspectorDialog);

export function showInspectorDialog(properties: ItemProperty[], title: string, message: string, options: Record<string, any> = {}) {
    return inspect({properties, title, message, options})
}