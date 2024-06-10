import * as vis from 'vis-network'

export declare interface ISelectionEventParams {
    nodes: vis.IdType[];
    edges: vis.IdType[];
}

export declare interface IClickEventParams extends ISelectionEventParams {
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

export declare interface IClickItemEventParams extends IClickEventParams {
    items: ClickItem[];
}

export declare interface IDeselectEventParams extends IClickEventParams {
    previousSelection: ISelectionEventParams;
}

export declare interface IControlDragEventParams extends IClickEventParams {
    controlEdge: {from: vis.IdType, to: vis.IdType}
}

export declare interface IZoomEventParams {
    direction: '+' | '-';
    scale: number;
    pointer: vis.Position;
}

export declare interface IStabilizedEventParams {
    iterations: number;
}

export declare interface IStabilizationEventParams extends IStabilizedEventParams {
    total: number;
}

export declare interface IResizeEventParams {
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