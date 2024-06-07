
const deleteCouponBtns = document.querySelectorAll('#coupon-remove');
deleteCouponBtns.forEach(( button ) => {
    button.addEventListener('click', async (event) => {
        const confi = await confirmIt('Are you sure you want to delete the coupon', 'YES');
        if(!confi) return;
        const couponId = event.target.getAttribute('data-coupon-id');
        console.log(couponId);
        const response = await fetch(`/admin/coupon/delete/${couponId}`, { method: 'DELETE' });
        const body = await response.json();
        console.log(body) 
        if(body.success) window.location.reload();
        else failureMessage(body.error);
    })
})




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


  function confirmIt( message, confirmText ) {
    const result = Swal.fire({
      text: message,
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: confirmText || "OK",
      position: "top",
      customClass: {
        actions: 'custom-actions-class'
      }
    });
    return result;
  };