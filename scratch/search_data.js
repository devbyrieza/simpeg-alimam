const fs = require('fs');
const path = require('path');

function searchInFiles(dir, query, done) {
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
              searchInFiles(file, query, function(err, res) {
                results = results.concat(res);
                next();
              });
          }
        } else {
          // Check file extension
          if (file.endsWith('.sql') || file.endsWith('.csv') || file.endsWith('.json') || file.endsWith('.md') || file.endsWith('.txt')) {
             try {
                 const content = fs.readFileSync(file, 'utf8');
                 if (content.toLowerCase().includes(query.toLowerCase())) {
                     results.push(file);
                 }
             } catch (e) {
                 // ignore binary/read errors
             }
          }
          next();
        }
      });
    })();
  });
}

searchInFiles('c:/Users/itpua/Dev/Work/al-andalus', 'Atqanul', function(err, results) {
  if (err) throw err;
  console.log("Found in:");
  console.log(results);
});
