import path from 'path';
import fs from 'fs';

export function copyDB() {
  console.log('-----------q------------');
  if (!fs.existsSync("/data/dev.db")) {
    console.log('----------------writing---------------');
    const file = path.join(process.cwd(), "data", "dev.db");
    const d = fs.readFileSync(file);
    console.log(d.byteLength);
    let writeStream = fs.createWriteStream(`/data/dev.db`);
    writeStream.write(d, (...args) => {
      console.log(...args);
      const t = fs.readFileSync('/data/dev.db');
      console.log(t.byteLength);
    });
    // fs.writeFileSync('/data/dev.db', d);
  }
}
