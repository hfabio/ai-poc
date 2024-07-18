import { useRef } from 'react';

import HandController from '../controllers/hand.js';
import HandGestureView from '../view/hand';
import handGestureService from '../service/hands';
import {
  fingerLookupIndexes,
  gestureStrings,
  knownGestures,
} from '../utils/utils.js';

import Camera from '../utils/camera.js';
const camera = Camera.init();

const fingerPose = window.fp;
const handPoseDetection = window.handPoseDetection;
const handsVersion = window.VERSION;

// eslint-disable-next-line no-undef
const styler = new PseudoStyler();

export const useHandGesture = () => {
  const gestureController = useRef(null);
  const isInitiated = !!gestureController?.current;

  const initialize = async (canvasRef, retries=5) => {
    if(!canvasRef.current || gestureController?.current) return;
    try {
      console.log({canvasRef, gestureController})
      gestureController.current = await HandController.initialize({
        camera,
        view: new HandGestureView({ fingerLookupIndexes, styler, canvasRef }),
        service: new handGestureService({
          fingerLookupIndexes,
          fingerPose,
          handPoseDetection,
          handsVersion,
          gestureStrings,
          knownGestures,
        }),
      });
      console.log('hook initialized');
    } catch (error) {
      console.log('error initialize', error)
      if(retries === 0) throw error;
      await new Promise((resolve) => setTimeout(resolve, 200));
      return await initialize();
    }
  };

  return {
    controller: gestureController.current,
    isInitiated,
    initialize,
  };
};

export default useHandGesture;
