const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const read = name => fs.readFileSync(path.join(root,name),'utf8');
const assets = {};
for (const group of ['sprites','hud','effects','environment']) {
  for (const file of fs.readdirSync(path.join(root,'art',group))) {
    assets[file.slice(0,-4)]='data:image/png;base64,'+fs.readFileSync(path.join(root,'art',group,file)).toString('base64');
  }
}
const js = 'const assetURLs='+JSON.stringify(assets)+';\n'+['capitals.js','questions.js','voyage.js','flight.js','audio.js','game.js'].map(read).join('\n');
const radioFont = fs.readFileSync(path.join(root,'art','oddburn-radio.woff')).toString('base64');
const styles = read('game.css').replace('RADIO_FONT_URL','data:font/woff;base64,'+radioFont);
const html = read('index.html').replace('STYLES_HERE',()=>styles).replace('CODE_HERE',()=>js);
fs.mkdirSync(path.join(root,'dist'),{recursive:true});
fs.writeFileSync(path.join(root,'dist','index.html'),html);

