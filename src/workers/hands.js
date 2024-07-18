import 'https://unpkg.com/@tensorflow/tfjs-core@4.2.0/dist/tf-core.min.js';
// import "https://unpkg.com/@tensorflow/tfjs-converter@4.2.0/dist/tf-converter.min.js";
import 'https://unpkg.com/@tensorflow/tfjs-backend-webgl@3.7.0/dist/tf-backend-webgl.min.js';
// import "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-cpu";
import 'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/hands.min.js';
import 'https://unpkg.com/@tensorflow-models/hand-pose-detection@2.0.0/dist/hand-pose-detection.min.js';
import 'https://cdn.jsdelivr.net/npm/fingerpose@0.1.0/dist/fingerpose.min.js';

const MODEL_BASE_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands';
import { knownGestures } from './hands.poses';
import { estimateHands } from './hands.utils';

const { VERSION, handPoseDetection, fp: fingerPose } = self;
const model = handPoseDetection.SupportedModels.MediaPipeHands;

const detectorConfig = {
  runtime: 'mediapipe', // outra opção é o tfjs
  // runtime: "tfjs",
  solutionPath: `${MODEL_BASE_URL}@${VERSION}`,
  modelType: 'lite', // "full" é mais pesado e o mais preciso, porém o lite atende bem
  // maxHands: 2,
};

const main = async () => {
  console.log('loading hands tf model');
  try {
    const detector = await handPoseDetection.createDetector(
      model,
      detectorConfig
    );
    const estimator = new fingerPose.GestureEstimator(knownGestures);
    console.log('hands tf model loaded');

    postMessage('MODEL READY');

    onmessage = async ({ data: video }) => {
      const hands = await estimateHands({
        video,
        detector,
        estimator,
        fingerPose,
      });
      if (!hands?.gestures?.length && !hands?.gestures?.length) return;
      postMessage(hands);
    };
  } catch (error) {
    console.log('error on worker', error);
    postMessage({ error });
    throw error;
  }
}

main()
