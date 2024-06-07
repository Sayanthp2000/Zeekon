const orderStatusAll = document.querySelectorAll('.product-status');

orderStatusAll.forEach((orderStatus) => {
  orderStatus.addEventListener('change', async (event) => {
    const orderId = orderStatus.getAttribute('data-order-id');
    const productId = orderStatus.getAttribute('data-product-id');
    const selectedOption = orderStatus.options[orderStatus.selectedIndex];
    const newStatus = selectedOption.value;

    console.log(orderId, productId);
    console.log(newStatus);

    let orderStatusValue = false, returnedValue = false, orderValidValue = true, pending = false;

    switch (newStatus) {
      case 'arrive':
        orderStatusValue = false;
        returnedValue = false;
        orderValidValue = true;
        break;
      case 'deliver':
        orderStatusValue = true;
        returnedValue = false;
        orderValidValue = false;
        break;
      case 'cancel':
        orderStatusValue = false;
        returnedValue = false;
        orderValidValue = false;
        break;
      case 'return':
        orderStatusValue = false;
        returnedValue = true;
        orderValidValue = false;
        break;
      case 'pending':
        orderStatusValue = false;
        returnedValue = true;
        orderValidValue = false;
        pending: true;
        break;
    }

    const data = { orderStatus: orderStatusValue, returned: returnedValue, orderValid: orderValidValue, pending, orderId, productId };

    console.log(data);

    const response = await fetch('/admin/order-status', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const body = await response.json();
    if(body.error) {
      successMessage(body.error);
    }
    console.log(body);
    window.location.reload();
  });
});



const msgPara = document.querySelector('.msg-para');

const displayError = (result) => {
    const msgPara = document.querySelector('.msg-para');
    msgPara.parentElement.className = 'msg-box-error';
    msgPara.innerHTML = result;
}



const displaySuccess = (result) => {
    const msgPara = document.querySelector('.msg-para');
    msgPara.parentElement.className = 'msg-box-success';
    msgPara.innerHTML = result;
}



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