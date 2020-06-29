const toDate = date => {
  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    second: '2-digit',
    minute: '2-digit',
    hour: '2-digit'
  }).format(new Date(date))
}

const toCurrency = price => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price)
}

// Format dates
document.querySelectorAll('.date').forEach(node => {
  node.textContent = toDate(node.textContent)
})

// Format prices
document.querySelectorAll('.price').forEach(node => {
  node.textContent = toCurrency(node.textContent)
})

// Handler for delete item button in the cart
const $cart = document.querySelector('#cart')

if ($cart) {
  $cart.addEventListener('click', event => {
    if (event.target.classList.contains('js-delete')) {
      const courseId = event.target.dataset.id

      fetch(`/cart/delete/${courseId}`, {
        method: 'delete'
      })
        .then(res => res.json())
        .then(cart => {
          if (cart.courses.length) {
            const html = cart.courses
              .map(course => {
                return `
              <tr>
                <td>${course.title}</td>
                <td>${course.count}</td>
                <td>${course.price}</td>
                <td>
                  <button class="btn btn-small js-delete" data-id="${course._id}">Delete</button>
                </td>
              </tr>
              `
              })
              .join('')

            $cart.querySelector('tbody').innerHTML = html
            $cart.querySelector('.price').textContent = toCurrency(cart.totalPrice)
          } else {
            $cart.innerHTML = '<p class="center-align fz2rem">Cart is empty</p>'
          }
        })
    }
  })
}
