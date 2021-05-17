import interpolate from "../../utils/interpolate";

/**
 * Calculates the value of the 1-Dimensional Bezier curve defined with control points c for the given parameter f [0...1] using De Casteljau's algorithm.
 */
export function bezier(c0: number, c1: number, c2: number, f: number): number;

/**
 * Calculates the value of the 1-Dimensional Bezier curve defined with control points c for the given parameter f [0...1] using De Casteljau's algorithm.
 */
export function bezier(c0: number, c1: number, c2: number, c3: number, f: number): number;

/**
 * Calculates the value of the 1-Dimensional Bezier curve defined with control points c for the given parameter f [0...1] using De Casteljau's algorithm.
 */
export function bezier(c0: number, c1: number, c2: number, c3: number, c4: number, f: number): number;

/**
 * Calculates the value of the 1-Dimensional Bezier curve defined with control points c for the given parameter f [0...1] using De Casteljau's algorithm.
 */
export function bezier(c0: number, c1: number, c2: number, c3: number, c4: number, c5: number, f: number): number;

export function bezier(c0: number, c1: number, c2: number, c3: number, c4?: number, c5?: number, f?: number): number {
    switch (arguments.length) {
        case 7:
            return interpolate(bezier(c0, c1, c2, c3, c4, f), bezier(c1, c2, c3, c4, c5, f), f);

        case 6:
            f = c5;
            return interpolate(bezier(c0, c1, c2, c3, f), bezier(c1, c2, c3, c4, f), f);

        case 5:
            f = c4;
            return interpolate(bezier(c0, c1, c2, f), bezier(c1, c2, c3, f), f);

        case 4:
            f = c3;
            return interpolate(interpolate(c0, c1, f), interpolate(c1, c2, c3), f);
    }

}


// Stolen from the internet.

export function bezier2D(x1: number, y1: number, x2: number, y2: number, t: number): number {
    const duration = 1;
    const cx = 3 * x1;
    const bx = 3 * (x2 - x1) - cx;
    const ax = 1 - cx - bx;
    const cy = 3 * y1;
    const by = 3 * (y2 - y1) - cy;
    const ay = 1 - cy - by;

    return solve(ax, bx, cx, ay, by, cy, t, solveEpsilon(duration));
}

function sampleCurve(a: number, b: number, c: number, t: number): number {
    return ((a * t + b) * t + c) * t;
}

function sampleCurveDerivativeX(ax: number, bx: number, cx: number, t: number): number {
    return (3 * ax * t + 2 * bx) * t + cx;
}

function solveEpsilon(duration: number): number {
    return 1 / (200 * duration);
}

function solve(ax: number, bx: number, cx: number, ay: number, by: number, cy: number, x: number, epsilon: number): number {
    return sampleCurve(ay, by, cy, solveCurveX(ax, bx, cx, x, epsilon));
}

function solveCurveX(ax: number, bx: number, cx: number, x: number, epsilon: number): number {
    let t0: number;
    let t1: number;
    let t2: number;
    let x2: number;
    let d2: number;

    for (let t2 = x, i = 0; i < 8; i++) {
        x2 = sampleCurve(ax, bx, cx, t2) - x;

        if (Math.abs(x2) < epsilon) {
            return t2;
        }

        d2 = sampleCurveDerivativeX(ax, bx, cx, t2);

        if (Math.abs(d2) < 1e-6) {
            break;
        }

        t2 = t2 - x2 / d2;
    }

    t0 = 0;
    t1 = 1;
    t2 = x;

    if (t2 < t0) {
        return t0;
    }

    if (t2 > t1) {
        return t1;
    }

    while (t0 < t1) {
        x2 = sampleCurve(ax, bx, cx, t2);

        if (Math.abs(x2 - x) < epsilon) {
            return t2;
        }

        if (x > x2) {
            t0 = t2;
        } else {
            t1 = t2;
        }

        t2 = (t1 - t0) * 0.5 + t0;
    }

    return t2;
}