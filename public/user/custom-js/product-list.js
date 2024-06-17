// const cartButtons = document.querySelectorAll('.cart-button');

// cartButtons.forEach( btnCart => {
//     btnCart.addEventListener('click', async (event) => {
//         const productId = event.currentTarget.dataset.productId;
//         const response = await fetch(`/cart/${productId}`, {
//             method: 'PATCH',
//         })
//         const body = await response.json();
//         if(body.rdt){
//             window.location.href = `/${body.rdt}`;
//         }
//         if(body.redirect) {
//             failureMessage(body.error);
//             setTimeout(() => window.location.href = body.redirect, 1000)
//         } else if(body.error){
//             failureMessage(body.error);
//         }
//         if(body.message){
//             successMessage(body.message);
//         }
//     })
// })



let userSelectOption;
document.querySelector('#sortby').addEventListener('change', async (event) => {
    userSelectOption = event.target.value;
})



const categories = document.querySelector('.filter-items');
const categoryItems = [];

categories.addEventListener('change', (event) => {
  if(event.target.tagName === 'INPUT' && event.target.type === 'checkbox') {
		if(event.target.checked) {
            categoryItems.push(event.target.dataset.categoryId);
        } else {
			categoryItems.splice(categoryItems.indexOf(event.target.dataset.categoryId), 1);
        }
    }
})




document.addEventListener('DOMContentLoaded', function() {
    
    const sortDropdown = document.getElementById('sortby');
    const searchInput = document.querySelector('.product-search');
    const filterButton = document.getElementById('btn-filter');
    const categoryCheckboxes = document.querySelectorAll('.filter-category-item');
    const priceSlider = document.getElementById('slider');
    const alertMessageError = document.getElementById('alertMessageError');
    const alertMessageSuccess = document.getElementById('alertMessageSuccess');
    const productContainer = document.querySelector('.product-item');



    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(null, args);
            }, delay);
        };
    };

    const fetchProducts = async (sortBy, searchQuery = '') => {
        const categoryFilters = Array.from(categoryCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.dataset.categoryId);
        const priceRange = priceSlider.noUiSlider.get();
        const minPrice = priceRange[0];
        const maxPrice = priceRange[1];

        const url = `/product-list/${sortBy}?search=${searchQuery}&category=${categoryFilters.join(',')}&min=${minPrice}&max=${maxPrice}`;

        try {
            const response = await fetch(url);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const productsContainer = doc.querySelector('.product-item');

            productContainer.innerHTML = productsContainer.innerHTML;
            attachEventListenersToNewButtons();
        } catch (error) {
            console.error(error);
        }
    };

    const attachEventListenersToNewButtons = () => {
        const cartButtons = document.querySelectorAll('.cart-button');
        cartButtons.forEach(btnCart => {
            btnCart.addEventListener('click', async (event) => {
                const productId = event.currentTarget.dataset.productId;
                console.log(productId);
                const response = await fetch(`/cart/${productId}`, { method: 'PATCH' });
                const body = await response.json();
                if (body.rdt) {
                    console.log('redirect me');
                    window.location.href = `/${body.rdt}`;
                }
                if (body.error) {
                    console.log(body.error);
                    showAlertError(body.error);
                }
                if (body.message) {
                    showAlertSuccess(body.message);
                }
            });
        });

   
    
    
    

        const wishlistButtons = document.querySelectorAll('.btn-wishlist');
        wishlistButtons.forEach(button => {
            button.addEventListener('click', async () => {
                console.log('button wishlist');
                const productId = button.getAttribute('data-product-id');
                const response = await fetch(`/wishlist/${productId}`, { method: 'POST' });
                const result = await response.json();
                if (result.success) showAlertSuccess(result.message);
                else if (result.redirect) {
                    showAlertError(result.error);
                    setTimeout(() => window.location.href = result.redirect, 1000);
                } else showAlertError(result.error);
            });
        });
    };

    const showAlertError = (message) => {
        alertMessageError.innerText = message;
        alertMessageError.style.display = 'block';
        setTimeout(() => {
            alertMessageError.style.display = 'none';
        }, 3000);
    };

    const showAlertSuccess = (message) => {
        alertMessageSuccess.innerText = message;
        alertMessageSuccess.style.display = 'block';
        setTimeout(() => {
            alertMessageSuccess.style.display = 'none';
        }, 3000);
    };

    const applyFilters = debounce(() => {
        const sortBy = sortDropdown.value;
        const searchQuery = searchInput.value;
        fetchProducts(sortBy, searchQuery);
    }, 300);

    sortDropdown.addEventListener('change', applyFilters);
    searchInput.addEventListener('input', applyFilters);
   

    categoryCheckboxes.forEach(checkbox => checkbox.addEventListener('change', applyFilters));
    

    // Initialize event listeners on initial load
    attachEventListenersToNewButtons();
});


// Price Slider
var priceSlider = document.getElementById('price-slider');
if (priceSlider) {
    noUiSlider.create(priceSlider, {
        start: [0, 1000],
        connect: true,
        step: 1,
        range: {
            'min': 0,
            'max': 1000
        }
    });

    // Update the filter-price-range span with the current values
    priceSlider.noUiSlider.on('update', function (values, handle) {
        document.getElementById('filter-price-range').innerHTML = values[0] + '₹ - ' + values[1] + '₹';
    });
}