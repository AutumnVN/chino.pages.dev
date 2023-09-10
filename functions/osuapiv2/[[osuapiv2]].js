export async function onRequestGet({ env, request }) {
    const { access_token } = await fetch('https://osu.ppy.sh/oauth/token', {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'content-Type': 'application/x-www-form-urlencoded',
        },
        body: `client_id=23616&client_secret=${env.OSU_CLIENT_SECRET}&grant_type=client_credentials&scope=public`
    }).then(res => res.json());

    const response = await fetch(`https://osu.ppy.sh/api/v2/${request.url.replace(/^.+?osuapiv2\//, '')}`, {
        headers: {
            'accept': 'application/json',
            'content-type': 'application/json',
            'authorization': `Bearer ${access_token}`
        },
        body: request.body
    });

    return new Response(await response.text(), {
        status: response.status,
        headers: response.headers
    });
}
