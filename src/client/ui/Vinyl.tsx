import { useRef, useEffect } from "react";

    // 1. Define the input data structure
interface Track {
    title: string;
    duration: number; // in seconds
}

    // Example Data: Side A has 4 songs of different lengths
const SIDE_A_TRACKS: Track[] = [
    { title: "Intro", duration: 120 },      // Short (2 min)
    { title: "The Hit", duration: 240 },    // Long (4 min)
    { title: "Ballad", duration: 180 },     // Medium (3 min)
    { title: "Outro", duration: 300 },      // Very Long (5 min)
];

export function SpinningVinyl({ tracks = SIDE_A_TRACKS }: { tracks?: Track[] }) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const rotationRef = useRef(0);
    const animationRef = useRef<number>();
    // Constants must match what is drawn
    const WIDTH = canvasRef.current?.width;
    const HEIGHT = canvasRef.current?.height;
    const CENTER_X = WIDTH ? WIDTH / 2 : 0;
    const CENTER_Y = HEIGHT ? HEIGHT / 2 : 0;
    const OUTER_RADIUS = 360;
    const LABEL_RADIUS = 100;
    // --- THE CLICK FUNCTION ---
    const handleVinylClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();

        // 1. Calculate Scale Factors
        // This maps the "CSS size" (what you see) to the "Canvas size" (actual pixels)
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        // 2. Get accurate mouse position
        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;

        // 3. Define Center/Radius dynamically (don't rely on outer constants)
        const currentCenterX = canvas.width / 2;
        const currentCenterY = canvas.height / 2;
        const currentOuterRadius = 357; 
        const currentLabelRadius = 103;

        // 4. Calculate distance from center
        const dx = x - currentCenterX;
        const dy = y - currentCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 5. Filter valid clicks
        if (distance > currentOuterRadius) {
            console.log("Clicked outside record");
            return;
        }
        if (distance < currentLabelRadius) {
            console.log("Clicked on label");
            return;
        }

        // 6. Calculate Percentage
        const playableWidth = currentOuterRadius - currentLabelRadius;
        const distanceInward = currentOuterRadius - distance;
        const percentage = distanceInward / playableWidth;

        console.log(`Playback Position: ${(percentage * 100).toFixed(1)}%`);

        return percentage;
    };
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const outerRadius = 360;
        const labelRadius = 100; 

        // 2. Pre-calculate total duration to normalize spacing
        const totalDuration = tracks.reduce((acc, track) => acc + track.duration, 0);
        const playableWidth = (outerRadius - 5) - labelRadius;

        function draw() {
            if (!ctx) return;
            ctx.clearRect(0, 0, width, height);
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(rotationRef.current);
            ctx.translate(-centerX, -centerY);

            // Draw Base Vinyl
            ctx.fillStyle = "#050505";
            ctx.beginPath();
            ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
            ctx.fill();

            // Draw Fine Texture
            ctx.strokeStyle = "#222";
            ctx.lineWidth = 0.5;
            for (let r = outerRadius - 5; r > labelRadius; r -= 1.5) {
                ctx.beginPath();
                ctx.arc(centerX, centerY, r, 0, 2 * Math.PI);
                ctx.stroke();
            }

            // --- NEW LOGIC: Dynamic Grooves based on Duration ---
            ctx.strokeStyle = "#000"; // Deep groove color
            ctx.lineWidth = 3;

            let currentDuration = 0;

            // We loop through all tracks except the last one 
            // (because the last song ends at the label, no divider needed there)
            for (let i = 0; i < tracks.length - 1; i++) {
                // Add this song's length to the running total
                currentDuration += tracks[i].duration;

                // Calculate percentage of the record used
                const percentage = currentDuration / totalDuration;

                // Determine radius: 
                // We start at outerRadius and move inward by the percentage of playableWidth
                const grooveRadius = (outerRadius - 5) - (playableWidth * percentage);

                ctx.beginPath();
                ctx.arc(centerX, centerY, grooveRadius, 0, 2 * Math.PI);
                ctx.stroke();
            }
            // ----------------------------------------------------

            // Draw Label
            ctx.fillStyle = "orange";
            ctx.beginPath();
            ctx.arc(centerX, centerY, labelRadius, 0, 2 * Math.PI);
            ctx.fill();

            // Draw Text
            ctx.fillStyle = "black";
            ctx.font = "bold 14px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("SIDE A", centerX, centerY - 15);

            // Dynamic Track Count Display
            ctx.font = "10px Arial";
            ctx.fillText(`${tracks.length} TRACKS`, centerX, centerY + 15);

            // Center Hole
            ctx.fillStyle = "#fff";
            ctx.beginPath();
            ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
            ctx.fill();

            ctx.restore();
            rotationRef.current += 0.058;
            animationRef.current = requestAnimationFrame(draw);
        }
        draw();

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [tracks]); // Re-run if tracks change

    return <canvas ref={canvasRef} width={800} height={800} onClick={handleVinylClick} style={{ border: "1px solid black" }} />;
    }