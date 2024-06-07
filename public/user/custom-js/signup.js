
const form = document.querySelector('#signup-form')
const msgPara = document.querySelector('.msg-para');

form.addEventListener('submit', async (event) => {
   try{
    event.preventDefault();
    console.log('form submit');

    const body = getUserDetails();
    const validateResult = verifyUserDetails(body)
    console.log('validateReult : ' + validateResult);
    console.log('body : ' + body );

    if(validateResult.success){
        const result = await shareBody(body);
        console.log('result : ' + result );
        if(result.success){
            window.location.href = '/signup/otp';
        }
    }else {
        console.log('validateResult.message : ' + validateResult.message );
    }
   }
   catch(err){
    console.log('err : ' + err );
   }

    
})


const getUserDetails = () => {
    const username = document.querySelector('[username]').value;
    const email = document.querySelector('[email]').value;
    const password = document.querySelector('[password]').value;
    const passwordRe = document.querySelector('[passwordRe]').value;

    return body = { username, email, password, passwordRe }
}


const verifyUserDetails = (body) => {
    var { username, email, password, passwordRe } = body;

    if( username === '' || email === '' || password === '' || passwordRe === ''){
        const result = { success: false, message: 'All fields are required' }
        return displayError( result );
    }

    if(!isEmailValid(email)){
        const result = { success: false, message: 'Email is not in the correct format' }
        return displayError( result );
    }

    if( password.length < 6 ){
        const result = { success: false, message: 'Password Length cannot be less than 6' }
        return displayError( result );
    }

    if( password !== passwordRe ){
        const result = { success: false, message: 'Password is not matching' }
        return displayError( result );
    }
    
    return { success: true };
}



const displayError = (result) => {
    msgPara.parentElement.className = 'msg-box-error';
    msgPara.innerHTML = result.message;
}



const displaySuccess = (result) => {
    console.log('before share body');
    shareBody(body);
    console.log('after sharebody');

    msgPara.innerHTML = result.message;
}


const isEmailValid = (email) => {
    const emailRegex =  /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/g
    return emailRegex.test(email)
}



const shareBody = async (body) => {
    try {
         const response = await fetch('/signup', {
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