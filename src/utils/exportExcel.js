/**
 *  This file is implemented by converting data into excel files.
 *  The parameter is the frequency and time of the octave.
 *  based https://github.com/SheetJS/js-xlsx
 *
 *  Frequency example:
 *  const Frequency =
 *    ["523","587","587","587","587","587","659","659","659",
 *    "698","698","783","783","880","880","987","987","1046"]
 *
 *  the time:
 *   [24.990937499999994]
 *   [4.82125, 8.330312500000002]
 *   [5.260625000000002, 22.8]
 *   [5.700000000000001, 23.23739583333333]
 *   [6.137395833333334, 23.676770833333332]
 *   [7.014166666666667, 24.553541666666664]
 *   [0.4373958333333334, 4.383854166666667, 20.60708333333334]
 *   [3.0677083333333335, 10.960625000000006, 21.044479166666672]
 *   [3.507083333333333, 19.290937500000005]
 *   [2.1909375, 6.137395833333334]
 *   [4.383854166666667, 7.890937500000002]
 *   [2.1909375, 4.82125, 9.644479166666672, 19.730312500000004]
 *   [2.6303125, 5.260625000000002, 10.521250000000004]
 *   [0.8767708333333333, 4.82125, 21.921249999999997]
 *   [3.0677083333333335, 7.453541666666668]
 *   [1.3141666666666667, 6.5767708333333355]
 *   [1.7535416666666666, 7.453541666666668]
 *   [10.08385416666667]
 *
 *   sheet:
 *   A B C D E F G
 *  1
 *  2
 *  3
 *  4
 *  5
 */
import * as XLSX from 'xlsx';
// chunk array
function chunk(array, size) {
  const {
    length
  } = array;
  if (!length || !size || size < 1) {
    return [];
  }
  let index = 0;
  let resIndex = 0;

  const result = new Array(Math.ceil(length / size));
  while (index < length) {
    result[resIndex++] = array.slice(index, (index += size));
  }
  return result;
}

function getMaxLength(sheetsArray) {
  const result = new Array(sheetsArray.length);
  result.fill(0);
  sheetsArray.forEach((element, item) => {
    sheetsArray[item].forEach((e) => {
      if (e.t.length > result[item]) {
        result[item] = e.t.length;
      }
    });
    return result;
  });
}
/**
 *
 * @param {array}   frequency
 * @param {array}   time
 * @param {number}  length
 * @return {object} workbook
 */
function array2Sheet(frequency, time, length) {
  const standardLength = frequency.length;
  if (standardLength !== time.length) return;
  if (length > standardLength) return;

  const step = frequency.length;
  const sheet = {};
  let sheetArray = [];
  for (let i = 0; i < standardLength; ++i) {
    sheetArray[i] = {
      f: frequency[i],
      t: time[i],
    }
  };

  sheetArray = chunk(sheetArray, length);
  const maxLengthArray = getMaxLength(sheetArray);
  // 从这里开始生成xlsx需要的格式
  let xAxis = 65; // String.fromCharCode()
  let yAxis = 1; // Number;
  sheetArray.forEach((item, index) => {
    if(index !== 0) {
      yAxis += maxLengthArray[index - 1];
    }
    item.forEach((e,i) => {
      sheet[String.fromCharCode(xAxis + i) + yAxis] = e.f;
      e.v.forEach((z,w) => {
        sheet[String.fromCharCode(xAxis + i) + (yAxis + w + 1)] = z;
      }),
    })
  })
  return sheet;
}

function sheet2Blob(sheet, sheetName) {
  const workbook = {
    SheetNames: [sheetName || 'sheet1'],
    Sheets: {},
  };
  workbook.Sheets[sheetName] = sheet;
  // 生成excel的配置项
  const wopts = {
    bookType: 'xlsx', // 要生成的文件类型
    bookSST: false, // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
    type: 'binary',
  };
  const wbout = XLSX.write(workbook, wopts);
  const blob = new Blob([s2ab(wbout)], {
    type: 'application/octet-stream'
  });
  // 字符串转ArrayBuffer
  function s2ab(s) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  }
  return blob;
}

function downnload() {

}
export default function (frequency, time, length) {
  array2Sheet(frequency, time, length);
  return XLSX;
}
