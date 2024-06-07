document.addEventListener('DOMContentLoaded', () => {

   



    const buttons = document.querySelectorAll('.btn-list, .btn-unlist');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.dataset.productId;
            const action = this.classList.contains('btn-unlist') ? false : true;

            fetch(`/admin/product`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productId, action })
            })
            .then(response => {
                if (response.ok) {
                    // location.reload();
                    console.log('list unlist success');
                    setTimeout(() => location.reload() , 1000 );
                    displaySucess({ message: (action)? 'list product': 'unlist product'})
                } else {
                    return displayError({ message: 'some error 89'})
                }
            })
            .catch(error => {
                console.error('Error:', error);
                return displayError({ message: error });
            });
        });
    });


        // Add an event listener to handle the "Edit" button click
        document.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', function() {
            console.log('you clicked edit button');
            
            const productId = this.getAttribute('data-product-id');
            console.log(productId);
            if(productId){
                window.location.href = `/admin/products/edit/${productId}`
            }

        });
        });
    
    

})






const displayError = (result) => {
    const msgPara = document.querySelector('.msg-para');
    msgPara.parentElement.className = 'display-error';
    msgPara.innerHTML = result.message;
}



const displaySucess = (result) => {
    const msgPara = document.querySelector('.msg-para');
    msgPara.parentElement.className = 'display-success';
    msgPara.innerHTML = result.message;
}