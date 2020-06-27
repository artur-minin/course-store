const express = require('express')
const exphbs = require('express-handlebars')

const homePageRoutes = require('./routes/homePage')
const coursesPageRoutes = require('./routes/coursesPage')
const addCoursePageRoutes = require('./routes/addCoursePage')

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

// Register routes
app.use('/', homePageRoutes)
app.use('/courses', coursesPageRoutes)
app.use('/add', addCoursePageRoutes)

const PORT = process.env.PORT || 3000

app.listen(3000, () => {
  console.log(`Server is running on port ${PORT}`)
})
