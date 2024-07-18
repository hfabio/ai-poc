import { useRef, useEffect, useState, useCallback } from 'react';
import './index.css';
import HandsWorker from '../../workers/hands?worker'
import Camera from '../../utils/camera.js';
const camera = Camera.init();
const worker = new HandsWorker({type: 'classic', name: 'hands'});

const Hands = () => {
  const handCanvasRef = useRef(null);
  const cameraCanvasRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  const getVideoFrame = (video) => {
    if (!cameraCanvasRef.current) return;
    const canvas = cameraCanvasRef.current;
    const ctx = canvas.getContext('2d', {willReadFrequently: true});
    const [width, height] = [video.videoWidth, video.videoHeight];
    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(video, 0, 0, width, height);
    return ctx.getImageData(0, 0, width, height);
  }

  const configureWorker = useCallback(() => {
    console.log('worker configured', worker);
    worker.onmessage = ({ data }) => {
      console.log('recebeu post message', data)
      if ('MODEL READY' === data) return setIsReady(true);
      console.log({data})
    };
  }, [setIsReady])

  const loop = useCallback(async () => {
    if(!worker.onmessage) configureWorker();
    const video = camera.video;
    const image = getVideoFrame(video);
    if (isReady){
      worker.postMessage(image);
    }

    const canvas = handCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    ctx?.clearRect(
      0,
      0,
      canvas?.width,
      canvas?.height
    );
    await new Promise((resolve) => setTimeout(resolve, 100));
    requestAnimationFrame(loop);
  }, [configureWorker, isReady])

  useEffect(() => {
    console.log('is ready', isReady);
  }, [isReady])
  useEffect(() => {
    if (handCanvasRef.current){
      const canvas = handCanvasRef.current;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      console.log('render');
    }
  }, [handCanvasRef])

  useEffect(() => {
    if(worker) configureWorker();
    requestAnimationFrame(loop);
    return () => cancelAnimationFrame(loop);
  }, [configureWorker, loop])

  return (
    <>
      <canvas className="handsCanvas" ref={handCanvasRef} />
      <canvas className="cameraCanvas" ref={cameraCanvasRef} />
    </>
  );
};

export default Hands;
