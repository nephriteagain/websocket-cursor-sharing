const Websocket = require('ws')
const express = require('express')
const http = require('http')
const app = express()
const { generateClientId } = require('./helper')

const server = http.createServer(app)

const wss = new Websocket.Server({server})

const cursors = new Map()

function getRandomHexColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

wss.on('connection', ws => {
    const clientId = generateClientId()
    cursors.set(ws, {clientId, color: getRandomHexColor(), coordinates: {x: -200, y:-200}})
    
    ws.on('message', (msg) => {
        const payload = JSON.parse(msg)
        const cursor =  cursors.get(ws)
        if (!cursor) return
        cursor.coordinates = payload
        const cursorsArr = []
        for (const [key,value] of cursors) {                
            if (ws === key) {
                cursorsArr.push({...value, coordinates: payload})
            } else {
                cursorsArr.push(value)
            }
        }
        wss.clients.forEach(client => {            
            client.send(JSON.stringify(cursorsArr))
        })
    })
    ws.on('close', () => {
        console.log('closed')
        cursors.delete(ws)
    })
    //
    let i = 0;
    for (const [key,value] of cursors) {
        i++
        console.log(value?.clientId)
    }
    console.log(`total users ${i}`)
})

server.listen(3000, () => {
    console.log('connected')
})