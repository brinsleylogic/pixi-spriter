import { IAnimation, IMainlineKeyFrame } from "../../file/IParsedFile";
import { IBoneState, ISpriteState } from "../IAnimatorState";

/**
 * Retrieves the data that represents the state of the animation on the supplied key frame/
 *
 * @export
 * @param {IAnimation} animation the animation to process.
 * @param {IMainlineKeyFrame} keyFrame the key frame info.
 * @returns {IFrame}
 */
export default function getKeyFrameData(animation: IAnimation, keyFrame: IMainlineKeyFrame): IFrame {
    let bones = [], sprites = [], points = [];

    let i = keyFrame.bone_ref.length;

    while (i-- > 0) {
        const ref = keyFrame.bone_ref[i];
        const timeline = animation.timeline[ref.timeline];

        bones[i] = {
            ...timeline.key[ref.key].bone,
            parent: ref.parent,
            timeline: ref.timeline,
        };
    }

    i = keyFrame.object_ref.length;

    while (i-- > 0) {
        const ref = keyFrame.object_ref[i];
        const timeline = animation.timeline[ref.timeline];

        const data = {
            ...timeline.key[ref.key].object,
            parent: ref.parent,
            timeline: ref.timeline,
        };

        if (timeline.object_type === "point") {
            points.push(data);
        } else {
            sprites.push(data);
        }
    }

    return { bones, sprites, points };
}

interface IFrame {
    bones: IBoneState[];
    sprites: ISpriteState[];
    points: ISpriteState[];
}