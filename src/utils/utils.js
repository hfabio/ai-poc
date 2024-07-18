/* eslint-disable getter-return */
/* eslint-disable no-unsafe-finally */
import { knownGestures, gestureStrings } from './gesture';

function supportsWorkerType() {
  let supports = false;
  const tester = {
    get type() {
      supports = true;
    },
  };
  try {
    // tenta criar um worker em background checando se tem acesso a propriedade de tipo (só suportada quando tem o tipo módulo tb)
    new Worker('blob://', tester).terminate();
  } finally {
    return supports;
  }
}

const fingerLookupIndexes = {
  thumb: [0, 1, 2, 3, 4],
  indexFinger: [0, 5, 6, 7, 8],
  middleFinger: [0, 9, 10, 11, 12],
  ringFinger: [0, 13, 14, 15, 16],
  pinky: [0, 17, 18, 19, 20],
};

export {
  supportsWorkerType,
  fingerLookupIndexes,
  knownGestures,
  gestureStrings
};