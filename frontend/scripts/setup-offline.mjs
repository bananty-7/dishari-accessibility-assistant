import {mkdir,copyFile,readdir,writeFile,access} from 'node:fs/promises';
import path from 'node:path';
const out = path.resolve('public/vendor');
await mkdir('public/fonts',{recursive:true});
for(const weight of [400,600,700]) {
 await copyFile(`node_modules/@fontsource/noto-sans-bengali/files/noto-sans-bengali-bengali-${weight}-normal.woff2`,`public/fonts/bangla-${weight}.woff2`);
 await copyFile(`node_modules/@fontsource/inter/files/inter-latin-${weight}-normal.woff2`,`public/fonts/inter-${weight}.woff2`);
}
await mkdir(`${out}/core`,{recursive:true}); await mkdir(`${out}/lang`,{recursive:true});
await copyFile('node_modules/tesseract.js/dist/worker.min.js',`${out}/worker.min.js`);
for(const name of await readdir('node_modules/tesseract.js-core')) {
  if(name.startsWith('tesseract-core') && /\.(js|wasm)$/.test(name)) await copyFile(`node_modules/tesseract.js-core/${name}`,`${out}/core/${name}`);
}
for(const lang of ['ben','eng']) {
  const dest=`${out}/lang/${lang}.traineddata.gz`;
  try { await access(dest); console.log(`${lang} already installed`); continue; } catch {}
  await copyFile(`node_modules/@tesseract.js-data/${lang}/4.0.0/${lang}.traineddata.gz`,dest);console.log(`${lang} installed`);
}
await writeFile(`${out}/ready.json`,JSON.stringify({languages:['ben','eng'],version:1}));
console.log('Offline OCR assets ready. Build the app to cache them for offline use.');
