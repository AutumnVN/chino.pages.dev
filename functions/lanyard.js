export async function onRequestGet({ env, waitUntil }) {
    const value = Number((await env.COUNT.get('count')) || 0) + 1;

    const originSvg = await fetch('https://lanyard.cnrad.dev/api/393694671383166998?showDisplayName=true&bg=0d1117&idleMessage=https://chino.pages.dev').then(r => r.text());

    const newSvg = originSvg.replace(/( width=")410((px)?" )/g, '$1350$2')
        .replace(/width: 400px;/g, 'width: 340px;')
        .replace(/width: 279px;/, 'width: 219px;')
        .replace(/border: solid 0.5px #222;/, '$& object-fit: cover;')
        .replace(/height="210px">/, 'height="265px">')
        .replace(/<\/svg>/, generateCountSvg(String(value).padStart(7, '0')) + '$&');

    waitUntil(env.COUNT.put('count', value));

    return new Response(newSvg, {
        headers: {
            'content-type': 'image/svg+xml',
            'cache-control': 'no-cache, no-store, must-revalidate, max-age=0'
        }
    });
}

function generateCountSvg(str) {
    const y = 215;
    const font = 37;
    const size = 45;
    const margin = 50;
    let text = '';

    for (let i = 0; i < str.length; i++) {
        text += `<rect x="${i * margin}" y="0.5"/><text><tspan x="${i * margin + 11}" y="34">${str[i]}</tspan></text>`;
    }

    return `<g transform="translate(0,${y})"><style>rect {fill: #0d1117;width: ${size}px;height: ${size}px;}text {font: ${font}px Courier;fill: #0f1;}</style><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">${text}</g></g>`;
}
