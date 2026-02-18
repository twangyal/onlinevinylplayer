import { vinylRepositorySupabase } from "@/src/db/vinylRepoSupabase";
import { createSupabaseServerClient } from "@/src/db/serverClient";
import { notFound, redirect } from "next/navigation";

export default async function VinylDetailsPage({ params }: { params: { id: string } }) {
  const { id } = await params; 
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/play");

  try {
    const vinyl = await vinylRepositorySupabase.getTracks(id, user.id);
    
    return (
      <div style={{ padding: "2rem" }}>
        <h1>{vinyl.name}</h1>
        {vinyl.tracks[0].length === 0 ? (
          <p>No tracks found for this vinyl.</p>
        ) : (
        <ul>
          {vinyl.tracks[1].map((meta, index) => (
            console.log(typeof meta),
            <li key={index}>
              {meta.name}
            </li>
          ))}
        </ul>
        )}
      </div>
    );
  } catch (e) {
    notFound();
  }
}