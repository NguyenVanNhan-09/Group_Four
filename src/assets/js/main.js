const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const regexPassword = /^[a-zA-Z0-9@$!%*#?&]{6,16}$/;

//Signin code
import apiClient from "./axiosConfig.js";
const formSignin = document.getElementById("form-signin");
formSignin?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(formSignin);
    const email = formData.get("email");
    const password = formData.get("password");
    const notification = document.getElementById("signinToast");
    const isValid = validateFormSignin(email, password);
    if(isValid) {
        try{
            const result = await apiClient.post("v1/users/login", formData)
            const userInfo = {
                id: result.data.data.id,
                username: result.data.data.username,
            }
            localStorage.setItem("accessToken", result.data.data.accessToken);

            notification.classList.remove("hidden");
            setTimeout( () => {
                window.location.href = "../../src/pages/chat.html";
            }, 2000)
        } catch(error) {
            console.log("error: ",error.response.data.error);
            notification.classList.remove("hidden");
            notification.innerHTML = "Email hoặc Mật Khẩu không đúng";
            // setTimeout( () => {
            //     notification.classList.add("hidden");
            //
            // })
        }

    }
})

function validateFormSignin(email, password) {
    document.querySelectorAll(".error").forEach(error => {
        error.textContent = '';
    });
    let isValid = true;
    if(email === ''){
        document.getElementById("error-email").innerText = "Vui lòng điền email";
        isValid = false;
    } else if(!regexEmail.test(email)) {
        document.getElementById("error-email").innerText = "Địa chỉ email chưa hợp lệ";
        isValid = false;
    }

    if(password === ''){
        document.getElementById("error-password").innerText = "Vui lòng nhập mật khẩu";
        isValid = false;
    } else if (!regexPassword.test(password)) {
        document.getElementById("error-password").innerText = "Mật khẩu chưa hợp lệ";
        isValid = false;
    }
    return isValid;
}

const signupLink = document.getElementById("signup-link");
signupLink?.addEventListener("click", (e) => {
    signupLink.href = 'signup.html';
})


//Signup code
const formSignup = document.getElementById("form-signup");
formSignup?.addEventListener("submit",async (e) => {
    e.preventDefault();
    const formData = new FormData(formSignup);
    const username = formData.get("username");
    const email = formData.get("email");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirm-password");
    const isValid = validateFormSignup(username, email, password, confirmPassword);
    formData.delete("confirm-password");
    if(isValid) {
        try {
            const result = await apiClient.post("v1/users/signup", formData)
            document.getElementById("success-modal").classList.remove("hidden");
            formSignup.reset();

        } catch(error) {
            document.getElementById("error-email").innerText = error.response.data.message;
        }
    }
})
function validateFormSignup(username, email, password,confirmPassword) {
    document.querySelectorAll(".error").forEach(error => {
        error.textContent = '';
    });
    console.log(username, email, password);
    let isValid = true;
    if(username === ''){
        document.getElementById("error-username").innerText = "Vui lòng điền username";
        isValid = false;
    }

    if(email === ''){
        document.getElementById("error-email").innerText = "Vui lòng điền email";
        isValid = false;
    } else if(!regexEmail.test(email)) {
        document.getElementById("error-email").innerText = "Địa chỉ email chưa hợp lệ";
        isValid = false;
    }

    if(password === ''){
        document.getElementById("error-password").innerText = "Vui lòng nhập mật khẩu";
        isValid = false;
    } else if (!regexPassword.test(password)) {
        document.getElementById("error-password").innerText = "Mật khẩu chưa hợp lệ";
        isValid = false;
    } else if(password !== confirmPassword){
        document.getElementById("error-confirm-password").innerText = "Mật khẩu không khớp";
        isValid = false;
    }
    return isValid;
}
const signinLink = document.getElementById("signin-link");
signinLink?.addEventListener("click", (e) => {
    signinLink.href = 'signin.html';
})