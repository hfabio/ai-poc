import 'https://unpkg.com/@tensorflow/tfjs-core@2.4.0/dist/tf-core.js';
import 'https://unpkg.com/@tensorflow/tfjs-converter@2.4.0/dist/tf-converter.js';
import 'https://unpkg.com/@tensorflow/tfjs-backend-webgl@2.4.0/dist/tf-backend-webgl.js';
import 'https://unpkg.com/@tensorflow-models/face-landmarks-detection@0.0.1/dist/face-landmarks-detection.js';
import {hasBlinked} from './face.utils';

const { tf, faceLandmarksDetection } = self;
tf.setBackend('webgl');


console.log('loading face tf model');
const model = await faceLandmarksDetection.load(
  faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
  { maxFaces: 1 }
);
console.log('face tf model loaded');

postMessage('MODEL READY');

onmessage = async ({ data: video }) => {
  const blinked = await hasBlinked({video, model});
  if (!blinked?.blinked && !blinked?.left && !blinked?.right) return;
  postMessage(blinked);
};