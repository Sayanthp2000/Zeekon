// edit-product.js
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const fileInput = document.getElementById('images');
    const selectedFilesPreview = document.getElementById('selected-files-preview');

    // Add event listener for file input
    fileInput.addEventListener('change', function() {
        selectedFilesPreview.innerHTML = ''; // Clear previous previews

        const files = fileInput.files;
        if (files.length === 0) {
            return; // No files selected
        }

        // Display thumbnails for selected files
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const filePreview = document.createElement('div');
            filePreview.classList.add('file-preview');

            if (file.type.startsWith('image/')) {
                const fileThumbnail = document.createElement('img');
                fileThumbnail.src = URL.createObjectURL(file);
                fileThumbnail.alt = 'File Thumbnail';
                fileThumbnail.classList.add('file-thumbnail');
                filePreview.appendChild(fileThumbnail);
                fileThumbnail.style.maxWidth = '100px';
                fileThumbnail.style.maxHeight = '100px';
            }

            selectedFilesPreview.appendChild(filePreview);
        }
    });

    const productId = form.getAttribute('data-product-id');
    console.log(productId);

    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        const formData = new FormData(form);
        console.log(productId);
        // Send form data to server
        try {
            const response = await fetch(`/admin/products/edit/${ productId }`, {
                method: 'POST',
                body: formData
            });
            const responseData = await response.json();
            if (response.ok) {
                console.log(responseData); // Log server response
                displaySuccess({ message: responseData.message });
                // Add a delay to ensure the message is shown before redirect
                setTimeout(() => {
                    window.location.href = '/admin/products';
                }, 1500); // 1.5 seconds delay
                return;
            }
            console.error('Error adding product');
            displayError({ error: responseData.error });
        
        } catch (error) {
            console.error('Error adding product:', error);
            displayError({ error: error })
        }
    });

    const imgDeleteButtons = document.querySelectorAll('.img-delete-btn');
    imgDeleteButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            const confi = confirm('Do you want to delete the image');
            if (!confi) return;
            const imageUrl = button.getAttribute('data-image-url');
            const productId = button.getAttribute('data-product-id');
            console.log(imageUrl);
            console.log(productId);

            const response = await fetch(`/admin/products/delete-image?imageUrl=${imageUrl}&productId=${productId}`, { method: 'DELETE' });
            const result = await response.json();
            console.log(result);
            if (result.success) {
                const imagePreviewDiv = button.closest('.image-preview-div');
                if (imagePreviewDiv) {
                    imagePreviewDiv.remove();
                    displaySuccess(result);
                }
            } else {
                displayError(result);
            }
        });
    });

    const displayError = (result) => {
        const msgPara = document.querySelector('.msg-para');
        msgPara.parentElement.className = 'msg-box-error';
        msgPara.innerHTML = result.error;
    }

    const displaySuccess = (result) => {
        const msgPara = document.querySelector('.msg-para');
        msgPara.parentElement.className = 'msg-box-success';
        msgPara.innerHTML = result.message;
    }
});
