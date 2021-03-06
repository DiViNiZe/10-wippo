require('dotenv').config()

const next = require('next')
const path = require('path')
const routes = require('./routes')

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })

const handle = routes.getRequestHandler(app)

const express = require('express')

app.prepare()
  .then(() => {
    const server = express()

    server.get('/robot.txt', (req, res) => {
      return res.sendFile(path.join(__dirname, './static', 'robot.txt'))
    })

    server.get('/static/img/favicon/*', (req, res) => {
      return res.sendFile(path.join(__dirname, req.url))
    })

    server.use(handle).listen(port, (err) => {
      if (err) throw err
      console.log(`> Ready on http://localhost:${port}`)
    })
  })
