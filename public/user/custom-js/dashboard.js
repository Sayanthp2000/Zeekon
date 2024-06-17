document.addEventListener('DOMContentLoaded', () => {
  const userDetailsForm = document.querySelector('.user-details-form');

  userDetailsForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formDetails = $('.user-details-form').serialize();
    const response = await fetch('/dashboard/user-details', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formDetails
    });
    const data = await response.json();
    if (data.error) {
      return failureMessage(data.error);
    } else if (data.success) {
      return successMessage(data.message);
    }
  });

  const addressForm = document.querySelector('[address-add]');

  addressForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = {};
    const landmark = document.querySelector('.landmark');
    const userId = event.target.dataset.userId;

    for (const input of event.target.elements) {
      if (input.tagName !== 'INPUT' || !input.name) continue;
      formData[input.name] = input.value;
    }
    formData[landmark.name] = landmark.value;

    try {
      const response = await fetch(`/address/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const body = await response.json();
      if (body.error) {
        return failureMessage(body.error);
      } else if (body.success) {
        successMessage(body.message);
        setTimeout(() => window.location.href = '/dashboard', 1000);
      }
    } catch (err) {
      console.log(err);
    }
  });

 

  const deleteBtn = document.querySelectorAll('.btn-delete')

deleteBtn.forEach( button => {
    button.addEventListener('click', async (event) => {
        try{
            // event.Propagation();
            const addressId = button.getAttribute('data-address-id');
            if(addressId){
                const confi = await confirmIt('are you sure, you want to delete the address', 'Delete');
                if(!confi.isConfirmed) return;
            }
            const response = await fetch(`/address/${addressId}`,{ method: 'DELETE'})
            const body = await response.json()
            if(body.success){
                successMessage(body.message);
                setTimeout(() => window.location.href = '/dashboard', 1000);
            }else {
                failureMessage(body.error);
            }
        }catch(err){
            console.error(err);
        }
    })
});

  const navLinks = document.querySelectorAll('.nav-link');
  const editDiv = document.querySelector('[edit-div]');
  const editButtons = document.querySelectorAll('.btn-edit');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const editLink = document.querySelector('[edit-link]');
  const editAddress = document.querySelector('[address-edit]');

     

editButtons.forEach(button => {
  button.addEventListener('click', async (event) => {
      try {
          const addressId = button.getAttribute('data-address-id');
          const index = button.getAttribute('data-index');
          
          const confi = await confirmIt('Are you sure you want to edit this address?', 'Edit');
          if (!confi.isConfirmed) return;

          tabPanes.forEach( item => item.classList.remove('show', 'active'));
          editDiv.classList.add('show', 'active');
          navLinks.forEach( item => item.classList.remove('active'));
          editLink.setAttribute('aria-selected', 'true');
          editLink.classList.add('active')

          const response = await fetch(`/address/edit/${addressId}`);
          
          // Parse JSON response
          const body = await response.json();
          for (const key in body) {
              if (body.hasOwnProperty(key)) {
                  const value = body[key];
                  const inputElement = document.getElementById(key);
                  if (inputElement) {
                      inputElement.value = value;
                  }
              }
          }
          const landmark = document.querySelector('#landmark');
          landmark.value = body.landmark;

          editAddress.addEventListener('submit', async (event) => {
              event.preventDefault();
              try{
                  const formData = {};
                  const userId = event.target.dataset.userId;

                  for (const input of event.target.elements) {
                      if (input.tagName !== 'INPUT' || !input.name) {
                          continue;
                      }
                      formData[input.name] = input.value;
                  }
                  formData[landmark.name] = landmark.value;
              
                      const responseUpdate = await fetch(`/address/update/${addressId}/${userId}`, {
                          method: 'PATCH',
                          headers: {
                              'Content-Type': 'application/json'
                          },
                          body: JSON.stringify(formData)
                      })
                      const bodyupdate = await responseUpdate.json()
                      if(bodyupdate.error){
                          return failureMessage(bodyupdate.error);
                      }
                      if(bodyupdate.success){
                          successMessage(bodyupdate.message);
                          setTimeout(() => window.location.href = '/dashboard', 1000);
                      }
              }catch(err){
                  console.log(err);
              }
          })

      } catch (err) {
          console.log(err);
      }
  });
});








  const addAddressLink = document.querySelector('.add-address-link');
  const addLink = document.querySelector('[add-link]');
  const addDiv = document.querySelector('[add-div]');

  addAddressLink.addEventListener('click', () => {
    tabPanes.forEach(item => item.classList.remove('show', 'active'));
    addDiv.classList.add('show', 'active');
    navLinks.forEach(item => item.classList.remove('active'));
    addLink.setAttribute('aria-selected', 'true');
    addLink.classList.add('active');
  });



  const orderBoxes = document.querySelectorAll('.order-box');

  orderBoxes.forEach(orderBox => {
    orderBox.addEventListener('click', () => {
      const orderId = orderBox.getAttribute('data-order-id');
      window.location.href = `/order/${orderId}`;
    });
  });

  function confirmIt(message, confirmText) {
    return Swal.fire({
      text: message,
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: confirmText,
      position: "top",
      customClass: {
        actions: 'custom-actions-class'
      }
    });
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
  }

  const btnWallet = document.querySelector('.btn-wallet');
  btnWallet.addEventListener('click', (event) => {
    const amount = document.querySelector('#wallet-amount').value;
    if (amount <= 0) {
      return failureMessage('Amount must be greater than zero');
    }
    const userId = event.target.getAttribute('data-user-id');
    razorpay(userId, +amount);
  });

  function razorpay(userId, amount) {
    try {
      $(document).ready(() => {
        $.ajax({
          url: "/create/orderId",
          method: "POST",
          data: JSON.stringify({ amount: amount * 100 }),
          contentType: "application/json",
          success: (response) => {
            const orderId = response.orderId;
            $("button").show();

            const options = {
              key: "rzp_test_qmorekoe705NBG",
              amount: amount * 100,
              currency: "INR",
              name: "Zeekon",
              description: "Test Transaction",
              image: "https://example.com/your_logo",
              order_id: orderId,
              handler: () => {
                addWalletAmount(userId, amount);
              },
              prefill: {
                name: "Sayanth P",
                email: "Sayanthp.example@gmail.com",
                contact: "0000000000"
              },
              notes: {
                address: "Razorpay Corporate Office"
              },
              theme: {
                color: "#3399cc"
              }
            };

            const rzp1 = new Razorpay(options);

            rzp1.on('payment.failed', () => {
              failureMessage('Payment Failed');
            });

            rzp1.on('payment.error', (response) => {
              failureMessage('Payment error');
              console.log('Payment error:', response.error);
            });

            rzp1.open();
          }
        });
      });
    } catch (err) {
      alertMessageError(err);
    }
  }

  async function addWalletAmount(userId, amount) {
    try {
      const response = await fetch(`/wallet/${userId}/${amount}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const body = await response.json();
      if (body.error) {
        return failureMessage(body.error);
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.log(err);
    }
  }
});
