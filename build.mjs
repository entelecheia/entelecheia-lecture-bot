import archiver from 'archiver'
import autoprefixer from 'autoprefixer'
import esbuild from 'esbuild'
import postcssPlugin from 'esbuild-style-plugin'
import fs from 'fs-extra'
import tailwindcss from 'tailwindcss'

const outdir = 'dist'

async function deleteOldDir() {
  await fs.remove(outdir)
}

async function runEsbuild() {
  await esbuild.build({
    entryPoints: [
      'src/content/index.tsx',
      'src/service/index.ts',
      'src/options/index.tsx',
      'src/popup/index.ts',
      'src/styles/styles.mjs',
    ],
    bundle: true,
    outdir: outdir,
    treeShaking: true,
    minify: true,
    legalComments: 'none',
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    jsx: 'automatic',
    loader: {
      '.png': 'dataurl',
      '.scss': 'css',
    },
    plugins: [
      postcssPlugin({
        postcss: {
          plugins: [tailwindcss, autoprefixer],
        },
      }),
    ],
  })
}

async function zipFolder(dir) {
  const output = fs.createWriteStream(`${dir}.zip`)
  const archive = archiver('zip', {
    zlib: { level: 9 },
  })
  archive.pipe(output)
  archive.directory(dir, false)
  await archive.finalize()
}

async function copyFiles(entryPoints, targetDir) {
  await fs.ensureDir(targetDir)
  await Promise.all(
    entryPoints.map(async (entryPoint) => {
      await fs.copy(entryPoint.src, `${targetDir}/${entryPoint.dst}`)
    }),
  )
}

async function build() {
  await deleteOldDir()
  await runEsbuild()

  const commonFiles = [
    { src: 'dist/content/index.js', dst: 'contentScript.js' },
    { src: 'dist/content/index.css', dst: 'contentScript.css' },
    { src: 'dist/service/index.js', dst: 'serviceWorker.js' },
    { src: 'dist/options/index.js', dst: 'options.js' },
    { src: 'dist/options/index.css', dst: 'options.css' },
    { src: 'dist/popup/index.js', dst: 'popup.js' },
    { src: 'src/favicon.png', dst: 'favicon.png' },
    { src: 'static/options/index.html', dst: 'options.html' },
    { src: 'static/popup/index.html', dst: 'popup.html' },
    { src: 'static/_locales', dst: '_locales' },
  ]

  // chromium
  await copyFiles(
    [...commonFiles, { src: 'static/manifest.json', dst: 'manifest.json' }],
    `./${outdir}/chrome`,
  )

  await zipFolder(`./${outdir}/chrome`)

  console.log('Build success.')
}

build()
