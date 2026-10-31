import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';

// Mock ResizeObserver
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock AudioContext
class MockAudioContext {
  currentTime = 0;
  state = 'running';
  createOscillator() {
    return {
      type: 'sine',
      frequency: {
        setValueAtTime: () => {},
        exponentialRampToValueAtTime: () => {},
      },
      connect: () => {},
      start: () => {},
      stop: () => {},
    };
  }
  createGain() {
    return {
      gain: {
        setValueAtTime: () => {},
        exponentialRampToValueAtTime: () => {},
      },
      connect: () => {},
    };
  }
  destination = {};
  resume() {
    return Promise.resolve();
  }
}

(globalThis as any).AudioContext = MockAudioContext;
(globalThis as any).webkitAudioContext = MockAudioContext;

// Mock HTMLCanvasElement getContext
HTMLCanvasElement.prototype.getContext = function (contextType: string) {
  if (contextType === '2d') {
    return {
      clearRect: () => {},
      fillRect: () => {},
      strokeRect: () => {},
      beginPath: () => {},
      closePath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      stroke: () => {},
      fill: () => {},
      save: () => {},
      restore: () => {},
      scale: () => {},
      translate: () => {},
      rotate: () => {},
      setTransform: () => {},
      ellipse: () => {},
      roundRect: () => {},
      drawImage: () => {},
      getImageData: () => ({ data: [] }),
      putImageData: () => {},
      createImageData: () => ({ data: [] }),
      setLineDash: () => {},
      getLineDash: () => [],
      measureText: () => ({ width: 0 }),
    } as unknown as CanvasRenderingContext2D;
  }
  return null;
} as any;
