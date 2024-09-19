// Polyfill para usar 'Buffer' y 'global' en un entorno de navegador
import { Buffer } from 'buffer';

(window as any).global = window;
(window as any).process = {
  env: { DEBUG: undefined },
};
