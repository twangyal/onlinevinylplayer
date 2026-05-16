import { Metadata } from '@/src/model/Metadata';
import { get } from 'http';
import React, { useState, useRef, useEffect, useCallback, use } from 'react';

export function getVinylPosition(angle: number): number {
  const outerEdge = 12;
  const innerEdge = 35;
  if (angle < outerEdge) return 0;
  if (angle > innerEdge) return 1;

  const result = (angle - outerEdge) / (innerEdge - outerEdge);
  console.log("Calculated vinyl position from angle:", angle, "->", result);
  return result;
}
export function getAngleFromPosition(position: number): number {
  const outerEdge = 12;
  const innerEdge = 35;
  if (position <= 0) return outerEdge;
  if (position >= 1) return innerEdge;
  return outerEdge + position * (innerEdge - outerEdge);
}

export function Tonearm({ tracks, playing, setPlaying, getProgress, onPositionChange }: { tracks: Metadata[], playing: boolean, setPlaying: (p: boolean) => void, getProgress?: () => number, onPositionChange?: (pos: number) => void }) {
  const armRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [angle, setAngle] = useState(-5);
  const [totalDuration, setTotalDuration] = useState(0);
  const currentTimeRef = useRef(0);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    // Stop the loop if we aren't playing, or if the user is dragging the arm
    if (!playing || isDragging) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      
      // Optional: Reset to rest position if stopped and progress is 0
      if (!playing && !isDragging && getProgress && getProgress() === 0) {
        setAngle(-5);
      }
      return;
    }

    const animate = () => {
      const currentProgress = getProgress?.();
      
      // Convert to angle and update state
      if (currentProgress == null) return;
      const newAngle = getAngleFromPosition(currentProgress);
      setAngle(newAngle);
      
      // Loop for the next frame
      animationRef.current = requestAnimationFrame(animate);
    };

    // Start the loop
    animationRef.current = requestAnimationFrame(animate);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [playing, isDragging, getProgress]);


  useEffect(() => {
    const totalDuration = tracks.reduce((acc, track) => acc + (track.duration || 0), 0);
    setTotalDuration(totalDuration);
  }, [tracks]);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isDragging || !armRef.current) return;
    
    // Get the pivot point from the unrotated wrapper element
    const rect = armRef.current.getBoundingClientRect();
    const pivotX = rect.left + rect.width / 2;
    const pivotY = rect.top; 
    
    // Calculate cursor distance from pivot
    const dx = e.clientX - pivotX;
    const dy = e.clientY - pivotY;
    
    // Trigonometry to find the angle in degrees
    let newAngle = Math.atan2(dy, dx) * (180 / Math.PI) - 90;
    
    // Clamp the arm swing between -5° (rest) and 50° (center of vinyl)
    const clampedAngle = Math.max(-5, Math.min(newAngle, 50));
    setAngle(clampedAngle);
  }, [isDragging]);

  const handlePointerUp = useCallback(() => {
    console.log("Pointer up, final angle:", angle);
    if (isDragging) {
      setIsDragging(false);
      if (onPositionChange) {
        const position = getVinylPosition(angle);
        console.log("Final vinyl position:", position);
        if (position === 0 || position === 1) {
          setPlaying(false);
        }
        onPositionChange(position);
      }
    }
  }, [isDragging, angle, onPositionChange]);

  // Attach global listeners during drag so the user doesn't lose the arm if they move the mouse fast
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, handlePointerMove, handlePointerUp]);

  return (
    <div 
      ref={armRef}
      style={{
        position: 'absolute',
        top: '10%',
        right: '3%',
        width: '8%',
        height: '50%', 
        zIndex: 20,
      }}
    >
      <div
        onPointerDown={(e) => {
          e.preventDefault(); 
          setIsDragging(true);
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          
          
          transition: (isDragging) ? 'none' : 'transform 0.2s ease-out',
          
          transformOrigin: 'top center',
          transform: `rotate(${angle}deg)`,
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none'
        }}
      >
        {/* Silver Pivot Base */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          left: '0%',
          width: '100%',
          height: '16%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #f5f5f5 0%, #a0a0a0 100%)',
          boxShadow: '0 5px 10px rgba(0,0,0,0.4), inset 0 2px 3px #fff',
          zIndex: 2,
          border: '1px solid #888'
        }} />

        {/* Silver Metallic Arm Body */}
        <div style={{
          width: '30%',
          height: '120%',
          background: 'linear-gradient(to right, #d4d4d4 0%, #ffffff 40%, #a9a9a9 100%)',
          borderRadius: '6px',
          margin: '0 auto',
          boxShadow: '5px 10px 15px rgba(0,0,0,0.3)',
          borderLeft: '1px solid rgba(255,255,255,0.8)',
          borderRight: '1px solid rgba(0,0,0,0.2)'
        }} />

        {/* Cartridge/Needle Head */}
        <div style={{
          position: 'absolute',
          bottom: '-30%',
          left: '15%',
          width: '70%',
          height: '20%',
          background: 'linear-gradient(135deg, #444, #111)',
          borderRadius: '4px',
          boxShadow: '3px 8px 12px rgba(0,0,0,0.5)',
          borderTop: '2px solid #666'
        }}>
           {/* Silver Stylus Hint */}
          <div style={{
              position: 'absolute',
              bottom: '-4px',
              left: '45%',
              width: '3px',
              height: '6px',
              backgroundColor: '#ddd',
              borderRadius: '2px'
            }} />
        </div>
      </div>
    </div>
  );
}