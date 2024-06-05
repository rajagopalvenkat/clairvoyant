import { buttonStyleClassNames, getButtonStyleClassNamesForColor } from "@/lib/statics/styleConstants";
import { ItemProperty } from "@/lib/utils/properties"
import Select from "react-select";

import "./propertyEditor.css"
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

export function PropertyInspector({properties, onChange}: {
    properties: ItemProperty[],
    onChange: (propertyName: string, oldValue: any, newValue: any) => void,
}) {
    return (
        <div className="flex flex-col">
            {properties.filter(p => !p.hidden).map((property, index) => (
                <PropertyField key={index} property={property} onChange={(value) => onChange(property.name, property.value, value)} />
            ))}
        </div>
    )
}

export function PropertyField({property, onChange}: {
    property: ItemProperty,
    onChange: (value: any) => void,
}) {
    return (
        <div className="flex flex-row items-center mb-1">
            <label className="flex-grow text-secondary-800 dark:text-secondary-200 mr-3">{property.name}</label>
            <PropertyEditor property={property} onChange={onChange} />
        </div>
    )
}

function PropertySetButton({property, internalValue, text="Apply", onPress}: {
    property: ItemProperty,
    internalValue: string,
    text?: string,
    onPress: () => void,
}) {
    if (property.fixed) {return <></>}
    return (
        <button disabled={`${property.value}` == internalValue} className="trigger-button" onClick={() => onPress()}> {text} </button>
    )
}

export function PropertyEditor({property, onChange}: {
    property: ItemProperty,
    onChange: (value: any) => void,
}) {
    let [internalValue, setInternalValue] = useState(`${property.value}`);
    
    let onChangeEnsureFloat = useCallback((value: string) => {
        let floatValue = parseFloat(value);
        if (isNaN(floatValue)) {
            toast.error(`Invalid number: ${value}`);
            return;
        }
        onChange(floatValue);
    }, [onChange])

    // Update internal value when it is externally changed
    useEffect(() => {
        setInternalValue(`${property.value}`);
    }, [property])

    if (property.type === "string") {
        if (property.options) {
            return (
                <Select unstyled className="" classNames={{
                    control: (state) => {return `${buttonStyleClassNames} rounded pl-2 border-solid border-2 border-secondary-50 dark:border-secondary-950`}, 
                    option: (state) => {return `${buttonStyleClassNames} p-1`}}}
                    options={property.options.map(n => {return {value: n, label: n}})}
                    onChange={e => {onChange(e?.value)}}>
                </Select>
            )
        }
        return (
            <>
                <input type="text" disabled={property.fixed} value={internalValue} onChange={(e) => setInternalValue(e.target.value)} />
                <PropertySetButton property={property} internalValue={internalValue} onPress={() => onChange(internalValue)} />
            </>
        )
    }
    if (property.type === "number") {
        return (
            <>
                <input type="number" disabled={property.fixed} value={internalValue} onChange={(e) => setInternalValue(e.target.value)} />
                <PropertySetButton property={property} internalValue={internalValue} onPress={() => onChangeEnsureFloat(internalValue)} />
            </>
        )
    }
    if (property.type === "boolean") {
        if (!property.trigger) {
            return (
                <input type="checkbox" disabled={property.fixed} checked={property.value} onChange={(e) => onChange(e.target.checked)} />
            )
        } 
        else {
            return (
                <button disabled={property.fixed || property.value} className="trigger-button" onClick={() => onChange(true)}> {property.value ? "Already Set" : "Set"} </button>
            )
        }
    }
}