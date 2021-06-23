const express = require('express')
const exphbs = require('express-handlebars')
const path = require('path')

const app = express()
require('dotenv').config()

app.engine('handlebars', exphbs({
  defaultLayout: 'main' // Specify default template views/layout/main.handlebar
}))
app.set('view engine', 'handlebars')

app.use(express.static(path.join(__dirname, 'public')))

const mainRoute = require('./routes/main')
const userRoute = require('./routes/user')
const propertyRoute = require('./routes/property')

app.use('/', mainRoute)
app.use('/user', userRoute)
app.use('/property', propertyRoute)

const port = process.env.port || 5000

app.listen(port, () => {
  console.log(`Server started ad ${port}`)
})
