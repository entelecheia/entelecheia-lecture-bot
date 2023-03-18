import archiver from 'archiver'
import autoprefixer from 'autoprefixer'
import * as dotenv from 'dotenv'
import esbuild from 'esbuild'
import postcssPlugin from 'esbuild-style-plugin'
import fs from 'fs-extra'
import tailwindcss from 'tailwindcss'

dotenv.config()

const outdir = 'build'

async function deleteOldDir() {
  await fs.remove(outdir)
}

async function runEsbuild() {
  await esbuild.build({
    entryPoints: ['src/content/index.tsx', 'src/service/index.ts', 'src/options/index.tsx'],
    bundle: true,
    outdir: outdir,
    treeShaking: true,
    minify: true,
    legalComments: 'none',
    define: {
      'process.env.NODE_ENV': '"production"',
    },
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    jsx: 'automatic',
    loader: {
      '.png': 'dataurl',
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
    { src: 'build/content/index.js', dst: 'contentScript.js' },
    { src: 'build/content/index.css', dst: 'contentScript.css' },
    { src: 'build/service/index.js', dst: 'serviceWorker.js' },
    { src: 'build/options/index.js', dst: 'options.js' },
    { src: 'build/options/index.css', dst: 'options.css' },
    { src: 'static/options/index.html', dst: 'options.html' },
    { src: 'static/icons/favicon.png', dst: 'favicon.png' },
    { src: 'static/_locales', dst: '_locales' },
  ]

  // chromium
  await copyFiles(
    [...commonFiles, { src: 'static/manifest.json', dst: 'manifest.json' }],
    `./${outdir}/chromium`,
  )

  await zipFolder(`./${outdir}/chromium`)

  console.log('Build success.')
}

build()
