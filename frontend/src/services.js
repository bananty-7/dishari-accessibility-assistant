import {createWorker} from 'tesseract.js';
import * as pdfjs from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjs.GlobalWorkerOptions.workerSrc=pdfWorkerUrl;
let ocrPromise=null;
let progressListener=()=>{};

export async function readImage(blob,onProgress=()=>{}) {
 progressListener=onProgress;

if(!ocrPromise) {
  ocrPromise=createWorker('ben',1,{
    workerPath:`${location.origin}/vendor/worker.min.js`,
    corePath:`${location.origin}/vendor/core/tesseract-core-simd-lstm.wasm.js`,
    langPath:`${location.origin}/vendor/lang`,
    gzip:false,
    workerBlobURL:false,
    logger:m=>progressListener(m.status,Math.round((m.progress||0)*100)),
  }).catch(error=>{
    ocrPromise=null;
    throw error;
  });
 }

 const worker=await ocrPromise;
 const {data}=await worker.recognize(blob);
 return {text:data.text.trim(),confidence:data.confidence};
}

export async function resetOcr(){if(ocrPromise){try{await (await ocrPromise).terminate();}catch{}ocrPromise=null;}}
export async function imageToBlob(file) {
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('JPG, PNG বা WebP ছবি বেছে নিন।');
 if(file.size>10*1024*1024)throw new Error('ছবির আকার ১০ MB-এর নিচে রাখুন।');
 const bitmap=await createImageBitmap(file,{imageOrientation:'from-image'});
 try {
 const scale=Math.min(1,2200/Math.max(bitmap.width,bitmap.height));
 const canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);
 const ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
 return await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('ছবি তৈরি হয়নি।')),'image/jpeg',.92));
 } finally {bitmap.close();}
}
export async function readPdf(file,onProgress) {
 if(file.size>10*1024*1024)throw new Error('PDF-এর আকার ১০ MB-এর নিচে রাখুন।');
 const doc=await pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer()),isEvalSupported:false}).promise;
 try {
 if(doc.numPages>20)throw new Error('একবারে সর্বোচ্চ ২০ পৃষ্ঠার PDF দিন।');
 const texts=[];let scanned=false;
 for(let i=1;i<=doc.numPages;i++) {
 onProgress(`পৃষ্ঠা ${i}/${doc.numPages}`,Math.round(i/doc.numPages*100));
 const page=await doc.getPage(i);const content=await page.getTextContent();
 let text=content.items.map(item=>item.str+(item.hasEOL?'\n':' ')).join('').trim();
 if(text.length<20) {
 scanned=true;const raw=page.getViewport({scale:1});const view=page.getViewport({scale:Math.min(2,2200/Math.max(raw.width,raw.height))});
 const canvas=document.createElement('canvas');canvas.width=Math.ceil(view.width);canvas.height=Math.ceil(view.height);
 await page.render({canvasContext:canvas.getContext('2d'),viewport:view}).promise;
 const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
 text=(await readImage(blob,(status,p)=>onProgress(`পৃষ্ঠা ${i}: ${status}`,p))).text;
 }
 texts.push(`পৃষ্ঠা ${i}\n${text}`);page.cleanup();
 }
 return {text:texts.join('\n\n'),confidence:null,source:scanned?'PDF + local OCR':'PDF text extraction'};
 }finally{await doc.destroy();}
}
export async function analyze(blob,mode,settings) {
 const base=new URL(settings.backend);
 if(!['http:','https:'].includes(base.protocol)||base.username||base.password)throw new Error('Backend URL সঠিক নয়।');
 const data=new FormData();data.append('image',blob,'capture.jpg');data.append('mode',mode);
 const response=await fetch(`${base.href.replace(/\/$/,'')}/api/analyze`,{
 method:'POST',body:data,headers:settings.token?{'X-API-Key':settings.token}:{},signal:AbortSignal.timeout(120000),
 });
 if(!response.ok){const error=await response.json().catch(()=>({}));throw new Error(error.detail||`Backend error ${response.status}`);}
 return await response.json();
}
export async function backendHealth(settings) {
 const response=await fetch(`${settings.backend.replace(/\/$/,'')}/api/health`,{signal:AbortSignal.timeout(4000)});
 if(!response.ok)throw new Error('Backend unavailable');return await response.json();
}
export function speak(text,settings,onWarning=()=>{}) {
 if(!('speechSynthesis' in window)){onWarning('এই browser-এ text-to-speech নেই।');return;}
 speechSynthesis.cancel();
 const voices=speechSynthesis.getVoices();const voice=voices.find(v=>v.lang.toLowerCase().startsWith('bn')&&(!settings.offlineVoice||v.localService));
 if(!voice){onWarning('বাংলা voice পাওয়া যায়নি। Device-এর TTS settings-এ Bangla voice install করুন।');return;}
 const chunks=text.match(/[^।.!?\n]+[।.!?\n]?/g)||[text];
 // Sentence chunks avoid long-utterance truncation in several browser engines.
 for(const chunk of chunks){const utterance=new SpeechSynthesisUtterance(chunk);utterance.voice=voice;utterance.lang=voice.lang;utterance.rate=Number(settings.rate);speechSynthesis.speak(utterance);}
}
