
const form = document.querySelector('form');
const msgPara = document.querySelector('.msg-para');
const forgotPass = document.querySelector('.forgot-link');



form.addEventListener('submit', async (event) => {
   try{
    event.preventDefault();
    const email = document.querySelector('[email]').value;
    const password = document.querySelector('[password]').value;

    const body = { email, password };
    const validationResult = validatebody(body);
    console.log(validationResult);
    if(validationResult.success){
        const result = await shareBody(body)
        console.log( 'result : ' + result );
        if(result.success){
            window.location.href = '/';
        }else {
            displayError({ success: false, message: 'result.success is underined'})
        }
    }else{
        console.log('validateResult.message : ' + validationResult.message );
    }
   }
   catch(err){
    console.error('error : ' + err );
   }
})



const validatebody = (body) => {
    const { email, password } = body;

    console.log('email : ' + email , 'password : ' + password);
    if( !email || !password ){
        return displayError({ result: false, message: 'email and password is required '});
    }
    if(!isEmailValid(email)){
        return displayError({ result: false, message: 'email format is wrong'});
    }
    if( password.length < 6 ){
        return displayError({ result: false, message: 'password should be atleast 6 characters'});
    }
    return { success: true, message: 'everything is alright '};
}



const isEmailValid = (email) => {
    const emailRegex =  /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/g
    return emailRegex.test(email)
}


const displayError = (result) => {
    msgPara.parentElement.className = 'msg-box-error'
    msgPara.innerHTML = result.message;
}



const shareBody = async (body) => {
    try {
         const response = await fetch('/login', {
             method: 'POST',
             headers: {
                 'Content-Type': 'application/json'
             },
             body: JSON.stringify(body)
         });
         const data = await response.json();
 
         if (data.error) {
            const result = { message: data.error }
            return displayError( result );
         }
        return { success: true };
     }
     catch (err) {
         console.log(err);
         displayError(err);
     }
 }