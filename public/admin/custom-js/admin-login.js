
const form = document.querySelector('form');
const msgPara = document.querySelector('.msg-para');

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.querySelector('[email]').value;
    const password = document.querySelector('[password]').value;

    const body = { email, password };

    const validateBodyResult = validatebody(body);
    if(validateBodyResult.success){
       const sendBodyResult = await sendBody(body)
       if(sendBodyResult.success){
        window.location.href = '/admin/'
       }else{
        return displayError({ success: false, message: sendBodyResult.message })
       }
    }else{
        return displayError({ success: false, message: validateBodyResult.message })
    }

    
})




const isEmailValid = (email) => {
    const emailRegex =  /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/g
    return emailRegex.test(email)
}




const displayError = (result) => {
    msgPara.parentElement.className = 'msg-box-error';
    msgPara.innerHTML = result.message;
}




const validatebody = (body) => {
    const { email, password } = body;

    if( !email || !password ){
        return displayError({ success: false, message: 'email and password is required '});
    }
    if(!isEmailValid(email)){
        return displayError({ success: false, message: 'email format is wrong'})
    }
    return { success: true, message: `evertying is alright in validateBody `};
}




const sendBody = async (body) => {
   try{
    const response = await fetch('/admin/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
    const data = await response.json();
    console.log('data : ' + data );
    if(data.error){
        console.log('data.error : ' + data.error );
        displayError({ success: false, message: data.error})
    }
    if(data.success){
        return { success: true, message: 'allright in data.success' }
    }
    return { success: false, message: data.error };

   }
   catch(err){
    console.log('error : ' + err );
    displayError(err);
   }
}