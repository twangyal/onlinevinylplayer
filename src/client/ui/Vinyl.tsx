import { useRef, useEffect } from "react";

interface Track {
    title: string;
    duration: number; // Duration in seconds
}

    // Example Data
const SIDE_A_TRACKS: Track[] = [
    { title: "Intro", duration: 120 },      
    { title: "The Hit", duration: 240 },
    { title: "Ballad", duration: 180 }, 
    { title: "Outro", duration: 300 },
];

export function SpinningVinyl({ tracks = SIDE_A_TRACKS }: { tracks?: Track[] }) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const rotationRef = useRef(0);
    const animationRef = useRef<number>(0);

    const handleVinylClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();

        // Calculate Scale Factors
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        // Get mouse position
        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;

        // Define Center/Radius dynamically
        const currentCenterX = canvas.width / 2;
        const currentCenterY = canvas.height / 2;
        const currentOuterRadius = 385; 
        const currentLabelRadius = 103;

        // Calculate distance from center
        const dx = x - currentCenterX;
        const dy = y - currentCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Filter valid clicks
        if (distance > currentOuterRadius) {
            console.log("Clicked outside record");
            return;
        }
        if (distance < currentLabelRadius) {
            console.log("Clicked on label");
            return;
        }

        // Calculate Percentage of the Record Clicked
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
        const outerRadius = 390;
        const labelRadius = 100; 

        // Calculate total duration to normalize spacing
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

            // Dynamic Grooves based on Song Duration
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 3;

            let currentDuration = 0;

            for (let i = 0; i < tracks.length - 1; i++) {
                currentDuration += tracks[i].duration;

                const percentage = currentDuration / totalDuration;

                // Determine radius for this groove
                const grooveRadius = (outerRadius - 5) - (playableWidth * percentage);

                ctx.beginPath();
                ctx.arc(centerX, centerY, grooveRadius, 0, 2 * Math.PI);
                ctx.stroke();
            }

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
            ctx.arc(centerX, centerY, 7, 0, 2 * Math.PI);
            ctx.fill();

            // Restore context for next frame
            ctx.restore();

            // Rotate for next frame
            rotationRef.current += 0.058;
            animationRef.current = requestAnimationFrame(draw);
        }
        draw();

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [tracks]); // Re-run if tracks change

    return <canvas ref={canvasRef} width={900} height={900} onClick={handleVinylClick} style={{ border: "1px solid black" }} />;
    }