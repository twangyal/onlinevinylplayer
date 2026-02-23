import { useRef, useEffect } from "react";
import { Metadata } from "@/src/model/Metadata";


const SIDE_A_TRACKS: Metadata[] = [
    { name: "Intro", duration: 120 },
    { name: "The Hit", duration: 240 },
    { name: "Ballad", duration: 180 },
    { name: "Outro", duration: 300 },
];

export function SpinningVinyl({ title, tracks = SIDE_A_TRACKS , handleClick, active = false, playing }: { title?: string, tracks: Metadata[], handleClick?: (positionPercentage: number) => void, active?: boolean, playing?: boolean }) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const rotationRef = useRef(0);
    const animationRef = useRef<number>(0);
    const playingRef = useRef(!!playing);

    useEffect(() => {
        playingRef.current = !!playing;
    }, [playing]);

    const getVinylDimensions = (width: number, height: number) => {
        const centerX = width / 2;
        const centerY = height / 2;
        const baseUnit = Math.min(width, height) / 2;
        
        return {
            centerX,
            centerY,
            outerRadius: baseUnit * 0.9,     
            labelRadius: baseUnit * 0.25,    
            holeRadius: baseUnit * 0.02,     
            grooveSpacing: baseUnit * 0.005
        };
    };

    const handleVinylClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!handleClick || !active) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Use rect dimensions (CSS pixels) for hit detection
        const { centerX, centerY, outerRadius, labelRadius } = getVinylDimensions(rect.width, rect.height);

        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > outerRadius || distance < labelRadius) return;

        const playableWidth = outerRadius - labelRadius;
        const distanceInward = outerRadius - distance;
        const percentage = distanceInward / playableWidth;

        console.log(`Playback Position: ${(percentage * 100).toFixed(1)}%`);
        if (handleClick) {
            handleClick(percentage.toFixed(3) as unknown as number);
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        
        const totalDuration = tracks.reduce((acc, track) => acc + (track.duration || 0), 0);

        const render = () => {
            // Handle high-DPI screens by scaling the canvas drawing buffer
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            
            // Set internal drawing buffer size
            if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
                canvas.width = rect.width * dpr;
                canvas.height = rect.height * dpr;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Calculate dimensions based on current canvas size
            const { centerX, centerY, outerRadius, labelRadius, holeRadius } = getVinylDimensions(canvas.width, canvas.height);
            const playableWidth = (outerRadius - 5) - labelRadius;

            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(rotationRef.current);
            ctx.translate(-centerX, -centerY);

            // Base vinyl color
            ctx.fillStyle = "#050505";
            ctx.beginPath();
            ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
            ctx.fill();

            // Grooves for visual texture
            ctx.strokeStyle = "#222";
            ctx.lineWidth = 0.5 * dpr;
            for (let r = outerRadius - 5; r > labelRadius; r -= 2 * dpr) {
                ctx.beginPath();
                ctx.arc(centerX, centerY, r, 0, 2 * Math.PI);
                ctx.stroke();
            }

            // Deep grooves for track separation
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 3 * dpr;
            let currentDuration = 0;
            for (let i = 0; i < tracks.length - 1; i++) {
                currentDuration += tracks[i]?.duration || 0;
                const percentage = currentDuration / totalDuration;
                const grooveRadius = (outerRadius - 5) - (playableWidth * percentage);
                ctx.beginPath();
                ctx.arc(centerX, centerY, grooveRadius, 0, 2 * Math.PI);
                ctx.stroke();
            }

            // Label Area
            ctx.fillStyle = "orange";
            ctx.beginPath();
            ctx.arc(centerX, centerY, labelRadius, 0, 2 * Math.PI);
            ctx.fill();

            // Text
            ctx.fillStyle = "black";
            ctx.font = `bold ${14 * (canvas.width / 900)}px Arial`;
            ctx.textAlign = "center";
            ctx.fillText(`${tracks.length} TRACKS`, centerX, centerY + 25);
            ctx.fillText(title || "Unknown Vinyl", centerX, centerY - (15 * (canvas.width / 900)));

            // Center hole
            ctx.fillStyle = "#fff";
            ctx.beginPath();
            ctx.arc(centerX, centerY, holeRadius, 0, 2 * Math.PI);
            ctx.fill();

            ctx.restore();

            if (playingRef.current) rotationRef.current += 0.03;
            animationRef.current = requestAnimationFrame(render);
        };

        render();

        return () => cancelAnimationFrame(animationRef.current);
    }, [tracks]);

    return (
        <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
            <canvas
                ref={canvasRef}
                onClick={handleVinylClick}
                style={{ 
                    width: "100%", 
                    height: "auto", 
                    aspectRatio: "1 / 1", 
                    display: "block",
                    cursor: "pointer"
                }}
            />
        </div>
    );
}