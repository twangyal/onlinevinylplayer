import { SpinningVinyl } from "./Vinyl";
import { Tonearm } from "./Tonearm";
import { useEffect, useRef, useState } from "react";
import { Metadata } from "@/src/model/Metadata";



//  title, tracks, playing, setPlaying
export function VinylPlayer({ title, tracks, handleClick, active, playing, setPlaying, getProgress, isSwitching }: 
  { title?: string, 
    tracks: Metadata[], 
    handleClick?: (positionPercentage: number) => void, 
    active?: boolean, 
    playing?: boolean, 
    setPlaying?: (playing: boolean) => void,
    getProgress?: () => number,
    isSwitching?: boolean
  }) {

    const [onOrOff, setOnOrOff] = useState(false)
      
  return (
    <div style={{
      position: 'relative',
      width: '90%',
      aspectRatio: '1 / 1',
      containerType: 'inline-size',
      background: 'linear-gradient(135deg, #686868 0%, #5a5a5a 25%, #797777 40%, #807f7f 60%, #9f9b9b 80%, #a9a9a9 100%)',
      borderRadius: '24px',
      padding: '40px',
      boxShadow: `
      inset 2px 2px 5px rgba(255,255,255,0.9), 
      inset -3px -3px 10px rgba(0,0,0,0.15), 
      10px 15px 35px rgba(0,0,0,0.15)
      `,
      border: '4px solid #9f9f9f',
      backgroundImage: ` 
              linear-gradient(135deg, #d9d9d9, #a7a7a7, #4b4b4b)`,
      backgroundOrigin: 'border-box',
      backgroundClip: 'padding-box, border-box',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: 'auto'
    }}>
      
      {/* 3. Metallic Platter Outer Ring */}
      <div style={{
        position: 'absolute',
        width: '80%',
        aspectRatio: '1 / 1',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #6a6868, #f5f5f5)',
        boxShadow: '0 4px 10px rgba(0,0,0,0.2), inset 1px 1px 3px rgba(255,255,255,0.8), inset -1px -1px 4px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Dark Platter Pit (Where the record actually sits) */}
        <div style={{
          width: '95%',
          aspectRatio: '1 / 1',
          borderRadius: '50%',
          backgroundColor: '#111',
          boxShadow: 'inset 0 5px 20px rgba(0,0,0,0.8), 0 1px 2px rgba(255,255,255,0.3)'
        }} />
      </div>

      {/* The Vinyl Component */}
      { active &&
      <div style={{ 
        zIndex: 2, 
        width: '98%',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isSwitching ? 'translateY(-150%) scale(0.8)' : 'translateY(0) scale(1)',
        opacity: isSwitching ? 0 : 1
      }}>
        <SpinningVinyl 
          title={title} 
          tracks={tracks} 
          active={playing}
          playing={playing} 
        />
      </div>}

      {/* Silver Center Spindle */}
      <div style={{
        position: 'absolute',
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, #ffffff, #b9b9b9)',
        zIndex: 5,
        boxShadow: '0 3px 6px rgba(0,0,0,0.6)'
      }} />

      {/* Tonearm */}
      <Tonearm 
        tracks={tracks}
        playing={playing || false} 
        setPlaying={setPlaying || (() => {})} 
        getProgress={getProgress}
        onPositionChange={handleClick} 
      />

      {/* Metallic Play/Stop Button */}
      <div style={{
        position: 'absolute',
        bottom: '5%',
        left: '5%',
        display: 'flex',
        alignItems: 'center',
        gap: '2.5cqi'
      }}>
        <div style={{
          width: '2cqi',
          height: '2cqi',
          borderRadius: '50%',
          backgroundColor: playing ? '#15ff00' : '#444',
          boxShadow: playing ? '0 0 2cqi #51ff00, inset 0 0.3cqi 0.6cqi rgba(0,0,0,0.5)' : 'inset 0 0.3cqi 0.6cqi rgba(0,0,0,0.5)',
          border: '0.3cqi solid #ccc',
          transition: 'all 0.3s'
        }} />
        <button 
          onClick={() => setPlaying?.(!playing)}
          style={{
            padding: '1.5cqi 3.5cqi',
            borderRadius: '1cqi',
            border: '0.2cqi solid #999',
            background: !playing ? 'linear-gradient(to bottom, #f0f0f0, #c0c0c0)' : 'linear-gradient(to bottom, #d2d1d1, #b7b6b6)',
            color: '#333',
            cursor: 'pointer',
            fontSize: '2.5cqi',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.2cqi',
            boxShadow: '0 0.3cqi 0.8cqi rgba(0,0,0,0.2), inset 0 0.2cqi 0 rgba(255,255,255,0.8)',
            textShadow: '0 0.2cqi 0 rgba(255,255,255,0.5)',
            userSelect: 'none',
            pointerEvents: 'auto',
            zIndex: 10
          }}
        >
          Play
        </button>
      </div>
    </div>
  );
}