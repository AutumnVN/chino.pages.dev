export async function onRequestGet({ env, waitUntil }) {
    const value = + await env.COUNT.get('count') + 1 || 1;

    waitUntil(env.COUNT.put('count', value));

    return new Response(generateSvg(String(value).padStart(7, '0')), {
        headers: {
            'content-type': 'image/svg+xml',
            'cache-control': 'no-cache, no-store, must-revalidate, max-age=0'
        }
    });
}

function generateSvg(str) {
    const font = 24;
    const size = 29;
    const margin = 32;
    let text = '';

    for (let i = 0; i < str.length; i++) {
        text += `<rect x="${i * margin}" y="0.5"/><text><tspan x="${i * margin + 7}" y="22">${str[i]}</tspan></text>`;
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${margin * str.length}" height="30"><style>rect {fill: #000;width: ${size}px;height: ${size}px;}text {font: ${font}px Courier;fill: #0f1;}</style><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">${text}</g></svg>`;
}
