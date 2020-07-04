const path = require('path')
const csrf = require('csurf')
const flash = require('connect-flash')
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
const errorHandler = require('./middlewares/error')

const keys = require('./keys')

const app = express()

// Add session data to DB
const store = new MongoStore({
  uri: keys.DB_URI,
  collection: 'sessions'
})
// Register "Handlebars" as files with "hbs" extension
const hbs = exphbs.create({
  defaultLayout: 'main',
  extname: 'hbs',
  handlebars: allowInsecurePrototypeAccess(Handlebars),
  helpers: require('./utils/hbs.helpers')
})

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')

// Register "public" directory as static
app.use(express.static(path.join(__dirname, 'public')))
// Register middleware to parse request's body
app.use(express.urlencoded({ extended: true }))
app.use(
  session({
    secret: keys.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store
  })
)
app.use(csrf())
app.use(flash())
// Add variables to request object
app.use(variablesMiddleware)
// Add user data to request object
app.use(userMiddleware)

// Register routes
app.use('/', homeRoutes)
app.use('/courses', coursesRoutes)
app.use('/add-course', courseAddRoutes)
app.use('/cart', cartRoutes)
app.use('/order', orderRoutes)
app.use('/auth', authRoutes)

// Must be declared at the end
app.use(errorHandler)

// Init connection to MongoDB and app
const start = async () => {
  try {
    await mongoose.connect(keys.DB_URI, {
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
