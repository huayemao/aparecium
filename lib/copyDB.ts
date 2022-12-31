import path from 'path';
import fs from 'fs';

export function copyDB() {
  console.log('-----------q------------');
  if (!fs.existsSync("/tmp/dev.db")) {
    console.log('----------------writing---------------');
    const file = path.join(process.cwd(), "tmp", "dev.db");
    const d = fs.readFileSync(file);
    console.log(d.byteLength);
    let writeStream = fs.createWriteStream(`/tmp/dev.db`);
    writeStream.write(d, (...args) => {
      console.log(...args);
      const t = fs.readFileSync('/tmp/dev.db');
      console.log(t.byteLength);
    });
    // fs.writeFileSync('/tmp/dev.db', d);
  }
}
