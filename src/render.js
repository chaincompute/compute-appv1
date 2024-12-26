const { ipcRenderer } = require('electron');

document.getElementById('startBtn').addEventListener('click', () => {
  // compute get
  ipcRenderer.send('start-computation');
  document.getElementById('status').innerText = 'Status: Running Computation...';
});
