
const form = document.querySelector('form');

form.addEventListener('submit', async function(event) {
    event.preventDefault();

    const couponCode = document.getElementById('coupon-code').value;
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    const purchaseAmount = document.getElementById('purchase-amount').value;
    const discountAmount = document.getElementById('discount-amount').value;

    // Create an object with the form data
    const formData = {
        couponCode: couponCode,
        startDate: startDate,
        endDate: endDate,
        purchaseAmount: purchaseAmount,
        discountAmount: discountAmount
    };

    console.log(formData);
    const response = await fetch('/admin/coupon/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    });
    const body = await response.json();
    if(body.error){ failureMessage(body.error) }
    if(body.success){
       successMessage(body.message);
        setTimeout(() => { window.location.href = '/admin/coupon' } , 1000 );
    } 
    console.log(body);
});




const msgPara = document.querySelector('.msg-para'); 

const displayError = (result) => {
   msgPara.parentElement.className = 'msg-box-error';
   msgPara.innerHTML = result;
}

const displaySuccess = (result) => {
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