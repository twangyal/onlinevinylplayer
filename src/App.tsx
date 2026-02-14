import { useRef, useState } from "react";
import { AudioEngine } from "./audio/AudioEngine"
import { createVinyl } from "./factories/createVinyl";
import type { Track } from "./model/Track";
import type { Metadata } from "./model/Metadata";
import type { Vinyl } from "./model/Vinyl";
import { VinylPlayer } from "./audio/VinylPlayer";

function App() {
  const engine = useRef(new AudioEngine());
  const vinylPlayer = useRef(new VinylPlayer(engine.current));
  const [currAudio, setCurrAudio] = useState<AudioBuffer|null>(null);
  const [currFileName, setCurrFileName] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [metadatas, setMetadatas] = useState<Metadata[]>([]);
  const [vinyls, setVinyls] = useState<Vinyl[]>([]); // Changed to state variable
  const trackIdCounter = useRef(1); // Counter for generating unique vinyl IDs
  const [Pause, setPause] = useState(true)
  
  const addTrack = () => {
    console.log("Adding track with name: ", currFileName);
    const newTrack = { buffer: currAudio as AudioBuffer, gain: 1 };
    const newMetadata = { id: trackIdCounter.current, length: (currAudio as AudioBuffer).duration, name: currFileName };
    trackIdCounter.current = trackIdCounter.current + 1; // Increment counter for next track
    
    setTracks(prevTracks => [...prevTracks, newTrack]); // Update tracks state
    setMetadatas(prevMetadatas => [...prevMetadatas, newMetadata]); // Update metadatas state
  }

  const createNewVinyl = () => {
    const newVinyl = createVinyl(tracks, metadatas);
    // Add to queues
    vinylPlayer.current.addToQueue(newVinyl);
    setVinyls(prevVinyls => [...prevVinyls, newVinyl]);
    // Reset states for next vinyl creation
    trackIdCounter.current = 1; 
    setTracks([]);
    setMetadatas([]);
  }

  return (
    <>
      <input
        type="file"
        onChange={async e => {
          const file = e.target.files![0];
          const audio = await engine.current.loadAudio(file);
          setCurrAudio(audio);
          setCurrFileName(file.name);
        }}
      />
      <button onClick={() => addTrack()}>Add Track</button>
      <button onClick={() => createNewVinyl()}>Create Vinyl</button>
      <button onClick={() => {
        vinylPlayer.current.pauseAndPlayTrack();
        setPause(!Pause);
      }}>{Pause ? "Play" : "Pause"}</button>
      <button onClick={() => vinylPlayer.current.playPrevTrack()}>Previous</button>
      <button onClick={() => {if(vinylPlayer.current.playNextTrack()){setPause(true)}}}>Skip</button>

      <h2>Vinyls</h2>
      <ul>
        {vinyls.map(vinyl => (
          <li key={vinyl.id as string}>
            Vinyl ID: {vinyl.id}, Number of Tracks: {vinyl.numberOfTracks}
            <ul>
              {vinyl.tracks[1].map(metadata => (
                <li key={metadata.id}>{metadata.id} {metadata.name}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

    </>
  )
}

export default App