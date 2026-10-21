export const MODES = [
 {id:'scene',bn:'চারপাশ দেখুন',en:'Describe a scene',hint:'আপনার চারপাশের ছবি বর্ণনা করুন',icon:'eye'},
 {id:'ocr',bn:'লেখা পড়ুন',en:'Read Bangla & English',hint:'ছবি থেকে লেখা শুনুন',icon:'scan'},
 {id:'currency',bn:'টাকা পড়ুন',en:'Read a banknote',hint:'নোটের লেখা থেকে সম্ভাব্য মূল্য',icon:'wallet'},
 {id:'medicine',bn:'ওষুধের লেবেল',en:'Read a medicine label',hint:'লেবেলে যা লেখা আছে শুনুন',icon:'pill'},
 {id:'document',bn:'ডকুমেন্ট পড়ুন',en:'Read a document',hint:'ছবি বা PDF-এর লেখা পড়ুন',icon:'file'},
 {id:'obstacle',bn:'সামনের বস্তু',en:'Experimental object alert',hint:'ছবিতে সামনে থাকা বস্তু দেখুন',icon:'radar'},
];
export function parseCommand(text) {
 const value=text.toLowerCase();
 if(/থাম|চুপ|stop/.test(value))return 'stop';
 if(/জরুরি|সাহায্য|emergency|help/.test(value))return 'emergency';
 if(/আবার|repeat/.test(value))return 'repeat';
 if(/ওষুধ|ঔষধ|medicine/.test(value))return 'medicine';
 if(/টাকা|নোট|currency|money/.test(value))return 'currency';
 if(/বাধা|সামনে|obstacle/.test(value))return 'obstacle';
 if(/ডকুমেন্ট|নথি|document/.test(value))return 'document';
 if(/লেখা|পড়|পড়|read|text/.test(value))return 'ocr';
 if(/চারপাশ|দৃশ্য|scene|around/.test(value))return 'scene';
 if(/ছবি|capture|photo/.test(value))return 'capture';
 return null;
}
const digits='০১২৩৪৫৬৭৮৯';
export function normalizeDigits(text){return text.replace(/[০-৯]/g,ch=>String(digits.indexOf(ch)));}
export function currencyReading(text) {
 const normalized=normalizeDigits(text);
 const values=[...new Set((normalized.match(/\b(?:1000|500|200|100|50|20|10|5|2|1)\b/g)||[]).map(Number))];
 const hasCurrency=/টাকা|বাংলাদেশ ব্যাংক|taka|bangladesh bank/i.test(text);
 if(!hasCurrency||values.length!==1)return {value:null,warning:'নোটের মূল্য নিশ্চিতভাবে পড়া যায়নি। অন্য পাশে ছবি তুলুন এবং একজন বিশ্বস্ত মানুষের সাহায্য নিন।'};
 return {value:values[0],warning:`লেখায় ${values[0]} টাকা পাওয়া গেছে। এটি নোট যাচাই বা নিশ্চিত মূল্য শনাক্তকরণ নয়।`};
}
export function medicineReading(text) {
 const lines=text.split('\n').map(s=>s.trim()).filter(Boolean);
 const details=lines.filter(s=>/\b(?:mg|ml|mcg|exp|expiry|mfg|batch)\b|মেয়াদ|মেয়াদ|মিলিগ্রাম/i.test(s));
 return {lines:details,warning:'এটি শুধু লেবেলের লেখা। ওষুধের পরিচয়, মেয়াদ বা ডোজ যাচাই করা হয়নি। ফার্মাসিস্টের সঙ্গে মিলিয়ে নিন।'};
}
export function validPhone(value){return /^\+?[0-9]{5,15}$/.test(value.replace(/[\s()-]/g,''));}
