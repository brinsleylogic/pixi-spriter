import ISpriterFile from "./ISpriterFile";

/**
 * Parses the supplied Spriter file data and returns the result.
 *
 * @export
 * @param {string} jsonString The file data to process.
 * @returns {ISpriterFile}
 */
export default function parseScon(jsonString: string, engine?: string): ISpriterFile {
    const data: ISpriterFile = JSON.parse(jsonString, (key, value) => {
        if (value === "false") {
            return false;
        }

        if (value === "true") {
            return true;
        }

        if (key === "z_index") {
            return Number(value);
        }

        if (key === "timeline" && typeof value === "string") {
            return Number(value);
        }

        if (engine === "pixi") {
            switch (key) {
                case "angle":
                case "y":
                case "scale_y":
                    return -value;

                case "pivot_y":
                    return 1 - value;

                default:
                    break;
            }
        }

        return value;
    });

    process(data);

    return data;
}

/**
 * Normalises data in to a consistent format.
 *
 * @param {ISpriterFile} data The data to process.
 */
function process(data: ISpriterFile): void {
    data.entity.forEach((entity) => {
        entity.animation.forEach((anim) => {
            anim.timeline.forEach((timeline) => {
                timeline.key.sort(sortFrames);
            });

            anim.soundline?.forEach((timeline) => {
                timeline.key.sort(sortFrames);
            });

            anim.eventline?.forEach((timeline) => {
                timeline.key.sort(sortFrames);
            });

            anim.mainline.key.sort(sortFrames);

            anim.mainline.key.forEach((frame) => {
                frame.bone_ref.forEach((ref) => {
                    const timeline = anim.timeline[ref.timeline];
                    const bone = timeline.key[ref.key].bone;
                    bone.id = ref.id;
                });

                frame.object_ref.forEach((ref) => {
                    const timeline = anim.timeline[ref.timeline];
                    const obj = timeline.key[ref.key].object;

                    obj.id = ref.id;
                    obj.z_index = ref.z_index;
                });
            })
        });
    });
}

/**
 * Frame sorting function.
 *
 * @returns {number}
 */
function sortFrames(a: { time: number }, b: { time: number }): number {
    if (a.time == null) {
        a.time = 0;
        return -1;
    }

    if (b.time == null) {
        b.time = 0;
        return 1;
    }

    return a.time - b.time;
}