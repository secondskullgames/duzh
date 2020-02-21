import { restartGame } from './actions';

// @ts-ignore
window.jwb = window.jwb || {};
window.onload = () => restartGame();
// jwb.DEBUG = true;

export {};