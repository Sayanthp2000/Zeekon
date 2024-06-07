const alertMessage = document.getElementById('alertMessage');

function showAlert(message) {
  alertMessage.innerText = message;
  alertMessage.style.display = 'block';
  setTimeout(() => {
    alertMessage.style.display = 'none';
  }, 3000); 
}

export { showAlert };



