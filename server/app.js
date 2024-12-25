const express = require('express')
const app = express()
const port = 3000


const Connection = require('tedious').Connection
const Request = require('tedious').Request

const config = {
  server: 'SERVAN',
  authentication: {
    type: 'default',
    options: {
        userName: 'sa', // update me
        // password: 'your_password', // update me,
    }
  }
}

const connection = new Connection(config)

connection.on('connect', (err) => {
  if (err) {
    console.log(err)
  } else {
    executeStatement()
  }
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})