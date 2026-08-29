export async function onRequestGet({ env }) {
    const res = await fetch(
        `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=KusanagiAsami&api_key=${env.LASTFM_TOKEN}&format=json&limit=1`
    ).then(r => r.json());

    const track = res.recenttracks.track[0];
    const isPlaying = track['@attr']?.nowplaying === 'true';

    return new Response(JSON.stringify({
        isPlaying,
        title: track.name,
        artist: track.artist['#text'],
        album: track.album['#text'],
        image: track.image[2]['#text'], // medium size
        url: track.url,
    }), {
        headers: {
            'content-type': 'application/json',
            'cache-control': 'no-cache, no-store, must-revalidate, max-age=0'
        }
    });
}