/**
 * Returns the animation's key frames for the supplied time.
 *
 * @private
 * @param {IAnimation} animation The animation to get the frames for.
 * @param {number} time The time to fetch the frames for.
 * @returns {[IMainlineKeyFrame, IMainlineKeyFrame?]}
 * @memberof Animator
 */
export default function getKeyFrames<T extends IKeyFrame>(frames: T[], time: number, selected?: T): [T, T?] {
    let current = selected ?? frames[0];
    let iterations = 0;

    do {
        // Start time of frame is less than the time.
        if (current.time <= time) {
            // We're in the last frame.
            if (current.next == null) {
                return [current];

            // We're in the current frame.
            } else if (time < current.next.time || current.next === frames[0]) {
                return [current, current.next] as [T, T];
            }
        }

        current = current.next as T;

        if (++iterations === frames.length) {
            // console.log("Animator.getKeyFrames :: Broke loop.", frames, time);
            return;
        }
    }
    while (current.next);
}

/**
 * Defines the propertiesof a keyframe.
 *
 * @interface IKeyFrame
 */
interface IKeyFrame {
    time: number;

    next?: IKeyFrame;
}