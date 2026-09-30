import { useEffect, useState } from "react";
import { loadIsolatedAtlasFrames } from "../utils/spriteAtlas";

export default function useIsolatedAtlasFrames(atlas) {
  const [loaded, setLoaded] = useState(null);
  useEffect(() => {
    if (!atlas?.src) return undefined;
    let cancelled = false;
    loadIsolatedAtlasFrames(atlas).then((result) => {
      if (!cancelled) setLoaded({ atlas, ...result });
    }).catch((error) => {
      if (!cancelled) console.error("Sprite frame loading failed", error);
    });
    return () => { cancelled = true; };
  }, [atlas]);
  return loaded?.atlas === atlas ? loaded : null;
}
