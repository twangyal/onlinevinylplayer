import React, { useState, useRef, useEffect, useCallback } from 'react';

export function Tonearm({ playing, setPlaying }: { playing: boolean, setPlaying: (p: boolean) => void }) {
  const armRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [angle, setAngle] = useState(0);

  // Sync angle with playing state when NOT dragging
  useEffect(() => {
    if (!isDragging) {
      
    }
  }, [playing, isDragging]);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isDragging || !armRef.current) return;
    
    // Get the pivot point (top-center of the element)
    const rect = armRef.current.getBoundingClientRect();
    const pivotX = rect.left + rect.width / 2;
    const pivotY = rect.top; 
    
    // Calculate cursor distance from pivot
    const dx = e.clientX - pivotX;
    const dy = e.clientY - pivotY;
    
    // Trigonometry to find the angle in degrees
    let newAngle = Math.atan2(dy, dx) * (180 / Math.PI) - 90;
    
    // Clamp the arm swing between -5° (rest) and 40° (center of vinyl)
    const clampedAngle = Math.max(-5, Math.min(newAngle, 50));
    setAngle(clampedAngle);
  }, [isDragging]);

  const handlePointerUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
    }
  }, [isDragging, angle, setPlaying]);

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
      onPointerDown={(e) => {
        e.preventDefault(); 
        setIsDragging(true);
      }}
      style={{
        position: 'absolute',
        top: '13%',
        right: '5%',
        width: '40px',
        height: '250px', 
        // Remove animation delay while dragging so it feels responsive instantly
        transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        transformOrigin: 'top center',
        transform: `rotate(${angle}deg)`,
        zIndex: 20,
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none' // Crucial: prevents mobile screen from scrolling while dragging
      }}
    >
      {/* Silver Pivot Base */}
      <div style={{
        position: 'absolute',
        top: '-15px',
        left: '0',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, #f5f5f5 0%, #a0a0a0 100%)',
        boxShadow: '0 5px 10px rgba(0,0,0,0.4), inset 0 2px 3px #fff',
        zIndex: 2,
        border: '1px solid #888'
      }} />

      {/* Silver Metallic Arm Body */}
      <div style={{
        width: '12px',
        height: '150%',
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
        bottom: '-150px',
        left: '2px',
        width: '35px',
        height: '60px',
        background: 'linear-gradient(135deg, #444, #111)',
        borderRadius: '4px',
        boxShadow: '3px 8px 12px rgba(0,0,0,0.5)',
        borderTop: '2px solid #666'
      }}>
         {/* Silver Stylus Hint */}
        <div style={{
            position: 'absolute',
            bottom: '-4px',
            left: '16px',
            width: '3px',
            height: '6px',
            backgroundColor: '#ddd',
            borderRadius: '2px'
          }} />
      </div>
    </div>
  );
}