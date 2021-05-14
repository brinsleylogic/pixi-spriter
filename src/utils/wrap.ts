export default function wrap(value: number, boundA: number, boundB: number): number {
    const [min, max] = (boundA < boundB) ? [boundA, boundB] : [boundB, boundA];

    if (value < min) {
        return max - ((min - value) % (max - min));
    }

    return min + ((value - min) % (max - min));
}