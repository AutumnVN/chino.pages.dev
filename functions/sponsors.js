const usernameRulesRe = /clyde|discord|everyone|here/gi;

export async function onRequest({ request, env }) {
    if (request.method !== 'POST') {
        return textResponse('only POST is supported', 405);
    }

    const signature = request.headers.get('x-hub-signature-256');
    if (!signature) {
        return textResponse('Missing X-Hub-Signature-256', 403);
    }

    const bodyBytes = await request.arrayBuffer();

    if (!await verifySignature(bodyBytes, signature, env.SPONSORS_SECRET)) {
        return textResponse('Wrong signature', 403);
    }

    let event;
    try {
        event = JSON.parse(new TextDecoder().decode(bodyBytes));
    } catch (err) {
        console.error('Failed to parse request body', err);
        return textResponse('Failed to parse request body', 400);
    }

    const { sponsor, tier } = event.sponsorship;
    const priceInDollar = tier.monthly_price_in_dollars;
    const sponsorType = tier.is_one_time ? 'one time' : 'per month';
    const sponsorUserLink = `[${sponsor.login}](<${sponsor.html_url}>)`;

    const message = {};
    if (sponsor.avatar_url) {
        message.avatar_url = sponsor.avatar_url;
    }
    if (sponsor.login) {
        message.username = sponsor.login;
    }

    switch (event.action) {
        case 'created':
            message.content = `New ${priceInDollar}$ ${sponsorType} sponsor: ${sponsorUserLink}`;
            break;
        case 'cancelled':
            message.content = `${sponsorUserLink} cancelled their ${priceInDollar}$ ${sponsorType} sponsorship`;
            break;
        case 'pending_cancellation': {
            const timestamp = Math.floor(new Date(event.effective_date).getTime() / 1000);
            message.content = `${sponsorUserLink} scheduled a cancellation for their ${priceInDollar}$ ${sponsorType} sponsorship. Will take effect <t:${timestamp}> (<t:${timestamp}:R>)`;
            break;
        }
        case 'tier_changed': {
            const { tier: previous } = event.changes;
            const oldPriceInDollar = previous.from.monthly_price_in_dollars;
            const oldSponsorType = previous.from.is_one_time ? 'one time' : 'per month';
            message.content = `${sponsorUserLink} changed their tier from ${oldPriceInDollar}$ ${oldSponsorType} to ${priceInDollar}$ ${sponsorType}`;
            break;
        }
        case 'pending_tier_change': {
            const { tier: previous } = event.changes;
            const oldPriceInDollar = previous.from.monthly_price_in_dollars;
            const oldSponsorType = previous.from.is_one_time ? 'one time' : 'per month';
            const timestamp = Math.floor(new Date(event.effective_date).getTime() / 1000);
            message.content = `${sponsorUserLink} scheduled a change of their tier from ${oldPriceInDollar}$ ${oldSponsorType} to ${priceInDollar}$ ${sponsorType}. Will take effect at <t:${timestamp}> (<t:${timestamp}:R>)`;
            break;
        }
        default:
            return textResponse('Ok', 200);
    }

    if (!await sendWebhook(message, env)) {
        return textResponse('Failed to execute webhook', 502);
    }

    return textResponse('Ok', 200);
}

async function sendWebhook(message, env) {
    message.allowed_mentions = { parse: [] };

    if (message.username) {
        message.username = message.username.replace(usernameRulesRe, '[banned]').slice(0, 80);
    }

    try {
        const res = await fetch(env.SPONSORS_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(message)
        });

        return res.ok;
    } catch (err) {
        console.error('Failed to post to webhook', err);
        return false;
    }
}

async function verifySignature(bodyBytes, signature, secret) {
    const prefix = 'sha256=';
    if (!signature.startsWith(prefix)) {
        return false;
    }

    const macHex = signature.slice(prefix.length);
    if (!/^[0-9a-f]{64}$/i.test(macHex)) {
        return false;
    }

    const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
    );

    return crypto.subtle.verify(
        'HMAC',
        key,
        Uint8Array.from(macHex.match(/../g), byte => parseInt(byte, 16)),
        bodyBytes
    );
}

function textResponse(body, status) {
    return new Response(`${body}\n`, { status });
}
