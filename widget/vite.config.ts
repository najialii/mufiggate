import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ command }) => {
  if (command === 'serve') {
    // Dev mode - serve the demo
    return {
      plugins: [react()],
      root: '.'
    };
  } else {
    // Build mode - build as library
    return {
      plugins: [react()],
      build: {
        lib: {
          entry: resolve(__dirname, 'src/index.tsx'),
          name: 'SudanPay',
          formats: ['es', 'umd'],
          fileName: (format) => `sudanpay-widget.${format}.js`
        },
        rollupOptions: {
          external: ['react', 'react-dom'],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM'
            }
          }
        }
      }
    };
  }
});
