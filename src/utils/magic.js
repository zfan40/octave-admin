import { notification, Modal } from 'antd';

const Tone = require('tone');
const jscad = require('@jscad/openjscad');
// const fs = require('fs');
const FileSaver = require('file-saver');

const SAME_NOTE_INTERVAL = 1; // 同一个音不能相距小于1秒，不然音片打击出问题

// const mbox = new Tone.MonoSynth({
//   volume: -10,
//   envelope: {
//     attack: 0.1,
//     decay: 0.3,
//     release: 2,
//   },
//   filterEnvelope: {
//     attack: 0.001,
//     decay: 0.01,
//     sustain: 0.5,
//     baseFrequency: 200,
//     octaves: 2.6,
//   },
// }).toMaster();

const mbox = new Tone.Sampler(
  {
    B3: 'B3.[mp3|ogg]',
    E4: 'E4.[mp3|ogg]',
    G4: 'G4.[mp3|ogg]',
    B4: 'B4.[mp3|ogg]',
    'C#5': 'Cs5.[mp3|ogg]',
    E5: 'E5.[mp3|ogg]',
    G5: 'G5.[mp3|ogg]',
    B5: 'B5.[mp3|ogg]',
    'C#6': 'Cs6.[mp3|ogg]',
  },
  {
    release: 1,
    // baseUrl: '/static/audio/mbox/',
    baseUrl: '//cnbj1.fds.api.xiaomi.com/mbox/audio/mbox/',
  }
).toMaster();

let music;

function getEasyPins(tasksObj) {
  // 针对死音片，即全白键上升18音片 的计算方法
  const EZMachine = [
    'C4',
    'D4',
    'E4',
    'F4',
    'G4',
    'A4',
    'B4',
    'C5',
    'D5',
    'E5',
    'F5',
    'G5',
    'A5',
    'B5',
    'C6',
    'D6',
    'E6',
    'F6',
  ].map(a => `${parseInt(Tone.Frequency(a).toFrequency() * 2, 10)}`); // 18个白音频率
  const arrayTaskObj = Object.keys(tasksObj); // 作品频率
  console.log(arrayTaskObj);
  console.log(EZMachine);
  // 确认没有多余音
  let isEZWhite = true;
  arrayTaskObj.forEach((note) => {
    isEZWhite = isEZWhite && EZMachine.includes(note);
  });
  if (!isEZWhite) return false;
  console.log('pass 1');
  // 确认同音没那么近
  const timings = Object.values(tasksObj);
  timings.forEach((timing) => {
    if (timing.length === 1) {
      isEZWhite = isEZWhite && true;
    } else {
      for (let i = 0; i <= timing.length - 2; i += 1) {
        if (timing[i + 1] - timing[i] < SAME_NOTE_INTERVAL) {
          isEZWhite = false;
          break;
        }
      }
    }
  });
  if (!isEZWhite) return false;

  const musicboxPins = [];
  // build EZ Model
  arrayTaskObj.forEach((freq) => {
    tasksObj[freq].forEach((time) => {
      musicboxPins.push(`generatePin(${time * 0.75},${EZMachine.indexOf(freq) + 1})`); // 0.75 is *15/20
    });
  });
  return musicboxPins;
}
export function buildModel(items, workId) {
  console.log('== Enter RealMagic ==');
  // console.log(JSON.stringify(items));
  const tasksObj = {};
  items.forEach((item) => {
    // * 2, cuz print mbox need 1 octave higher.
    const itemNoteFreq = parseInt(Tone.Frequency(item.note).toFrequency() * 2, 10);
    if (!tasksObj[itemNoteFreq]) {
      tasksObj[itemNoteFreq] = [];
    }
    tasksObj[itemNoteFreq].push(item.time);
  });
  // tasksObj is like {784:[1.0295,1.39,2.6713],659:[2.66],...}

  const musicboxEZPins = getEasyPins(tasksObj);
  console.log('ez model!!!!!', musicboxEZPins);
  if (musicboxEZPins) {
    const script = `
      //底下低音,上面高音
    const DOT_WIDTH = 0.6
    const RATIO = 0.98
    const OFFSET = 2.2 //1.95 is center
    const OUTER_RADIUS = 6.6
    const INNER_RADIUS = 5.9
    function generatePin(noteSec, noteNo) {
      return rotate(90, [1, 0, 4 * noteSec * RATIO / 15], cylinder({
        h: 1,
        r: DOT_WIDTH / 2,
        center: true,
        fn:100,
      })).translate([sin(360 * noteSec * RATIO / 15) * OUTER_RADIUS, -cos(360 * noteSec * RATIO / 15) * OUTER_RADIUS, -9.95 + OFFSET + 0.4 + (noteNo - 1) * .9])
    }

    function main() {
      let cylinderBody = difference(cylinder({h: 19.9,r: OUTER_RADIUS,center: true,fn:150}),cylinder({h: 19.9,r: INNER_RADIUS,center: true,fn:150}),generatePin(0, -2),generatePin(5, -2),generatePin(10, -2))
      let holes = union(${musicboxEZPins})
      return union(cylinderBody,holes).translate([0, 0, 0]).scale(1);
    }`;
    const params = {};
    jscad.compile(script, params).then((compiled) => {
      const outputData = jscad.generateOutput('stlb', compiled);
      FileSaver.saveAs(outputData, workId ? `${workId}.stl` : 'mb.stl');
    });
    return;
  }
  // then we focus on each task
  const taskTypes = Object.keys(tasksObj); // [659,784,...]  freq array, 排好序的（object.keys）
  const taskTimeArrays = Object.values(tasksObj); // [[2.66]，[1.0295,1.39,2.6713]] 顺序跟上面对应的
  const machines = []; // init with existing types, will add more machines
  const groups = []; // will final be [[1],[1,2,1],...], corespond to taskTimeArrays

  if (taskTypes.length > 18) {
    alert('音种类超过18个，这个做不了');
    return false;
  }

  taskTimeArrays.forEach((timeArray) => {
    const final = [];
    timeArray.forEach((time, j) => {
      const test = []; // 校验当前final里不能用的序号， final里序号种类和test种类相同则证明不行
      let allPreviousOccupied = false;
      let successFound = false;
      if (j === 0) {
        final.push(1); // 给第1组的第一个任务分配第一个机器
      } else {
        let counter = j;
        while (counter >= 1 && !allPreviousOccupied) {
          // TODO: -1 or 0
          counter -= 1;
          if (
            time - timeArray[counter] >= SAME_NOTE_INTERVAL &&
            test.indexOf(final[counter]) === -1
          ) {
            final.push(final[counter]);
            successFound = true;
            break;
          } else if (test.indexOf(final[counter]) === -1) {
            test.push(final[counter]);
            if ([...new Set(final)].length === [...new Set(test)].length) {
              // final目前已有的都不满足，set可以取unique elements [1,1,2,2,3,1] => [1,2,3]
              allPreviousOccupied = true;
              break;
            }
          }
        }
        if ((counter === 0 && !successFound) || allPreviousOccupied) {
          final.push(Math.max(...final) + 1);
        }
      }
    });
    groups.push(final);
  });
  // console.log(taskTypes);
  // console.log(taskTimeArrays);
  // console.log('hehe', groups); // [[1],[1,2,1],...], corespond to taskTimeArrays

  // now we have groups, let's build machines based on this
  groups.forEach((group, index) => {
    let count = 0;
    while (count <= Math.max(...group) - 1) {
      machines.push(taskTypes[index]);
      count += 1;
    }
  });
  if (machines.length < 18) {
    // const lastMachine = machines[machines.length - 1];
    while (machines.length < 18) {
      // machines.push(lastMachine); // make it length of 18
      machines.push(0);
    }
    // machines is like ["1046", "1174", "1318", "1318", "1318", "1396", "1567"] of 18 length
  } else if (machines.length > 18) {
    alert('所需音片儿超过18个');
    return false;
  }
  // TODO:得到从低到高machines后，根据音片的各个齿最低频率平移，占用空的位置呗，此处也会失败。。。
  console.log(machines);
  // notification.open({
  //   message: `No.${workId}: `,
  //   description: JSON.stringify(machines),
  // });
  Modal.info({
    title: `No.${workId}: `,
    content: JSON.stringify(machines),
  });
  // then we merge all the tasks

  // test1: [[1],[1,2,1]] => [1,2,3,2]
  // test2: [[1,2,1],[1,2,3]] => [1,2,1,3,4,5]
  const finalBins = groups.reduce((a, b) => a.concat(b.map(item => item + Math.max(...a))));
  let finalTimings = taskTimeArrays.reduce((a, b) => a.concat(b)); // just flatten it
  finalTimings = finalTimings.map(item => item * 15 / 20); // normalize from 20s to 15s
  const musicboxPins = finalBins.map((bin, index) => `generatePin(${finalTimings[index]},${bin})`);
  // const script = `
  //   //底下低音,上面高音
  // const DOT_WIDTH = 0.3
  // const RATIO = 0.98
  // const OFFSET = 2.2 //1.95 is center
  // const OUTER_RADIUS = 6.6
  // const INNER_RADIUS = 5.9
  // function generatePin(noteSec, noteNo) {
  //   return rotate([90, 0, 360 * noteSec * RATIO / 15], cylinder({
  //     h: 1,
  //     r: DOT_WIDTH / 2,
  //     center: true,
  //     fn:100,
  //   })).translate([sin(360 * noteSec * RATIO / 15) * OUTER_RADIUS, -cos(360 * noteSec * RATIO / 15) * OUTER_RADIUS, -9.95 + OFFSET + 0.4 + (noteNo - 1) * .9])
  // }
  //
  // function main() {
  //   let cylinderBody = difference(cylinder({h: 19.9,r: OUTER_RADIUS,center: true,fn:100}),cylinder({h: 19.9,r: INNER_RADIUS,center: true,fn:100}),generatePin(0, -2),generatePin(5, -2),generatePin(10, -2))
  //   let holes = union(${musicboxPins})
  //   return union(cylinderBody,holes).translate([0, 0, 0]).scale(1);
  // }`;
  const script = `
    //底下低音,上面高音
  const DOT_WIDTH = 0.3
  const RATIO = 0.98
  const OFFSET = 2.2 //1.95 is center
  const OUTER_RADIUS = 6.6
  const INNER_RADIUS = 5.9
  function generatePin(noteSec, noteNo) {
    return rotate([90, 0, (360 * noteSec * RATIO / 15)-30], cube({
      size:[DOT_WIDTH,DOT_WIDTH,1],
      center: true,
      fn:100,
    })).translate([sin(360 * noteSec * RATIO / 15) * OUTER_RADIUS, -cos(360 * noteSec * RATIO / 15) * OUTER_RADIUS, -9.95 + OFFSET + 0.4 + (noteNo - 1) * .9])
  }

  function main() {
    let cylinderBody = difference(cylinder({h: 19.9,r: OUTER_RADIUS,center: true,fn:100}),cylinder({h: 19.9,r: INNER_RADIUS,center: true,fn:100}),generatePin(0, -2),generatePin(5, -2),generatePin(10, -2))
    let holes = union(${musicboxPins})
    return union(cylinderBody,holes).translate([0, 0, 0]).scale(1);
  }`;
  console.log(script);
  const params = {};
  jscad.compile(script, params).then((compiled) => {
    // generate final output data, choosing your prefered format
    const outputData = jscad.generateOutput('stlb', compiled);
    // hurray ,we can now write an stl file from our OpenJsCad script!
    FileSaver.saveAs(outputData, workId ? `${workId}.stl` : 'mb.stl');
    // fs.writeFileSync('mb.stl', outputData.asBuffer());
  });
}

export function buildModelWithParam(
  items,
  workId,
  DOT_WIDTH,
  OFFSET,
  OUTER_RADIUS,
  INNER_RADIUS,
  DOT_HEIGHT
) {
  console.log('== Enter RealMagic ==');
  const tasksObj = {};
  items.forEach((item) => {
    const itemNoteFreq = parseInt(Tone.Frequency(item.note).toFrequency() * 2, 10);
    if (!tasksObj[itemNoteFreq]) {
      tasksObj[itemNoteFreq] = [];
    }
    tasksObj[itemNoteFreq].push(item.time);
  });
  const taskTypes = Object.keys(tasksObj); // [659,784,...]  freq array, 排好序的（object.keys）
  const taskTimeArrays = Object.values(tasksObj); // [[2.66]，[1.0295,1.39,2.6713]] 顺序跟上面对应的
  const machines = []; // init with existing types, will add more machines
  const groups = []; // will final be [[1],[1,2,1],...], corespond to taskTimeArrays
  if (taskTypes.length > 18) {
    alert('音种类超过18个，这个做不了');
    return false;
  }
  taskTimeArrays.forEach((timeArray) => {
    const final = [];
    timeArray.forEach((time, j) => {
      const test = []; // 校验当前final里不能用的序号， final里序号种类和test种类相同则证明不行
      let allPreviousOccupied = false;
      let successFound = false;
      if (j === 0) {
        final.push(1); // 给第1组的第一个任务分配第一个机器
      } else {
        let counter = j;
        while (counter >= 1 && !allPreviousOccupied) {
          // TODO: -1 or 0
          counter -= 1;
          if (
            time - timeArray[counter] >= SAME_NOTE_INTERVAL &&
            test.indexOf(final[counter]) === -1
          ) {
            final.push(final[counter]);
            successFound = true;
            break;
          } else if (test.indexOf(final[counter]) === -1) {
            test.push(final[counter]);
            if ([...new Set(final)].length === [...new Set(test)].length) {
              // final目前已有的都不满足，set可以取unique elements [1,1,2,2,3,1] => [1,2,3]
              allPreviousOccupied = true;
              break;
            }
          }
        }
        if ((counter === 0 && !successFound) || allPreviousOccupied) {
          final.push(Math.max(...final) + 1);
        }
      }
    });
    groups.push(final);
  });
  groups.forEach((group, index) => {
    let count = 0;
    while (count <= Math.max(...group) - 1) {
      machines.push(taskTypes[index]);
      count += 1;
    }
  });
  if (machines.length < 18) {
    while (machines.length < 18) {
      machines.push(0);
    }
  } else if (machines.length > 18) {
    alert('所需音片儿超过18个');
    return false;
  }
  Modal.info({
    title: `No.${workId}: `,
    content: JSON.stringify(machines),
  });

  const finalBins = groups.reduce((a, b) => a.concat(b.map(item => item + Math.max(...a))));
  let finalTimings = taskTimeArrays.reduce((a, b) => a.concat(b)); // just flatten it
  finalTimings = finalTimings.map(item => item * 15 / 20); // normalize from 20s to 15s
  const musicboxPins = finalBins.map((bin, index) => `generatePin(${finalTimings[index]},${bin})`);
  // const script = `
  //   //底下低音,上面高音
  // const DOT_WIDTH = 0.3
  // const RATIO = 0.98
  // const OFFSET = 2.2 //1.95 is center
  // const OUTER_RADIUS = 6.6
  // const INNER_RADIUS = 5.9
  // function generatePin(noteSec, noteNo) {
  //   return rotate([90, 0, 360 * noteSec * RATIO / 15], cylinder({
  //     h: 1,
  //     r: DOT_WIDTH / 2,
  //     center: true,
  //     fn:100,
  //   })).translate([sin(360 * noteSec * RATIO / 15) * OUTER_RADIUS, -cos(360 * noteSec * RATIO / 15) * OUTER_RADIUS, -9.95 + OFFSET + 0.4 + (noteNo - 1) * .9])
  // }
  //
  // function main() {
  //   let cylinderBody = difference(cylinder({h: 19.9,r: OUTER_RADIUS,center: true,fn:100}),cylinder({h: 19.9,r: INNER_RADIUS,center: true,fn:100}),generatePin(0, -2),generatePin(5, -2),generatePin(10, -2))
  //   let holes = union(${musicboxPins})
  //   return union(cylinderBody,holes).translate([0, 0, 0]).scale(1);
  // }`;
  const script = `
    //底下低音,上面高音
  const DOT_WIDTH = ${DOT_WIDTH}
  const RATIO = 0.98
  const OFFSET = ${OFFSET} //1.95 is center
  const OUTER_RADIUS = ${OUTER_RADIUS}
  const INNER_RADIUS = ${INNER_RADIUS}
  const DOT_HEIGHT = ${DOT_HEIGHT}
  function generatePin(noteSec, noteNo) {
    return rotate([90, 0, (360 * noteSec * RATIO / 15)], cube({
      size:[DOT_WIDTH,DOT_WIDTH,DOT_HEIGHT],
      center: true,
      fn:100,
    })).translate([sin(360 * noteSec * RATIO / 15) * OUTER_RADIUS, -cos(360 * noteSec * RATIO / 15) * OUTER_RADIUS, -9.95 + OFFSET + 0.4 + (noteNo - 1) * .9])
  }

  function main() {
    let cylinderBody = difference(cylinder({h: 19.9,r: OUTER_RADIUS,center: true,fn:100}),cylinder({h: 19.9,r: INNER_RADIUS,center: true,fn:100}),generatePin(0, -2),generatePin(5, -2),generatePin(10, -2))
    let holes = union(${musicboxPins})
    return union(cylinderBody,holes).translate([0, 0, 0]).scale(1);
  }`;
  console.log(script);
  const params = {};
  jscad.compile(script, params).then((compiled) => {
    // generate final output data, choosing your prefered format
    const outputData = jscad.generateOutput('stlb', compiled);
    // hurray ,we can now write an stl file from our OpenJsCad script!
    FileSaver.saveAs(outputData, workId ? `${workId}.stl` : 'mb.stl');
    // fs.writeFileSync('mb.stl', outputData.asBuffer());
  });
}

export function preview(items) {
  console.log('current state', Tone.Transport.state);
  if (Tone.Transport.state === 'stopped') {
    if (music) music.dispose();
    music = new Tone.Part((time, value) => {
      mbox.triggerAttackRelease(value.note, '8n', time);
    }, items).start(0, 0);
    music.loop = true;
    music.loopEnd = 20; // 20s一个循环
    Tone.Transport.start('+0.01', 0);
  } else {
    Tone.Transport.stop(0);
  }
  // try {
  //   Tone.Transport.stop(0);
  //   console.log(1);
  //   // Tone.Part.removeAll();
  //   Tone.Transport.clear();
  //   console.log(2);
  //   music.dispose();
  //   music = undefined;
  //   console.log(3);
  // } catch (e) {
  //   //
  // } finally {
  //   music = new Tone.Part(((time, value) => {
  //     mbox.triggerAttackRelease(value.note, '8n', time);
  //   }), items).start(0, 0);
  //   Tone.Transport.start('+0.01', 0);
  // }
}
