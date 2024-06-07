document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
            const category = document.querySelector('#category').value.trim()

            if (!category) {
                return displayError({ success: false, error: 'Category name is required' });
            }

            const response = await fetch('/admin/category', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ category })
            });

            if (response.ok) {
                location.reload();
                displaySuccess({ message: 'Category created successfully' });
            } else {
                const errorResponse = await response.json();
                throw new Error(errorResponse.error || 'Failed to create category');
            }
        } catch (error) {
            console.error('Error:', error);
            displayError({ success: false, error: error.message });
        }
    });

    const editBtn = document.querySelectorAll('.btn-edit');
    editBtn.forEach(button => {
        button.addEventListener('click', async function() {
            const updateButton = document.querySelector('.btn-update');
            const categoryId = this.dataset.categoryId;

            try {
                const response = await fetch(`/admin/category/${categoryId}`);
                const data = await response.json();

                if (data.error) {
                    return displayError({ error: data.error });
                }

                const categoryInput = document.querySelector('#category');
                categoryInput.value = data.categoryName;
                updateButton.style.display = 'flex';
                updateButton.innerHTML = 'Update';

                updateButton.addEventListener('click', async () => {
                    const updatedCategory = categoryInput.value.trim()

                    if (!updatedCategory) {
                        return displayError({ success: false, error: 'Category name is required' });
                    }

                    const updateResponse = await fetch(`/admin/category/update/${categoryId}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ categoryName: updatedCategory })
                    });

                    const updateData = await updateResponse.json();
                    if (updateData.error) {
                        return displayError(updateData);
                    } else if (updateData.success) {
                        displaySuccess({ message: 'Category updated successfully' });
                        setTimeout(() => window.location.reload(), 1000);
                    } else {
                        return displayError('Something unknown occurred');
                    }
                });
            } catch (error) {
                console.error('Error:', error);
                return displayError({ error: error.message });
            }
        });
    });
});

const displayError = (result) => {
    const msgPara = document.querySelector('.msg-para');
    msgPara.parentElement.className = 'display-error';
    msgPara.innerHTML = result.error;
};

const displaySuccess = (result) => {
    const msgPara = document.querySelector('.msg-para');
    msgPara.parentElement.className = 'display-success';
    msgPara.innerHTML = result.message;
};
