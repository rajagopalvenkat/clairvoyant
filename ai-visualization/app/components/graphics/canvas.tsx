import { ensureError } from '@/lib/errors/error';
import React from 'react';
import { toast } from 'react-toastify';

export default function Canvas({draw, height, width, className}: {
    draw: (ctx: CanvasRenderingContext2D) => void;
    height: number;
    width: number;
    className?: string;
}) {
    let canvasRef = React.useRef<HTMLCanvasElement>(null);
    React.useEffect(() => {
        let canvas = canvasRef.current;
        if (canvas) {
            let ctx = canvas.getContext('2d');
            if (ctx && draw) {
                try {
                    draw(ctx);
                } catch (err) {
                    let error = ensureError(err);
                    toast.error(error.message);
                }
            }
        }
    }, [draw]);
    return <canvas className={className} ref={canvasRef} height={height} width={width} />
}