const { app, BrowserWindow, ipcMain } = require('electron');
const { Connection, PublicKey, clusterApiUrl, Keypair, Transaction, SystemProgram } = require('@solana/web3.js');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

// interf
let mainWindow;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  mainWindow.loadFile('index.html');
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

// wait res
ipcMain.on('start-computation', async () => {
  console.log('Starting computation...');
  const result = await performComputation();

  // data in sol
  await sendToSolana(result);
  mainWindow.webContents.send('computation-status', 'Status: Computation Completed');
});


async function performComputation() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const result = Math.floor(Math.random() * 1000); // compute
      console.log(`Computation result: ${result}`);
      resolve(result);
    }, 3000);
  });
}

// Настройка подключения к Solana
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
const keypair = Keypair.generate(); // key_sol

// Функция для отправки результатов в блокчейн Solana
async function sendToSolana(result) {
  const payer = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(path.resolve(__dirname, 'payer.json')))) // prv_key
  );

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: keypair.publicKey,
      lamports: result * 1000, // rew result in lampo
    })
  );

  try {
    // sent
    const signature = await connection.sendTransaction(transaction, [payer]);
    await connection.confirmTransaction(signature, 'confirmed');
    console.log(`Transaction successful with signature: ${signature}`);
  } catch (err) {
    console.error('Error sending transaction:', err);
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
