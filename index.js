const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const app = express()

//ImportingRoutes
const testRoute = require('./routes/auth')
const userRoutes = require('./routes/user')
const postRoutes = require('./routes/post')

//Connecting to MONGODB (Locally)
mongoose.connect('mongodb://localhost:27017/test',{
    useCreateIndex :true,
    useUnifiedTopology: true,
    useNewUrlParser: true

}).then(()=>{
    console.log('DB IS CONNECTED')
})


//Middleware
app.use(bodyParser.json())
app.use(cookieParser())
app.use(cors())

//Routes
app.use('/api',testRoute)
app.use('/api',userRoutes)
app.use('/api/',postRoutes)

//Port
const port = process.env.PORT || 8080

//Running post
app.listen(port, ()=>{
    console.log('SERVER IS RUNNING AT',port)
})


