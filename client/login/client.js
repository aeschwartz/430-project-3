const handleError = (message) => {
    $("#error").text(message);
}

const handleLogin = (e) => {
    e.preventDefault();

    if ($("#user").val() == '' || $("#pass").val() == '') {
        handleError("Username or password is empty");
        return false;
    }

    console.log($("input[name=_csrf]").val());

    sendAjax('POST', $("#login-form").attr('action'), $("#login-form").serialize(), redirect, handleError);

    return false;
};

const handleSignup = (e) => {
    e.preventDefault();

    $("#domoMessage").animate({ width: 'hide' }, 350);

    if ($("#user").val() == '' || $("#pass").val() == '' || $("#pass2").val() == '') {
        handleError("All fields are required");
        return false;
    }

    if ($("#pass").val() !== $("#pass2").val()) {
        handleError("Passwords do not match");
        return false;
    }

    // console.log($("input[name=_csrf]").val());

    sendAjax('POST', $("#signup-form").attr('action'), $("#signup-form").serialize(), redirect);

    return false;
};

const LoginWindow = (props) => {
    return (
        <form id="login-form"
            onSubmit={handleLogin}
            action="/login"
            method="POST"
            className="form"
        >
            <h2>Login</h2>
            <p id="error">&nbsp;</p>
            <input id="user" type="text" name="username" placeholder="Username" />
            <input id="pass" type="password" name="pass" placeholder="Password" />
            <input type="hidden" name="_csrf" value={props.csrf} />
            <input type="submit" value="Sign in" />
            <br />
            <p>
                New here? <a onClick={(e) => { toggleForm(e, props.csrf) }} href="">Sign up.</a>
            </p>
        </form>
    )
};

const SignupWindow = (props) => {
    return (
        <form id="signup-form"
            onSubmit={handleSignup}
            action="/signup"
            method="POST"
            className="form"
        >
            <h2>Create an account</h2>
            <p id="error">&nbsp;</p>
            <input id="user" type="text" name="username" placeholder="Username" />
            <input id="pass" type="password" name="pass" placeholder="Password" />
            <input id="pass2" type="password" name="pass2" placeholder="Re-enter password" />
            <input type="hidden" name="_csrf" value={props.csrf} />
            <input type="submit" value="Sign up" />
            <br />
            <p>
                Have an account? <a onClick={(e) => { toggleForm(e, props.csrf) }} href="">Sign in.</a>
            </p>
        </form>
    );
};

const createLoginWindow = (csrf) => {
    ReactDOM.render(
        <LoginWindow csrf={csrf} />,
        document.querySelector("#login-container")
    );
};

const createSignupWindow = (csrf) => {
    ReactDOM.render(
        <SignupWindow csrf={csrf} />,
        document.querySelector("#login-container")
    );
};

let toggle = false;

const setup = (csrf) => {
    createLoginWindow(csrf);
}

const toggleForm = (e, csrf) => {
    e.preventDefault();

    toggle = !toggle;

    if (toggle) createSignupWindow(csrf);
    else createLoginWindow(csrf);

    return false;
}



// if form is toggled, sign up form is active,
// if not then it is on login


const getToken = () => {
    sendAjax('GET', '/getToken', null, (result) => {
        setup(result.csrfToken);
    });
};

// window.onload
$(document).ready(getToken);