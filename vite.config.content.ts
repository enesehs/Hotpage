import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react()],
    define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    },
    build: {
        emptyOutDir: false,
        outDir: 'dist',
        sourcemap: false,
        target: 'es2020',
        minify: 'esbuild',
        rollupOptions: {
            input: {
                content: resolve(__dirname, 'src/content/index.tsx'),
                background: resolve(__dirname, 'src/background.ts')
            },
            output: {
                entryFileNames: (chunk) => {
                    if (chunk.name === 'background') {
                        return 'background.js';
                    }
                    return 'assets/[name].js';
                },
                format: 'es',
                extend: true,
            },
        }
    },
    esbuild: {
        target: 'es2020',
    },
    publicDir: false,
});
