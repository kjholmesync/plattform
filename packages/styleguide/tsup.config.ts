import { exec } from 'child_process'
import { defineConfig } from 'tsup'

const config = defineConfig((options) => ({
  entryPoints: ['src/lib.ts', 'src/editor.ts', 'src/chart.ts'],
  format: ['cjs', 'esm'],
  sourcemap: true,
  clean: !options.watch,
  minify: !options.watch,
  target: 'es6',
  external: ['react', 'react-dom'],
  outDir: 'dist',
  loader: {
    '.js': 'jsx',
  },
  onSuccess: async () => {
    await new Promise<void>((resolve, reject) => {
      exec('tsc --emitDeclarationOnly --declaration', (err, stdout, stderr) => {
        if (err) {
          console.error(stderr)
          reject(err)
        }
        console.log(stdout)
        resolve()
      })
    })
    console.log('⚡ TypeScript declaration files generated')
  },
}))

export default config