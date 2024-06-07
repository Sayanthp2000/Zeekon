console.log("file loaded");
const btnCart = document.querySelectorAll('.btn-add-cart');

btnCart.forEach(aElement => {
    aElement.addEventListener('click', async (event) => {
        event.preventDefault();
        console.log("button clicked");
        const clickedElement = event.target.tagName.toLowerCase();
        let productId = aElement.getAttribute('data-product-id');
        if (clickedElement === 'span') {
            const parentElement = event.target.parentNode;
            productId = parentElement.getAttribute('data-product-id');
        }

        const quantityElement = document.querySelector('#qty');
        const quantity = quantityElement ? quantityElement.value : 1; // Default to 1 if #qty element not found
        console.log('product Id:', productId);
        console.log('quantity:', quantity);

        try {
            const response = await fetch(`/cart/${productId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ quantity })
            });

            if (!response.ok) {
                const errorBody = await response.json();
                throw new Error(errorBody.error || 'Network response was not ok');
            }

            const body = await response.json();
            console.log('Response body:', body);

            if (body.redirect) {
                showAlertError(body.error);
                setTimeout(() => window.location.href = body.redirect, 1000);
            } else if (body.success) {
                showAlertSuccess(body.message);
                setTimeout(() => window.location.href = body.redirect, 1000);
            } else if (body.error) {
                showAlertError(body.error);
            }
        } catch (error) {
            console.error('Error:', error.message);
            showAlertError(error.message);
        }
    });
});

document.querySelectorAll('.btn-wishlist').forEach(item => {
    item.addEventListener('click', async (event) => {
        event.preventDefault();
        event.stopPropagation();

        const productId = event.currentTarget.getAttribute('data-product-id');
        console.log(productId);

        try {
            const response = await fetch(`/wishlist/${productId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorBody = await response.json();
                throw new Error(errorBody.error || 'Network response was not ok');
            }

            const result = await response.json();
            console.log(result);
            if (result.success) {
                showAlertSuccess(result.message);
            } else if (result.redirect) {
                showAlertError(result.error);
                setTimeout(() => window.location.href = result.redirect, 1000);
            } else {
                showAlertError(result.error);
            }
        } catch (error) {
            console.error('Error:', error.message);
            showAlertError(error.message);
        }
    });
});

function initializeZoom() {
    $('#product-zoom').elevateZoom({
        zoomType: 'inner',
        cursor: 'crosshair',
        zoomWindowFadeIn: 500,
        zoomWindowFadeOut: 750
    });
}

// Call initializeZoom() when the DOM has finished loading
$(document).ready(function() {
    initializeZoom();
});

const alertMessageError = document.getElementById('alertMessageError');
const alertMessageSuccess = document.getElementById('alertMessageSuccess');

function showAlertError(message) {
    console.log('showAlertError:', message);
    if (alertMessageError) {
        alertMessageError.innerText = message;
        alertMessageError.style.display = 'block';
        setTimeout(() => {
            alertMessageError.style.display = 'none';
        }, 3000);
    } else {
        console.error('Error element not found');
    }
}

function showAlertSuccess(message) {
    console.log('showAlertSuccess:', message);
    if (alertMessageSuccess) {
        alertMessageSuccess.innerText = message;
        alertMessageSuccess.style.display = 'block';
        setTimeout(() => {
            alertMessageSuccess.style.display = 'none';
        }, 3000);
    } else {
        console.error('Success element not found');
    }
}

console.log("product js file loaded");
