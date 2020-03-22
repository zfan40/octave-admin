
export function buildDisk20FromMidi(items) {
  //先粗略check作品是否可用，TODO
  alert('disk')
  const indexMap = [48, 50, 52, 53, 55, 57, 59, 60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81]
  const pass = items.every(item => indexMap.indexOf(item.midi) >= 0)
  if (!pass) { console.warn('couldn\'t process'); return }
  const script = `
    
const R = 8.9
const noteR = .15
const centerR = .25
const r = []
const grooveR = [0.15,0.12]
const indexMap = [48,50,52,53,55,57,59,60,62,64,65,67,69,71,72,74,76,77,79,81]
const delays = [0,
0.072,
0.138,
0.19,
0.234,
0.257,
0.279,
0.32,
0.324,
0.346,
0.365,
0.381,
0.384,
0.4,
0.396,
0.425,
0.44,
0.467,
0.465,
0.443]
const grooveCenterR = 8.6
// get each r for corresponding dots
for (let i =0;i<=20-1;i++) {
    r.push(2.4+i*.3)
}

//const piece = []
const piece = ${JSON.stringify(items)}.map((note)=>{
  const index = indexMap.indexOf(note.midi)
  return {index,time:note.time+delays[index]}
})

function main () {
  const dots = piece.map(note=>CAG.circle({center:[Math.sin(Math.PI*note.time/15)*r[note.index],Math.cos(Math.PI*note.time/15)*r[note.index]],radius:noteR,resolution: 32}))
  const grooves = Array(143).fill(1).map((groove,index)=>CAG.rectangle({center: [grooveCenterR,0], radius: grooveR}).rotateZ(index*360/143))
  return union(
    difference(
      CAG.circle({center: [0,0], radius: R, resolution: 150}),
      CAG.circle({center: [0,0], radius: centerR, resolution: 50}),
      ...dots,
      ...grooves
    )
  ).translate([0, 0, 0]).scale(10);
}`;
  console.log(script);
  // const params = {};
  // jscad.compile(script, params).then((compiled) => {
  //   // generate final output data, choosing your prefered format
  //   const outputData = jscad.generateOutput('stlb', compiled);
  //   // hurray ,we can now write an stl file from our OpenJsCad script!
  //   FileSaver.saveAs(outputData, workId ? `${workId}.stl` : 'mb.stl');
  //   // fs.writeFileSync('mb.stl', outputData.asBuffer());
  // });
}