export async function onRequestGet() {
    const max = 400;
    return new Response(await fetch(`https://raw.githubusercontent.com/Pantherasami/elaina.webp/main/${Math.ceil(Math.random() * max)}.webp`).then(r => r.blob()), {
        headers: {
            'content-type': 'image/webp',
            'cache-control': 'no-cache, no-store, must-revalidate, max-age=0'
        }
    });
}
