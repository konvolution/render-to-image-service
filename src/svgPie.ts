// from https://github.com/marianc000/pieChart


import { getD } from './sector';

const colors = [
    "#e60049",
    "#0bb4ff",
    "#50e991",
    "#e6d800",
    "#9b19f5",
    "#ffa300",
    "#dc0ab4",
    "#b3d4ff",
    "#00bfa0",
    "#fd7f6f",
    "#7eb0d5",
    "#b2e061",
    "#bd7ebe",
    "#ffb55a",
    "#ffee65",
    "#beb9db",
    "#fdcce5",
    "#8bd3c7"
];

export function pie(radius: number, vals: number[]): string {

    let total = vals.reduce((a, b) => a + b, 0);

    const data = vals.map(val => ({ from: 0, to: 0, path: '', val, degrees: val / total * 360 }));

    data.forEach((o, i, ar) => {
        if (!i) {
            o.from = 0;
            o.to = o.degrees;
        } else {
            o.from = ar[i - 1].to;
            o.to = o.from + o.degrees;
        }
        o.path = path(getD(radius, o.from, o.to ), colors[i % colors.length]);
    });

    return svg(radius * 2, data.map(o => o.path).join(''));
}

function svg(width: number, content: string ): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${width}"><g style='stroke: white;stroke-width: 2px;'>${content}</g></svg>`;
}

function path(d: string, fillColor: string): string {
    return `<path d='${d}' fill='${fillColor}'/>`;
}