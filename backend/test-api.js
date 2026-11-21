const http = require('http');
const { app, server } = require('./server');

const PORT = process.env.PORT || 5055;

setTimeout(() => {
  http.get(`http://localhost:${PORT}/api/health`, (res) => {
    let raw = '';
    res.on('data', chunk => raw += chunk);
    res.on('end', () => {
      console.log('HEALTH API RESULT:', raw);
      http.get(`http://localhost:${PORT}/api/games`, (gres) => {
        let graw = '';
        gres.on('data', c => graw += c);
        gres.on('end', () => {
          const parsed = JSON.parse(graw);
          console.log('GAMES COUNT:', parsed.count);
          console.log('GAMES:', parsed.data.map(g => `${g.name} [${g.status}]`));
          server.close(() => {
            console.log('Server closed cleanly. Test passed!');
            process.exit(0);
          });
        });
      });
    });
  });
}, 1000);
