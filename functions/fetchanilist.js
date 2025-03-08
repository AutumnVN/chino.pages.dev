export async function onRequestGet({ request, waitUntil }) {
    let res = await caches.default.match(request.url);

    if (res) {
        res = await res.json();
        waitUntil(updateCache(request.url));
    } else {
        res = await fetchData();
        waitUntil(updateCache(request.url, res));
    }

    return new Response(JSON.stringify(res), {
        headers: {
            'content-type': 'application/json',
            'cache-control': 'no-cache, no-store, must-revalidate, max-age=0'
        }
    });
}

async function fetchData() {
    const query = `query {
        Page(page: 1, perPage: 4) {
            activities(userId: 6851565, sort: ID_DESC) {
                ... on ListActivity {
                    createdAt
                    status
                    progress
                    media {
                        coverImage {
                            medium
                        }
                        title {
                            english
                            romaji
                        }
                        siteUrl
                    }
                }
            }
        }
    }`;

    const { data } = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query })
    }).then(r => r.json());

    return data.Page.activities.map(i => ([
        i.media.siteUrl,
        i.media.coverImage.medium,
        `${i.status}${i.progress ? ` ${i.progress}` : ''}`.charAt(0).toUpperCase() + `${i.status}${i.progress ? ` ${i.progress}` : ''}`.slice(1),
        i.media.title.english || i.media.title.romaji,
        i.createdAt
    ]));
}

async function updateCache(url, data = null) {
    if (!data) {
        data = await fetchData();
    }
    await caches.default.put(url, new Response(JSON.stringify(data), {
        headers: {
            'content-type': 'application/json',
            'cache-control': 'public, max-age=3600'
        }
    }));
}
