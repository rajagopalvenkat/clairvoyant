import { ensureError } from '@/lib/errors/error';
import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

export default function Canvas({draw, height, width, className, renderKey}: {
    draw: (ctx: CanvasRenderingContext2D) => void;
    height: number;
    width: number;
    renderKey?: number,
    className?: string;
}) {
    let canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        let canvas = canvasRef.current;
        if (canvas) {
            let ctx = canvas.getContext('2d');
            if (ctx && draw) {
                try {
                    draw(ctx);
                } catch (err) {
                    let error = ensureError(err);
                    toast.error(error.stack);
                }
            }
        }
    }, [draw, renderKey]);
    return <canvas className={className} ref={canvasRef} height={height} width={width} />
}