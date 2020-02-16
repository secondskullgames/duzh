import { restartGame } from './actions';

// @ts-ignore
window.jwb = window.jwb || {};
window.onload = () => restartGame();

export {};