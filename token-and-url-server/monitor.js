// Start the local server in watch mode restarting it self everytime a js file changed.
// Then creates a ngrok tunnel to make it available for development.
if (process.env.NODE_ENV === 'production') {
  throw new Error("Do not use nodemon in production, run bin/www.js directly instead");
}
require('dotenv').config()
const nodemon = require('nodemon');
const ngrok = require('ngrok');
const port = process.env.HTTP_PORT || 3000
  
nodemon({
  script: 'index.js',
  ext: 'js json env'
})

let url = null

nodemon.on('start', async () => {
  if (!url) {
    url = await ngrok.connect({ port: port })
    console.log(`Server now available at ${url}`)
  }
}).on('quit', async () => {
  await ngrok.kill()
})