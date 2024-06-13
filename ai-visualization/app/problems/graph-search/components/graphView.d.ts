import * as vis from 'vis-network'

export declare type ISelectionEventParams = {
    nodes: vis.IdType[];
    edges: vis.IdType[];
}

export declare type IClickEventParams = ISelectionEventParams & {
    event: MouseEvent;
    pointer: {
        DOM: vis.Position;
        canvas: vis.Position;
    };
}

export declare type ClickItem = {
    node: vis.IdType;
} | {
    edge: vis.IdType;
} | {
    node: vis.IdType; labelId: number;
} | {
    edge: vis.IdType; labelId: number;
}

export declare type IClickItemEventParams = IClickEventParams & {
    items: ClickItem[];
}

export declare type IDeselectEventParams = IClickEventParams & {
    previousSelection: ISelectionEventParams;
}

export declare type IControlDragEventParams = IClickEventParams & {
    controlEdge: {from: vis.IdType, to: vis.IdType}
}

export declare type IZoomEventParams = {
    direction: '+' | '-';
    scale: number;
    pointer: vis.Position;
}

export declare type IStabilizedEventParams = {
    iterations: number;
}

export declare type IStabilizationEventParams = IStabilizedEventParams & {
    total: number;
}

export declare type IResizeEventParams = {
    width: number;
    height: number;
    oldWidth: number;
    oldHeight: number;
}

export declare interface GraphEvents {
    click?: (params: IClickItemEventParams) => void;
    doubleClick?: (params: IClickEventParams) => void;
    oncontext?: (params: IClickEventParams) => void;
    hold?: (params: IClickEventParams) => void;
    release?: (params: IClickEventParams) => void;
    select?: (params: IClickEventParams) => void;
    selectNode?: (params: IClickEventParams) => void;
    selectEdge?: (params: IClickEventParams) => void;
    deselectNode?: (params: IDeselectEventParams) => void;
    deselectEdge?: (params: IDeselectEventParams) => void;
    dragStart?: (params: IClickEventParams) => void;
    dragging?: (params: IClickEventParams) => void;
    dragEnd?: (params: IClickEventParams) => void;
    controlNodeDragging?: (params: IControlDragEventParams) => void;
    controlNodeDragEnd?: (params: IControlDragEventParams) => void;
    hoverNode?: (params: {node: vis.IdType}) => void;
    blurNode?: (params: {node: vis.IdType}) => void;
    hoverEdge?: (params: {edge: vis.IdType}) => void;
    blurEdge?: (params: {edge: vis.IdType}) => void;
    zoom?: (params: IZoomEventParams) => void;
    showPopup?: (popupId: vis.IdType) => void;
    hidePopup?: () => void;
    startStabilizing?: () => void;
    stabilizationProgress?: (params: IStabilizationEventParams) => void;
    stabilizationIterationsDone?: () => void;
    stabilized?: (params: IStabilizedEventParams) => void;
    resize?: (params: IResizeEventParams) => void;
    initRedraw?: () => void;
    beforeDrawing?: (context: CanvasRenderingContext2D) => void;
    afterDrawing?: (context: CanvasRenderingContext2D) => void;
    animationFinished?: () => void;
    // Documentation is unclear on what the passed parameter is for this event.
    configChange?: (params: {network: vis.Network, options: vis.Options}) => void;
}