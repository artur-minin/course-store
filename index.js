const express = require('express')
const exphbs = require('express-handlebars')

const homeRoutes = require('./routes/home')
const coursesRoutes = require('./routes/courses')
const addCourseRoutes = require('./routes/addCourse')

const app = express()

// Register "Handlebars" as files with "hbs" extension
const hbs = exphbs.create({
  defaultLayout: 'main',
  extname: 'hbs'
})

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')

// Register "public" directory as static
app.use(express.static('public'))

// Register middleware to parse request's body
app.use(express.urlencoded({ extended: true }))

// Register routes
app.use('/', homeRoutes)
app.use('/courses', coursesRoutes)
app.use('/add-course', addCourseRoutes)

const PORT = process.env.PORT || 3000

app.listen(3000, () => {
  console.log(`Server is running on port ${PORT}`)
})
