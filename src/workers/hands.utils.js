import {gestureStrings} from './hands.poses';

const estimateGesture = async (gestureEstimator, keyPoints3d) => {
  const points = keyPoints3d.map(({ x, y, z }) => [x, y, z]);
  const predictions = await gestureEstimator.estimate(points, 9); // porcentagem de confiança do gesto (9 = 90%)
  return predictions.gestures;
}

const detectGestures = async ({predictions, gestureEstimator}) => {
  let gestures = [];
  let events = [];
  if (!predictions?.length) return {gestures, events};

  for (const hand of predictions) {
    if (!hand.keypoints3D) continue;
    const gestures = await estimateGesture(gestureEstimator, hand.keypoints3D);
    if (!gestures?.length) continue;
    const result = gestures.reduce((previous, current) =>
      previous.score > current.score ? previous : current
    );
    const { x, y } = hand.keypoints.find(
      ({ name }) => name === 'index_finger_tip'
    );

    events.push({ event: result.name, x, y });

    console.log(
      `detected ${gestureStrings[result.name]} on ${
        hand.handedness
      } hand`
    );
  }
  return {gestures, events};
};

export const estimateHands = async ({video, detector, estimator}) => {
  const hands = detector.estimateHands(video, {
    flipHorizontal: true,
  });
  return await detectGestures({
    predictions: hands,
    gestureEstimator: estimator
  });
}