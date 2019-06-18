var fs = require('fs');
var path = process.argv[2];
const { exec } = require('child_process');

fs.readdir(__dirname, function(err, items) {
  items = items.filter(
    file => file.endsWith('.js') && !__filename.endsWith('\\' + file)
  );

  for (var i = 0; i < items.length; i++) {
    exec('node ' + __dirname + '\\' + items[i], (err, stdout, stderr) => {
      if (err) {
        console.error(`exec error: ${err}`);
        return;
      }

      console.log(stdout);
    });
  }
});
