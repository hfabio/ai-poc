import { prepareRunChecker } from "../utils/runChecker";
// Calculate the position of eyelid to predict a blink
const getEuclideanDistance = (x1, y1, x2, y2) =>
  Math.sqrt(
    (x2 - x1) * (x2 - x1) +
    (y2 - y1) * (y2 - y1)
  );
const getEAR = (upper, lower) => {
  return (
    (getEuclideanDistance(upper[5][0], upper[5][1], lower[4][0], lower[4][1]) +
      getEuclideanDistance(
        upper[3][0],
        upper[3][1],
        lower[2][0],
        lower[2][1]
      )) /
    (2 *
      getEuclideanDistance(upper[0][0], upper[0][1], upper[8][0], upper[8][1]))
  );
};
const EAR_THRESHOLD = 0.15;
const { shouldRun } = prepareRunChecker({ timerDelay: 500 });
export const hasBlinked = async ({ model, video }) => {
  const predictions = await model.estimateFaces({
    input: video,
    returnTensors: false,
    flipHorizontal: true,
    predictIrises: true,
  });
  if (!predictions.length) return false;

  for (const prediction of predictions) {
    // Right eye parameters
    const lowerRight = prediction.annotations.rightEyeUpper0;
    const upperRight = prediction.annotations.rightEyeLower0;
    const rightEAR = getEAR(upperRight, lowerRight);
    // Left eye parameters
    const lowerLeft = prediction.annotations.leftEyeUpper0;
    const upperLeft = prediction.annotations.leftEyeLower0;
    const leftEAR = getEAR(upperLeft, lowerLeft);
    const blinked = leftEAR <= EAR_THRESHOLD && rightEAR <= EAR_THRESHOLD;
    const [left, right] = [leftEAR <= EAR_THRESHOLD, rightEAR <= EAR_THRESHOLD];
    if (!blinked && (left || right))
      console.log(`Piscou o olho ${left ? "esquerdo" : "direito"}`);
    if (shouldRun()) continue;
    return {blinked, left, right};
  }
  return false;
};
