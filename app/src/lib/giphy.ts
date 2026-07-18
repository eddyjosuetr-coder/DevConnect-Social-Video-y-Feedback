const KEY = (import.meta.env.VITE_GIPHY_API_KEY as string | undefined) || 'dc6zaTOxFJmzC';
const BASE = 'https://api.giphy.com/v1/gifs';

export interface GifItem {
  id: string;
  title: string;
  previewUrl: string;
  url: string;
}

function parse(raw: unknown[]): GifItem[] {
  return (raw as Array<{
    id: string;
    title: string;
    images: {
      fixed_height: { url: string };
      downsized_large: { url: string };
    };
  }>).map((g) => ({
    id: g.id,
    title: g.title,
    previewUrl: g.images.fixed_height.url,
    url: g.images.downsized_large?.url ?? g.images.fixed_height.url,
  }));
}

export async function fetchTrending(limit = 24): Promise<GifItem[]> {
  const res = await fetch(`${BASE}/trending?api_key=${KEY}&limit=${limit}&rating=g`);
  if (!res.ok) throw new Error('Error al cargar GIFs');
  const json = await res.json() as { data: unknown[] };
  return parse(json.data);
}

export async function searchGifs(query: string, limit = 24): Promise<GifItem[]> {
  const res = await fetch(
    `${BASE}/search?api_key=${KEY}&q=${encodeURIComponent(query)}&limit=${limit}&rating=g`
  );
  if (!res.ok) throw new Error('Error al buscar GIFs');
  const json = await res.json() as { data: unknown[] };
  return parse(json.data);
}
