"use client"

import Header from "@/app/components/header";
import { PROBLEMS } from "@/lib/statics/appConstants";
import DocsRef from "../components/docs/docsReference";
import { ConstDocAny, ConstDocBoolean, ConstDocCanvasContext, ConstDocNumber, ConstDocString, docArrayOf, docMaybeUndefined, FunctionDocType, IDocType, UnionDocType } from "@/lib/docs/doclib";
import { DocsContainer } from "../components/docs/docsContainer";
import { DocsInterface } from "../components/docs/docsInterface";
import DocsProperty from "../components/docs/docsProperty";
import { DocsFunction } from "../components/docs/docsFunction";
import { PropertySupportedTypes } from "../components/editors/propertyEditor";
import { DocsWarning } from "../components/docs/docsSections";
import { DocsClass } from "../components/docs/docsClass";

export const EditableComponentType = new IDocType("EditableComponent", "/docs", "EditableComponent");
export const PropertyType = new IDocType("ItemProperty", "/docs", "ItemProperty");
const TypeVarT = new IDocType("T", "", "");

export const CanvasHelperType = new IDocType("CanvasHelper", "/docs", "CanvasHelper");

export default function DocsIndex() {
    return (
        <div>
            <Header selectedPage="home"></Header>
            <DocsContainer title={"Clairvoyant Documentation"}>
                <div className="flex flex-row justify-center gap-8 mt-8">
                    {Object.keys(PROBLEMS).map(problemId => {
                    const problem = PROBLEMS[problemId];
                    return (
                        <div key={problemId} className="flex flex-col items-center">
                        <h2 className="text-2xl font-semibold">{problem.name}</h2>
                        <p className="text-sm opacity-50">Explore the documentation for {problem.name}</p>
                        <a
                            href={problem.docshref}
                            className="group rounded-lg border border-transparent px-5 pt-4 pb-1 mt-2 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
                        >
                            <h2 className={`mb-3 text-2xl font-semibold`}>
                            Go{' '}
                            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                                -&gt;
                            </span>
                            </h2>
                        </a>
                        </div>
                    )
                    })}
                </div>

                <h2 className="text-2xl text-center">Property API</h2>
                <p>The property API is a cross-problem API which may in useful for advanced user interactions.</p>
                <p>Some classes across problems implement the {EditableComponentType.render()} interface. You can see a list of their properties and the constraints they have by accessing its <DocsRef refs="EditableComponent.properties">properties</DocsRef> getter.</p>

                <DocsInterface clazzName="EditableComponent">
                    <DocsProperty getter clazzName="EditableComponent" property={{name: "id", type: new UnionDocType([ConstDocNumber, ConstDocString])}}>
                        <p>All EditableComponents have an ID field. This can often be used to uniquely identify a component among a list of generic EditableComponents.</p>
                    </DocsProperty>
                    <DocsProperty getter clazzName="EditableComponent" property={{name: "properties", type: docArrayOf(PropertyType)}}>
                        <p>Gets all properties for the given component.</p>

                        <p>If you are extending an {EditableComponentType.render()}, you should generally extend the array given by <DocsRef refs="EditableComponent.properties">super.properties</DocsRef>.</p>
                    </DocsProperty>
                    <DocsFunction clazzName="EditableComponent" functionName="getProp" args={[
                        {name: "name", type: ConstDocString}
                    ]} returnType={ConstDocAny}>
                        <p>Gets the value of a given {PropertyType.render()} by name.</p>

                        <p>If no such property exists, it returns undefined.</p>
                    </DocsFunction>
                    <DocsFunction clazzName="EditableComponent" functionName="setProp" args={[
                        {name: "name", type: ConstDocString},
                        {name: "value", type: ConstDocAny}
                    ]} returnType={ConstDocBoolean}>
                        <p>Attempts to set the {PropertyType.render()} given by the name to the given value.</p>

                        <p>It no such property exists, it returns false.</p>

                        <p>If the property&apos;s restrictions forbid it from being set to that value, it will throw a descriptive error.</p>

                        <p>Otherwise, it returns true.</p>

                        <DocsWarning>
                            <p>If you override this method, it is your responsibility to ensure that property constraints are respected.</p>
                            <p> 
                                If you are extending a class that is already an {EditableComponentType.render()}, 
                                calling <DocsRef refs="EditableComponent.setProp">super.setProp</DocsRef> will perform a generalized check on all your properties before allowing a change.
                                It will also handle property changes from the superclass. If it returns true, you should also return true immediately,
                                as that means the superclass already handled the property change.
                            </p>
                        </DocsWarning>
                    </DocsFunction>
                </DocsInterface>
                <DocsInterface clazzName="ItemProperty" genericTypes={[TypeVarT]}>
                    <DocsProperty clazzName="ItemProperty" property={{name: "name", type: ConstDocString}}>
                        <p>A unique name for the property.</p>
                    </DocsProperty>
                    <DocsProperty clazzName="ItemProperty" property={{name: "type", type: ConstDocString}}>
                        <p>The intended type of the property value. This is used for property inspector fields.</p>
                        <p>Currently accepted types are {PropertySupportedTypes.join(', ')}.</p>
                    </DocsProperty>
                    <DocsProperty clazzName="ItemProperty" property={{name: "value", type: TypeVarT}}>
                        <p>The currently assigned value of the property.</p>
                    </DocsProperty>
                    <DocsProperty clazzName="ItemProperty" property={{name: "fixed", type: docMaybeUndefined(ConstDocBoolean)}}>
                        <p>If true, the property cannot be altered via the <DocsRef refs="EditableComponent.setProp">setProp</DocsRef> function or via inspectors.</p>
                    </DocsProperty>
                    <DocsProperty clazzName="ItemProperty" property={{name: "trigger", type: docMaybeUndefined(ConstDocBoolean)}}>
                        <p>Only works for boolean properties. If true, inspectors will render a button that sets the property to true instead of a checkbox. The button is disabled if the property is already true.</p>
                    </DocsProperty>
                    <DocsProperty clazzName="ItemProperty" property={{name: "hidden", type: docMaybeUndefined(ConstDocBoolean)}}>
                        <p>If true, the property won&apos;t be displayed in inspectors.</p>
                    </DocsProperty>
                    <DocsProperty clazzName="ItemProperty" property={{name: "dynamic", type: docMaybeUndefined(ConstDocBoolean)}}>
                        <p>If true, inspectors will not show an Apply button to confirm changes. Every change in the input field will be immediately submitted.</p>

                        <p>For types such as numbers or objects, the change will only be submitted if the field text can be parsed correctly.</p>
                    </DocsProperty>
                    <DocsProperty clazzName="ItemProperty" property={{name: "options", type: docMaybeUndefined(docArrayOf(TypeVarT))}}>
                        <p>If defined, values assigned to the property must be contained within the given options.</p>

                        <p>String property inspectors with defined options will display a dropdown menu with the given options instead of a text field.</p>
                    </DocsProperty>
                    <DocsProperty clazzName="ItemProperty" property={{name: "description", type: docMaybeUndefined(ConstDocString)}}>
                        <p>A textual description of the property. If defined, it will be used to display a tooltip on property inspectors.</p>
                    </DocsProperty>
                    <DocsProperty clazzName="ItemProperty" property={{name: "display", type: docMaybeUndefined(ConstDocString)}}>
                        <p>If defined, it overrides the display name of the property in property inspectors.</p>
                    </DocsProperty>
                    <DocsProperty clazzName="ItemProperty" property={{name: "check", type: docMaybeUndefined(new FunctionDocType([TypeVarT], ConstDocBoolean))}}>
                        <p>If defined, whenever an attempt to change the property is made, it will be called with the new value. If it returns false, the property set will deemed invalid and aborted.</p>
                    </DocsProperty>                
                </DocsInterface>

                <h2 className="text-2xl text-center">Canvas Helper API</h2>
                <p>The canvas helper API is a cross-problem API which simplifies some common operations on a canvas.</p>
                
                <DocsClass clazzName="CanvasHelper">
                    <DocsFunction clazzName="CanvasHelper" functionName="constructor" args={[{name: "ctx", type: ConstDocCanvasContext}]} hideReturnType>
                        <p>Constructs a new canvas helper with the given canvas context.</p>
                    </DocsFunction>
                    <DocsFunction clazzName="CanvasHelper" functionName="drawCircle" args={[
                        {name: "x", type: ConstDocNumber},
                        {name: "y", type: ConstDocNumber},
                        {name: "r", type: ConstDocNumber},
                        {name: "color", type: docMaybeUndefined(ConstDocString), default: undefined, showDefault: true},
                    ]}>
                        <p>Draws a circle at (x,y) with radius r. If a color is given, it will set the fillStyle of the context to that color before drawing.</p>
                    </DocsFunction>
                    <DocsFunction clazzName="CanvasHelper" functionName="drawLine" args={[
                        {name: "x1", type: ConstDocNumber},
                        {name: "y1", type: ConstDocNumber},
                        {name: "x2", type: ConstDocNumber},
                        {name: "y2", type: ConstDocNumber},
                        {name: "color", type: docMaybeUndefined(ConstDocString), default: undefined, showDefault: true},
                        {name: "thickness", type: docMaybeUndefined(ConstDocNumber), default: undefined, showDefault: true},
                    ]}>
                        <p>Draws a line from (x1,y1) to (x2,y2). If a color is given, it will set the strokeStyle of the context to that color before drawing. If a thickness is given, it will set the lineWidth value in the context to that thickness before drawing.</p>
                    </DocsFunction>
                    <DocsFunction clazzName="CanvasHelper" functionName="drawTextCentered" args={[
                        {name: "text", type: ConstDocString},
                        {name: "x", type: ConstDocNumber},
                        {name: "y", type: ConstDocNumber},
                        {name: "size", type: ConstDocNumber},
                        {name: "color", type: docMaybeUndefined(ConstDocString), default: undefined, showDefault: true},
                        {name: "strokeColor", type: docMaybeUndefined(ConstDocString), default: undefined, showDefault: true},
                        {name: "maxWidth", type: docMaybeUndefined(ConstDocNumber), default: undefined, showDefault: true},
                        {name: "fontFamily", type: ConstDocString, default: "Arial"}
                    ]}>
                        <p>This function draws the given text with the given parameters centered around (x,y) and with the font given by the fontFamily and size.</p>

                        <p>This function has side effects on the context, it sets textAlign, textBaseline, and font.</p>
                        <p>If a color is provided, it also sets the fillStyle. If a strokeColor is provided, it also sets the strokeStyle.</p>
                    </DocsFunction>
                    <DocsFunction clazzName="CanvasHelper" functionName="drawGrid" args={[
                        {name: "x", type: ConstDocNumber},
                        {name: "y", type: ConstDocNumber},
                        {name: "width", type: ConstDocNumber},
                        {name: "height", type: ConstDocNumber},
                        {name: "columns", type: ConstDocNumber},
                        {name: "rows", type: ConstDocNumber},
                        {name: "color", type: docMaybeUndefined(ConstDocString), default: undefined, showDefault: true},
                        {name: "includeBorders", type: ConstDocBoolean, default: false}
                    ]}>
                        <p>This draws a grid whose top left corner is in (x,y), has size (width, height), and has the given rows and columns.</p>

                        <p>If includeBorders is set to true, it will also draw the outside borders</p>

                        <p>If a color is provided, it will set the context strokeStyle before drawing.</p>
                    </DocsFunction>
                </DocsClass>
            </DocsContainer>
        </div>
    )
}