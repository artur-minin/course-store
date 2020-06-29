const path = require('path')
const mongoose = require('mongoose')
const express = require('express')
const Handlebars = require('handlebars')
const exphbs = require('express-handlebars')
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access')

const homeRoutes = require('./routes/home')
const coursesRoutes = require('./routes/courses')
const courseAddRoutes = require('./routes/course-add')
const cartRoutes = require('./routes/cart')

const User = require('./models/user')
const { use } = require('./routes/course-add')

const app = express()

// Register "Handlebars" as files with "hbs" extension
const hbs = exphbs.create({
  defaultLayout: 'main',
  extname: 'hbs',
  handlebars: allowInsecurePrototypeAccess(Handlebars)
})

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')

// TODO: redo when going to add auth
app.use(async (req, res, next) => {
  try {
    const user = await User.findById('5ef90814e66c6122e07f0b05')
    req.user = user
    next()
  } catch (error) {
    console.error(error)
  }
})

// Register "public" directory as static
app.use(express.static(path.join(__dirname, 'public')))

// Register middleware to parse request's body
app.use(express.urlencoded({ extended: true }))

// Register routes
app.use('/', homeRoutes)
app.use('/courses', coursesRoutes)
app.use('/add-course', courseAddRoutes)
app.use('/cart', cartRoutes)

// Init connection to MongoDB and app
const start = async () => {
  try {
    const urlToDb =
      'mongodb+srv://Artur:78CikJe4409zIUlJ@cluster0-a4iur.mongodb.net/store?w=majority'
    await mongoose.connect(urlToDb, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    })

    //TODO: redo when going to add auth
    const candidate = await User.findOne()
    if (!candidate) {
      const user = new User({
        name: 'testUser',
        email: 'testUser@mail.ru',
        cart: { items: [] }
      })
      await user.save()
    }

    const PORT = process.env.PORT || 3000
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  } catch (error) {
    console.error(error)
  }
}

start()
