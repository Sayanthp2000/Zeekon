
const checkoutForm = document.querySelector('#checkout-order');
let selectPaymentMethod = 'payment-1';
var formData = {};
var userId;
let deliveryCharge = ( productTotal < 500 ) ? 50 : 0;
productTotal = parseInt(productTotal) + parseInt(deliveryCharge);
var originalPrice = productTotal;
console.log(deliveryCharge, originalPrice);
let couponApplied = false, confi = false;
var discountPrice = 0;

checkoutForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  
  const landmark = document.querySelector('.landmark');
  const orderNotes = document.querySelector('.order-notes');
  

    userId = event.target.dataset.userId;

    for (const input of event.target.elements) {
        if (input.tagName !== 'INPUT' || !input.name) {
            continue;
        }
        formData[input.name] = input.value;
    }
    formData[landmark.name] = landmark.value;
    formData[orderNotes.name] = orderNotes.value;

    try{
        if(selectPaymentMethod === 'payment-1'){
          console.log('payment number 1 - COD');
          formData.paymentMethod = 'COD';
          console.log(formData);
          checkoutSend(userId, formData)
        }else if(selectPaymentMethod === 'payment-2'){
            console.log('Inside payment method 2');
            formData.paymentMethod = 'razorpay';
            const searchParams = new URLSearchParams(formData);
            const response = await fetch(`/checkout-validation?${searchParams.toString()}`);
            const body = await response.json();
            console.log(body);
            if(body.error) return failureMessage(body.error);
            await razorpay();
            console.log('after razorpay in checkoujs')
        }else if(selectPaymentMethod === 'payment-3'){
            console.log('paymentMethod is wallet');
            formData.paymentMethod = 'wallet';
            checkoutSend(userId, formData);
        }else {
            console.log('some problems here');
            failureMessage('select a payment method to continue');
        }
    }catch(err){
        console.log(err);
    }
});
async function checkoutSend(userId, formData, orderId) {
  formData.orderId = orderId;
  try {
    const response = await fetch(`/checkout/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    const body = await response.json();
    if (body.error) {
      return failureMessage(body.error);
    } else {
      successMessage('Order was successful');
      setTimeout(() => window.location.href = '/dashboard', 2000);
    }
  } catch (err) {
    console.log(err);
  }
}


async function rzrErrorOrderPending(userId, orderId ) {
  try {
    formData.orderId = orderId;
    const response = await fetch(`/checkout-error/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    const body = await response.json();
    if (body.error) {
      return failureMessage(body.error);
    } else {
      failureMessage('Payment was unsuccessful, you can countinue it from orders page.');
      setTimeout(() => window.location.href = '/dashboard', 2000 );
    }
  } catch (err) {
    console.log(err);
  }
}




const paymentOptions = document.querySelectorAll('[select-payment-method]');
paymentOptions.forEach( option => {
    option.addEventListener('click', (event) => {
        console.log(event);
        selectPaymentMethod = option.id;
        if(selectPaymentMethod == 'payment-1'){
            console.log('cod');
        }else if(selectPaymentMethod == 'payment-2'){
            console.log('bank');
        }else if(selectPaymentMethod == 'payment-3'){
            console.log('wallet');
        }else {
            console.log('please select a payment method');
        }
    });
});



const btnApplyCoupon = document.querySelector('.btn-apply-coupon');
btnApplyCoupon.addEventListener('click', async function(event) {
  // const response = await fetch('/checkout/apply-coupon');

  const couponCode = document.querySelector('#checkout-discount-input').value;

    if((couponCode || couponCode !== '') && !couponApplied ){
      console.log(couponCode);
      const responseCoupon = await fetch(`/coupon/check/${couponCode}/${productTotal}`);
      const bodyCoupon = await responseCoupon.json();
      console.log(bodyCoupon)
      if(!bodyCoupon.status) failureMessage(bodyCoupon.error);
      if(bodyCoupon.status){
        couponApplied = true;
        discountPrice = productTotal - bodyCoupon.discountPrice;
        formData.discountPrice = discountPrice ;
        formData.couponApplied = true;
        formData.couponCode = couponCode;
        productTotal = bodyCoupon.discountPrice;
        successMessage(`you got a discount of ${originalPrice - productTotal}`);
        document.querySelector('#totalPrice').innerHTML = `₹${ (originalPrice - discountPrice) }`;
        const summerTotal = document.querySelector('.summary-total');
        const tr = `<tr class="tr-coupon">
                      <td>couponOffer </td>
                      <td>- $${bodyCoupon.couponOffer}</td>
                    </tr>
                    <tr class="tr-coupon" ><td colspan="2"><button class="btn btn-warning remove-coupon container-fluid" onclick="removeCoupon()" type="button" data-coupon-code="${bodyCoupon.couponOffer}"> Remove ${bodyCoupon.couponCode} </button></td></tr>`
        summerTotal.insertAdjacentHTML('beforebegin', tr);
      } 
    }else if(!couponCode || couponCode == "" ) return failureMessage('Enter coupon code');
    else if(couponApplied) failureMessage('A coupon is already applied, remove it to use another');
});


async function removeCoupon() {
  console.log('Indie the dksks');
  console.log(formData.couponCode);
  const response = await fetch(`/remove-coupon/${formData.couponCode}`);
  const body = await response.json();
  console.log(body);
  if(body.error) failureMessage(body.error);
  else {
    successMessage(body.message);
    const couponRows = document.querySelectorAll('.tr-coupon');
    couponRows.forEach(row => row.remove());
    document.querySelector('#totalPrice').innerHTML = `₹${ originalPrice }`;
    productTotal = originalPrice;
    formData.discountPrice = 0;
    formData.couponApplied = false;
    couponApplied = false
  }
}


function confirmIt( message, btnText ) {
  const result = Swal.fire({
    text: message,
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: btnText || "OK",
    position: "top",
    customClass: {
      actions: 'custom-actions-class'
    }
  });
  return result;
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



  


async function razorpay(){
console.log(productTotal)
$(document).ready(function() {
    $.ajax({
      url: "/create/orderId",
      method: "POST",
      data: JSON.stringify({ amount: productTotal*100 }),
      contentType: "application/json",
      success: function(response) {
        orderId = response.orderId;
        console.log(orderId);
        console.log(productTotal);
        $("button").show();
  
        var options = {
          "key": "rzp_test_qmorekoe705NBG",
          "amount": productTotal*100,
          "currency": "INR",
          "name": "Zeekon",
          "description": "Test Transaction",
          "image": "https://example.com/your_logo",
          "order_id": orderId,
          "handler": function(response) {
            console.log(response.razorpay_payment_id);
            console.log(response.razorpay_order_id);
            console.log(response.razorpay_signature);
            checkoutSend( userId, formData, orderId );
          },
          "prefill": {
            "name": "Sayanth P",
            "email": "sayanth.example@gmail.com",
            "contact": "0000000000"
          },
          "notes": {
            "address": "Razorpay Corporate Office"
          },
          "theme": {
            "color": "#3399cc"
          }
        };
  
        var rzp1 = new Razorpay(options);

        rzp1.on('payment.failed', async function(response) {
          console.log('payment failed');
          failureMessage('Payment Failed');
          console.log(response.error.code);
          console.log(response.error.description);
          console.log(response.error.source);
          console.log(response.error.step);
          console.log(response.error.reason);
          console.log(response.error.metadata.order_id);
          console.log(response.error.metadata.payment_id);
          const confi = await confirmIt("Payment Failed, Save it as Pending in Order's page, or continue with other payment methods", "save as pending")
          console.log(confi);
          if(confi.isConfirmed) {
            await rzrErrorOrderPending(userId, response.error.metadata.order_id );
          }else return;
        });

        rzp1.on('payment.error', function (response) {
          console.log('Payment error:', response.error);
        });

        rzp1.open();
      }
    });
  });
  return true;
}

