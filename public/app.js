const toCurrency = price => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price)
}

// Format courses' price, placed inside card, on courses page
document.querySelectorAll('.price').forEach(node => {
  node.textContent = toCurrency(node.textContent)
})

const $cart = document.querySelector('#cart')

if ($cart) {
  $cart.addEventListener('click', event => {
    if (event.target.classList.contains('js-remove')) {
      const courseId = event.target.dataset.id

      fetch(`/cart/remove/${courseId}`, {
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
                  <button class="btn btn-small js-remove" data-id="${course.id}">Delete</button>
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
