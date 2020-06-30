const path = require('path')
const mongoose = require('mongoose')
const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongodb-session')(session)
const Handlebars = require('handlebars')
const exphbs = require('express-handlebars')
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access')

const homeRoutes = require('./routes/home')
const coursesRoutes = require('./routes/courses')
const courseAddRoutes = require('./routes/course-add')
const cartRoutes = require('./routes/cart')
const orderRoutes = require('./routes/order')
const authRoutes = require('./routes/auth')

const variablesMiddleware = require('./middlewares/variables')
const userMiddleware = require('./middlewares/user')

const app = express()

const DB_URI = 'mongodb+srv://Artur:78CikJe4409zIUlJ@cluster0-a4iur.mongodb.net/store?w=majority'

// Add session data to DB
const store = new MongoStore({
  uri: DB_URI,
  collection: 'sessions'
})

app.use(
  session({
    secret: 'secret value',
    resave: false,
    saveUninitialized: false,
    store
  })
)

// Add variables to request object
app.use(variablesMiddleware)

// Add user data to request object
app.use(userMiddleware)

// Register "Handlebars" as files with "hbs" extension
const hbs = exphbs.create({
  defaultLayout: 'main',
  extname: 'hbs',
  handlebars: allowInsecurePrototypeAccess(Handlebars)
})

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')

// Register "public" directory as static
app.use(express.static(path.join(__dirname, 'public')))

// Register middleware to parse request's body
app.use(express.urlencoded({ extended: true }))

// Register routes
app.use('/', homeRoutes)
app.use('/courses', coursesRoutes)
app.use('/add-course', courseAddRoutes)
app.use('/cart', cartRoutes)
app.use('/order', orderRoutes)
app.use('/auth', authRoutes)

// Init connection to MongoDB and app
const start = async () => {
  try {
    await mongoose.connect(DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    })

    const PORT = process.env.PORT || 3000
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  } catch (error) {
    console.error(error)
  }
}

start()
