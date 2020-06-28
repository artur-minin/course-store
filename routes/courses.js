const { Router } = require('express')
const router = Router()

const Course = require('../models/course')

router.get('/', async (req, res) => {
  const courses = await Course.find()
  res.render('courses', { title: 'Courses', isOnCoursesPage: true, courses })
})

router.get('/:id', async (req, res) => {
  const course = await Course.findById(req.params.id)
  res.render('course', {
    layout: 'empty',
    title: course.title,
    course
  })
})

router.get('/edit/:id', async (req, res) => {
  if (!req.query.allow) {
    return res.redirect('/')
  }

  const course = await Course.findById(req.params.id)
  res.render('course-edit', {
    title: `Edit ${course.title}`,
    course
  })
})

router.post('/edit/:id', async (req, res) => {
  await Course.findByIdAndUpdate(req.params.id, req.body)
  res.redirect('/courses')
})

router.post('/delete/:id', async (req, res) => {
  try {
    await Course.deleteOne({ _id: req.params.id })
    res.redirect('/courses')
  } catch (error) {
    console.error(error)
  }
})

module.exports = router
