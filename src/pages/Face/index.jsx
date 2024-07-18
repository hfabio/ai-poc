import { useRef, useEffect, useState, useCallback } from "react";
import "./index.css";
import FaceWorker from "../../workers/face?worker"
import Camera from "../../utils/camera.js";
const camera = await Camera.init();
const worker = new FaceWorker();

const Face = () => {
  const canvasRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [blinkCounter, setBlinkCounter] = useState(0)

  const getVideoFrame = (video) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', {willReadFrequently: true});
    const [width, height] = [video.videoWidth, video.videoHeight];
    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(video, 0, 0, width, height);
    return ctx.getImageData(0, 0, width, height);
  }

  const configureWorker = useCallback(() => {
    console.log('worker configured');
    worker.onmessage = ({ data }) => {
      console.log('recebeu post message', data)
      if ("MODEL READY" === data) return setIsReady(true);
      const {blinked, left, right} = data;
      if (blinked) return setBlinkCounter((counter) => counter + 1);
      if (left) console.log('left eye dispatched from component');
      if (right) console.log('right eye dispatched from component');
    };
  }, [setBlinkCounter, setIsReady])

  const loop = useCallback(async () => {
    if(!worker.onmessage) configureWorker();
    const video = camera.video;
    const image = getVideoFrame(video);
    if (isReady) worker.postMessage(image);
    await new Promise((resolve) => setTimeout(resolve, 100));
    requestAnimationFrame(loop);
  }, [configureWorker, isReady])

  useEffect(() => {
    console.log('is ready', isReady);
  }, [isReady])
  useEffect(() => {
    console.log('blink counter', blinkCounter);
  }, [blinkCounter])

  useEffect(() => {
    if(worker) configureWorker();
    requestAnimationFrame(loop);
    return () => cancelAnimationFrame(loop);
  }, [configureWorker, loop])

  return <canvas className="cameraCanvas" ref={canvasRef} />;
};

export default Face;
