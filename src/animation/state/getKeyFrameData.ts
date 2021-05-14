import { IAnimation, IMainlineKeyFrame } from "../../file/ISpriterFile";
import { IBoneState, ISpriteState } from "./IAnimatorState";

/**
 * Retrieves the data that represents the state of the animation on the supplied key frame/
 *
 * @export
 * @param {IAnimation} animation the animation to process.
 * @param {IMainlineKeyFrame} keyFrame the key frame info.
 * @returns {IFrame}
 */
export default function getKeyFrameData(animation: IAnimation, keyFrame: IMainlineKeyFrame): IFrame {
    let bones = [], sprites = [];

    let i = keyFrame.bone_ref.length;

    while (i-- > 0) {
        const ref = keyFrame.bone_ref[i];
        const timeline = animation.timeline[ref.timeline];

        bones[i] = {
            ...timeline.key[ref.key].bone,
            parent: ref.parent,
        };
    }

    i = keyFrame.object_ref.length;

    while (i-- > 0) {
        const ref = keyFrame.object_ref[i];
        const timeline = animation.timeline[ref.timeline];

        sprites[i] = {
            ...timeline.key[ref.key].object,
            parent: ref.parent,
        };
    }

    return { bones, sprites };
}

interface IFrame {
    bones: IBoneState[];
    sprites: ISpriteState[];
}