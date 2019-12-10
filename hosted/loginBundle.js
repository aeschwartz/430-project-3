"use strict";

var handleError = function handleError(message) {
    $("#error").text(message);
};

var handleLogin = function handleLogin(e) {
    e.preventDefault();

    if ($("#user").val() == '' || $("#pass").val() == '') {
        handleError("Username or password is empty");
        return false;
    }

    console.log($("input[name=_csrf]").val());

    sendAjax('POST', $("#login-form").attr('action'), $("#login-form").serialize(), redirect, handleError);

    return false;
};

var handleSignup = function handleSignup(e) {
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

var LoginWindow = function LoginWindow(props) {
    return React.createElement(
        "form",
        { id: "login-form",
            onSubmit: handleLogin,
            action: "/login",
            method: "POST",
            className: "form"
        },
        React.createElement(
            "h2",
            null,
            "Login"
        ),
        React.createElement(
            "p",
            { id: "error" },
            "\xA0"
        ),
        React.createElement("input", { id: "user", type: "text", name: "username", placeholder: "Username" }),
        React.createElement("input", { id: "pass", type: "password", name: "pass", placeholder: "Password" }),
        React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
        React.createElement("input", { type: "submit", value: "Sign in" }),
        React.createElement("br", null),
        React.createElement(
            "p",
            null,
            "New here? ",
            React.createElement(
                "a",
                { onClick: function onClick(e) {
                        toggleForm(e, props.csrf);
                    }, href: "" },
                "Sign up."
            )
        )
    );
};

var SignupWindow = function SignupWindow(props) {
    return React.createElement(
        "form",
        { id: "signup-form",
            onSubmit: handleSignup,
            action: "/signup",
            method: "POST",
            className: "form"
        },
        React.createElement(
            "h2",
            null,
            "Create an account"
        ),
        React.createElement(
            "p",
            { id: "error" },
            "\xA0"
        ),
        React.createElement("input", { id: "user", type: "text", name: "username", placeholder: "Username" }),
        React.createElement("input", { id: "pass", type: "password", name: "pass", placeholder: "Password" }),
        React.createElement("input", { id: "pass2", type: "password", name: "pass2", placeholder: "Re-enter password" }),
        React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
        React.createElement("input", { type: "submit", value: "Sign up" }),
        React.createElement("br", null),
        React.createElement(
            "p",
            null,
            "Have an account? ",
            React.createElement(
                "a",
                { onClick: function onClick(e) {
                        toggleForm(e, props.csrf);
                    }, href: "" },
                "Sign in."
            )
        )
    );
};

var createLoginWindow = function createLoginWindow(csrf) {
    ReactDOM.render(React.createElement(LoginWindow, { csrf: csrf }), document.querySelector("#login-container"));
};

var createSignupWindow = function createSignupWindow(csrf) {
    ReactDOM.render(React.createElement(SignupWindow, { csrf: csrf }), document.querySelector("#login-container"));
};

var toggle = false;

var setup = function setup(csrf) {
    createLoginWindow(csrf);
};

var toggleForm = function toggleForm(e, csrf) {
    e.preventDefault();

    toggle = !toggle;

    if (toggle) createSignupWindow(csrf);else createLoginWindow(csrf);

    return false;
};

// if form is toggled, sign up form is active,
// if not then it is on login


var getToken = function getToken() {
    sendAjax('GET', '/getToken', null, function (result) {
        setup(result.csrfToken);
    });
};

// window.onload
$(document).ready(getToken);
"use strict";

var redirect = function redirect(res) {
    window.location = res.redirect;
};

var sendAjax = function sendAjax(type, action, data, success, handleError) {
    $.ajax({
        cache: false,
        type: type,
        url: action,
        data: data,
        dataType: "json",
        success: success,
        error: function error(xhr, status, _error) {
            var messageObj = $.parseJSON(xhr.responseText);
            handleError(messageObj.error);
        }
    });
};

// shared node
// TODO: add reply link to this
var PostNode = function PostNode(props) {
    var post = props.post;
    post.id = post._id || post.id;

    var returnNode = function returnNode() {
        if (!post.owner.style) {
            return React.createElement(
                "div",
                { className: "post", "data-id": post.id },
                post.replyTo && React.createElement("div", { className: "replied-post" }),
                React.createElement(
                    "a",
                    { href: "/profile?user=" + post.owner.username },
                    post.owner.username
                ),
                post.postTitle && React.createElement(
                    "h2",
                    { className: "title" },
                    post.postTitle
                ),
                React.createElement(
                    "p",
                    { className: "body" },
                    post.postBody
                ),
                React.createElement(
                    "a",
                    { id: "reply-link", href: "/create?replyId=" + post.id },
                    React.createElement("i", { className: "fas fa-reply" })
                )
            );
        }
        var rootStyle = {
            backgroundColor: post.owner.style.backgroundColor,
            color: post.owner.style.color,
            fontFamily: post.owner.style.fontFamilyBody
        };
        return React.createElement(
            "div",
            { className: "post",
                style: rootStyle,
                "data-id": post.id },
            post.replyTo && React.createElement("div", { className: "replied-post" }),
            React.createElement(
                "a",
                { href: "/profile?user=" + post.owner.username },
                post.owner.username
            ),
            post.postTitle && React.createElement(
                "h2",
                { className: "title", style: { fontFamily: post.owner.style.fontFamilyHead } },
                post.postTitle
            ),
            React.createElement(
                "p",
                { className: "body" },
                post.postBody
            ),
            React.createElement(
                "a",
                { id: "reply-link", href: "/create?replyId=" + post.id },
                React.createElement("i", { className: "fas fa-reply" })
            )
        );
    };

    var updateWithReply = function updateWithReply(id, post) {
        var linkStyle = void 0;

        if (post.owner.style) {
            linkStyle = {
                backgroundColor: post.owner.style.backgroundColor,
                color: post.owner.style.color,
                fontFamily: post.owner.style.fontFamilyBody
            };
        } else linkStyle = {};

        var replyElement = React.createElement(
            "div",
            null,
            React.createElement(PostNode, { post: post }),
            React.createElement(
                "div",
                { className: "to-line" },
                "replying to ",
                React.createElement(
                    "a",
                    { href: "/profile?user=" + post.owner.username, style: linkStyle },
                    post.owner.username
                ),
                ":"
            )
        );

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = document.querySelectorAll(".post[data-id='" + id + "']>.replied-post")[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var node = _step.value;

                ReactDOM.render(replyElement, node);
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
    };

    if (post.replyTo) {
        sendAjax('GET', "/getPosts?id=" + post.replyTo, null, function (data) {
            updateWithReply(post.id, data.post);
        });
    }

    return returnNode();
};
