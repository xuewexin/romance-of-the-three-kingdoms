import './style.css';
import { GameApp } from './ui/GameApp.ts';

window.addEventListener('DOMContentLoaded', () => {
  const app = new GameApp();
  (window as any).__THREE_KINGDOMS_APP__ = app;
  console.log('《乱世残卷：建安魔障》已就绪！');
});
