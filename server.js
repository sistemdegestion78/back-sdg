const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })
const app = require('./src/app')
const { connectDB } = require('./src/config/db')
const PORT = process.env.PORT || 4000

if (require.main === module) {
  connectDB()
    .then(() => {
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`Servidor en http://0.0.0.0:${PORT}`)
      })
    })
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}

module.exports = app
