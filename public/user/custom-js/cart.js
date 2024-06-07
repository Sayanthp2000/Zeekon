const cartItemNum = document.querySelectorAll('.quantityInput');

cartItemNum.forEach( item => {
    item.addEventListener('input', async (event) => {
        const nums = item.value;
        const productId = event.target.dataset.productId;
        const userId = event.target.dataset.userId;
        console.log(nums);
        console.log(productId);
        console.log(userId);
        const response = await fetch(`/cart/product/${userId}/${productId}/${nums}`,{
            method: 'PATCH'
        })
        const body = await response.json();
        console.log(body);
        if(body.success) successMessage(body.message);
        else if(body.error){
            failureMessage(body.error);
            event.target.max = body.productQuantity;
        } 
    });
});




document.querySelectorAll('.remove-col').forEach(tdElement => {
    tdElement.addEventListener('click', async (event) => {
        // Prevent the default action if it's a link or button
        event.preventDefault();

        // Get the product ID from the closest element with the data attribute
        const productId = event.target.closest('.btn-remove').dataset.productId;

        // Show confirmation dialog using SweetAlert2
        Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to remove this product from the cart?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, remove it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                // Proceed with deletion if confirmed
                const response = await fetch(`/cart/delete/${productId}`, {
                    method: 'PATCH'
                });
                const body = await response.json();
                console.log(body);
                if (body.success) {
                    Swal.fire(
                        'Removed!',
                        'Product has been removed from your cart.',
                        'success'
                    );
                    setTimeout(() => window.location.reload(), 2000);
                } else if (body.error) {
                    Swal.fire(
                        'Error!',
                        body.error,
                        'error'
                    );
                }
            }
        });
    });
});





const radioButtons = document.querySelectorAll('[select-address]');

radioButtons.forEach(radio => {
    radio.addEventListener('change', (event) => {
        if (event.target.checked) {
            // const selectedAddress = event.target.value;
            let addressId = event.target.dataset.addressId;
            if(!addressId || addressId === '') addressId = "new";
            console.log(addressId);
            fetch(`/address/preffered/${addressId}`)
                .then((response) => response.json())
                .then(body => {
                    if(body.success) successMessage(body.success);
                    else if(body.error) failureMessage(body.error);
                })
                .catch( err => console.log(err))
        }
    });
});








const alertMessageError = document.getElementById('alertMessageError');
const alertMessageSuccess = document.getElementById('alertMessageSuccess');

function showAlertError(message) {
    alertMessageError.innerText = message;
    alertMessageError.style.display = 'block';
  setTimeout(() => {
    alertMessageError.style.display = 'none';
  }, 3000); 
}


function showAlertSuccess(message) {
    alertMessageSuccess.innerText = message;
    alertMessageSuccess.style.display = 'block';
    setTimeout(() => {
        alertMessageSuccess.style.display = 'none';
    }, 3000); 
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
document.addEventListener('DOMContentLoaded', function() {
    const quantityInputs = document.querySelectorAll('.quantityInput');
    const subtotalElement = document.querySelector('.summary-subtotal td:nth-child(2)');
    const totalElement = document.querySelector('.summary-total td:nth-child(2)');
    // const deliveryCharge = parseFloat(totalElement.textContent) - parseFloat(subtotalElement.textContent);
    const initialSubtotal = parseFloat(subtotalElement.textContent.replace('₹', '')) || 0;
    const initialTotal = parseFloat(totalElement.textContent.replace('₹', '')) || 0;
    const deliveryCharge = initialTotal - initialSubtotal;
    

    quantityInputs.forEach(input => {
        input.addEventListener('change', handleQuantityChange);
    });

    function handleQuantityChange(event) {
        const input = event.target;
        const productId = input.dataset.productId;
        const userId = input.dataset.userId;
        const newQuantity = parseInt(input.value);

        if (isNaN(newQuantity) || newQuantity < 1) {
            input.value = 1;
            return;
        }

        updateCartOnServer(productId, userId, newQuantity);
    }

    function updateCartOnServer(productId, userId, newQuantity) {
        fetch(`/cart/product/${userId}/${productId}/${newQuantity}`, {
            method: 'PATCH'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const input = document.querySelector(`.quantityInput[data-product-id="${productId}"]`);
                const row = input.closest('tr');
                const priceElement = row.querySelector('.price-col');
                const totalElement = row.querySelector('.total-col');

                // const price = parseFloat(priceElement.textContent);
                const price = parseFloat(priceElement.textContent.replace('₹', '')) || 0;
                const newTotal = price * newQuantity;

                // totalElement.textContent = newTotal.toFixed(2);
                totalElement.textContent = `₹${newTotal.toFixed(2)}`;

                updateCartTotals();
                successMessage(data.message);
            } else if (data.error) {
                failureMessage(data.error);
                const input = document.querySelector(`.quantityInput[data-product-id="${productId}"]`);
                input.value = data.productQuantity;
            }
        })
        .catch(error => console.error('Error:', error));
    }

    function updateCartTotals() {
        let subtotal = 0;
        document.querySelectorAll('.total-col').forEach(totalElement => {
            // subtotal += parseFloat(totalElement.textContent);
            subtotal += parseFloat(totalElement.textContent.replace('₹', '')) || 0;
        });

        // subtotalElement.textContent = subtotal.toFixed(2);
        // const total = subtotal + deliveryCharge;
        // totalElement.textContent = total.toFixed(2);

        subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
        const total = subtotal + deliveryCharge;
        totalElement.textContent = `₹${total.toFixed(2)}`;
    }

    function successMessage(message) {
        toastr.success(message);
    }

    function failureMessage(message) {
        toastr.error(message);
    }
});






