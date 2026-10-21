import test from 'node:test';import assert from 'node:assert/strict';
import {parseCommand,currencyReading,medicineReading,validPhone} from './domain.js';
test('Bangla commands route without accidentally calling emergency',()=>{assert.equal(parseCommand('ওষুধের লেবেল পড়ো'),'medicine');assert.equal(parseCommand('টাকা পড়ো'),'currency');assert.equal(parseCommand('থামো'),'stop');assert.equal(parseCommand('অজানা কথা'),null);});
test('currency declines ambiguous numbers and unrelated text',()=>{assert.equal(currencyReading('বাংলাদেশ ব্যাংক ৫০০ টাকা').value,500);assert.equal(currencyReading('বাংলাদেশ ব্যাংক 100 500 টাকা').value,null);assert.equal(currencyReading('price 500').value,null);});
test('medicine label does not infer dosage',()=>{const r=medicineReading('Example\n500 mg\nEXP 2028');assert.deepEqual(r.lines,['500 mg','EXP 2028']);assert.match(r.warning,/যাচাই করা হয়নি/);});
test('phone rejects links and script content',()=>{assert.equal(validPhone('+880 1712 345678'),true);assert.equal(validPhone('javascript:alert(1)'),false);});
