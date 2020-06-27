// Format courses' price, placed inside card, on courses page
document.querySelectorAll('.price').forEach(node => {
  node.textContent = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(node.textContent)
})
