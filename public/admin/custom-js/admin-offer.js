const offerItemHeadings = document.querySelectorAll('.offer-item-heading');
const offerItemSections = document.querySelectorAll('.offer-item-section');

offerItemHeadings.forEach((heading, index) => {
  heading.addEventListener('click', () => {
    offerItemHeadings.forEach(heading => heading.classList.remove('active'));
    offerItemSections.forEach(section => section.classList.add('hidden'));
    heading.classList.add('active');
    offerItemSections[index].classList.remove('hidden');
  });
});


// const btnProductOffer = document.querySelector('#btn-product-offer');
// btnProductOffer.addEventListener('click', () => {

// });

const productOfferForm = document.querySelector('#product-offer-form');
productOfferForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  // Get form data
  const formData = {
    product: productOfferForm.elements.product.value,
    offerType: productOfferForm.elements['offer-type'].value,
    offerValue: productOfferForm.elements.value.value,
    startDate: productOfferForm.elements.startDate.value,
    endDate: productOfferForm.elements.endDate.value,
    description: productOfferForm.elements.description.value,
  };

  const response = await fetch('/admin/offer-module', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });
  const body = await response.json();
  if(body.error) {
    failureMessage(body.error);
  }else if( body.success) {
    successMessage(body.message);
    setTimeout(() => window.location.reload() , 2000);
  }else {
    alert('something else happens');
  }

});


const categoryOfferForm = document.querySelector('#category-offer-form');
categoryOfferForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  // Get form data
  const formData = {
    category: categoryOfferForm.elements.category.value,
    offerType: categoryOfferForm.elements['offer-type'].value,
    offerValue: categoryOfferForm.elements.value.value,
    startDate: categoryOfferForm.elements.startDate.value,
    endDate: categoryOfferForm.elements.endDate.value,
    description: categoryOfferForm.elements.description.value,
  };


  const response = await fetch('/admin/offer-module', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });
  const body = await response.json();
  if(body.error) {
    failureMessage(body.error);
  }else if( body.success) {
    successMessage(body.message);
    setTimeout(() => window.location.reload() , 2000);
  }else {
    alert('something else happens');
  }

});



const deleteBtns = document.querySelectorAll('.btn-delete');
deleteBtns.forEach( deleteBtn => {
  deleteBtn.addEventListener('click', async (event) => {
    const offerId = deleteBtn.getAttribute('data-offer-id');
    const response = await fetch(`/admin/offer/delete/${offerId}`, { method: 'DELETE' });
    const body = await response.json();
    if(body.error) failureMessage(body.error);
    else {
      successMessage(body.message);
      const tr = deleteBtn.closest('tr');
      tr.remove();
    }

  });
})






function successMessage(message) {
  Swal.fire({
    text: message,
    position: 'top',
    timer: 2000,
    background: 'green',
    color: 'white',
    showConfirmButton: false
  });
  return;
}


function failureMessage(message) {
  Swal.fire({
    text: message,
    position: 'top',
    timer: 2000,
    background: 'red',
    color: 'white',
    showConfirmButton: false
  });
  return;
}