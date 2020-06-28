const { Router } = require('express')
const router = Router()

const Course = require('../models/course')
const Cart = require('../models/cart')

router.get('/', async (req, res) => {
  const cart = await Cart.fetch()
  res.render('cart', {
    title: 'Cart',
    isOnCartPage: true,
    courses: cart.courses,
    totalPrice: cart.totalPrice
  })
})

router.post('/add', async (req, res) => {
  const course = await Course.getById(req.body.id)
  await Cart.add(course)

  res.redirect('/cart')
})

router.delete('/delete/:id', async (req, res) => {
  const cart = await Cart.delete(req.params.id)
  res.status(200).json(cart)
})

module.exports = router
