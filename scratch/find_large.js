const fs = require('fs');
const path = require('path');

function walk(dir, done) {
  let results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    let i = 0;
    (function next() {
      let file = list[i++];
      if (!file) return done(null, results);
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          if (file.includes('node_modules') || file.includes('.next') || file.includes('.git')) {
              next();
          } else {
              walk(file, function(err, res) {
                results = results.concat(res);
                next();
              });
          }
        } else {
          if (file.endsWith('.sql') || file.endsWith('.csv') || file.endsWith('.json')) {
              if(stat.size > 100000) { // > 100KB
                  results.push({file, size: stat.size});
              }
          }
          next();
        }
      });
    })();
  });
}

walk('c:/Users/itpua/Dev/Work/al-andalus', function(err, results) {
  if (err) throw err;
  results.sort((a,b) => b.size - a.size);
  console.log("Large data files found:");
  results.forEach(r => console.log(`${(r.size/1024/1024).toFixed(2)} MB - ${r.file}`));
});
