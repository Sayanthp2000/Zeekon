document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.activate, .block');

    buttons.forEach(button => {
        button.addEventListener('click', function() {
            console.log('entered click addevent listener');
            const userId = this.dataset.userId; // Assuming userId is stored in a data attribute
            const action = this.classList.contains('block') ? false : true;

            console.log( 'userId : ' + userId, 'action : ' + action );

            fetch(`/admin/user-status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: userId, status: action })
            })
            .then(response => {
                if (response.ok) {
                    console.log(response);
                    console.log(`user-status: ${action} > user successful`);
                    window.location.reload();
                } else {
                    console.log(response);
                    console.error(`Error : ${action} > user-status.`);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    });
});