const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { randomUUID } = require('crypto');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws', maxPayload: 8 * 1024 });
const players = new Map();
const PORT = process.env.PORT || 3000;

app.use(express.static('public', { extensions: ['html'] }));
app.get('/health', (_req, res) => res.json({ ok: true, players: players.size }));

function cleanText(value, max = 24) {
  return String(value || '').replace(/[<>\u0000-\u001f]/g, '').trim().slice(0, max);
}
function broadcast(data) {
  const packet = JSON.stringify(data);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) client.send(packet);
  }
}
function snapshot() {
  return [...players.values()].map(p => ({
    id: p.id, name: p.name, branch: p.branch, avatar: p.avatar,
    x: p.x, z: p.z, rot: p.rot
  }));
}
function broadcastSnapshots() {
  const list = snapshot();
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'snapshot', self: client.playerId || null, players: list }));
    }
  }
}

wss.on('connection', (ws) => {
  const id = randomUUID();
  let joined = false;
  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return; }
    if (!msg || typeof msg !== 'object') return;

    if (msg.type === 'join' && !joined) {
      joined = true;
      players.set(id, {
        id,
        name: cleanText(msg.name, 24) || 'Taruna',
        branch: msg.branch === 'AKPOL' ? 'AKPOL' : 'AKMIL',
        avatar: cleanText(msg.avatar, 2),
        x: Number.isFinite(msg.x) ? Math.max(-75, Math.min(75, msg.x)) : 0,
        z: Number.isFinite(msg.z) ? Math.max(-75, Math.min(75, msg.z)) : 12,
        rot: Number.isFinite(msg.rot) ? msg.rot : 0
      });
      ws.playerId = id;
      ws.send(JSON.stringify({ type: 'welcome', self: id }));
      broadcastSnapshots();
      return;
    }

    if (!joined) return;
    const player = players.get(id);
    if (!player) return;
    if (msg.type === 'move') {
      if (Number.isFinite(msg.x)) player.x = Math.max(-75, Math.min(75, msg.x));
      if (Number.isFinite(msg.z)) player.z = Math.max(-75, Math.min(75, msg.z));
      if (Number.isFinite(msg.rot)) player.rot = msg.rot;
      broadcastSnapshots();
    } else if (msg.type === 'chat') {
      const text = cleanText(msg.text, 180);
      if (text) broadcast({ type: 'chat', name: player.name, text });
    }
  });

  ws.on('close', () => {
    if (joined) {
      players.delete(id);
      broadcastSnapshots();
    }
  });
});

server.listen(PORT, () => console.log(`Akademi Nusantara online server listening on ${PORT}`));
