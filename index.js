require('dotenv').config()
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const app = express()
const xss = require('xss-clean')
const helmet = require("helmet");
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

//ImportingRoutes
const authRoute = require('./routes/auth')
const userRoutes = require('./routes/user')
const postRoutes = require('./routes/post')

//Connecting to MONGODB (Locally)
mongoose.connect( 'mongodb+srv://Tanmay:FicktreeTanmay@146@ficktree.bvlsf.mongodb.net/Ficktree?retryWrites=true&w=majority',{
    useCreateIndex :true,
    useUnifiedTopology: true,
    useNewUrlParser: true

}).then(()=>{
    console.log('DB IS CONNECTED')
})

const limit = rateLimit({
    max: 100,// max requests
    windowMs: 60 * 60 * 1000, // 1 Hour
    message: 'Too many requests' // message to send
});


//Middleware
app.use(express.json({ limit: '100kb' })); // Body limit is 10
app.use(bodyParser.json())
app.use(cookieParser())
app.use(cors())
app.use(xss())
app.use(helmet());
app.use(mongoSanitize());
app.use('/routeName', limit); // Setting limiter on specific route

//Routes


    app.use('/api',authRoute)
    app.use('/api',userRoutes)
    app.use('/api/',postRoutes)


//Port
const port = process.env.PORT || 8080

//Running post
app.listen(port, ()=>{
    console.log('SERVER IS RUNNING AT',port)
})


