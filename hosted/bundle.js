"use strict";

var csrf = void 0; // don't create an accessible variable for this

var handleDomo = function handleDomo(e) {
    e.preventDefault();

    $("#domoMessage").animate({ width: 'hide' }, 350);

    if ($("#domoName").val() == '' || $("#domoAge").val() == '' || $("#domoTeeth").val() == '') {
        handleError("RAWR! All fields are required");
        return false;
    }

    console.log($("input[name=_csrf]").val());

    sendAjax('POST', $("#domoForm").attr('action'), $("#domoForm").serialize(), loadDomosFromServer);

    return false;
};

var editDomo = function editDomo(e) {
    e.preventDefault();

    $("#domoMessage").animate({ width: 'hide' }, 350);

    var form = $(e.target);

    if (form.find(".domoName>input").val() == '' || form.find(".domoAge>input").val() == '' || form.find(".domoTeeth>input").val() == '') {
        handleError("RAWR! All fields are required");
        return false;
    }

    sendAjax('POST', form.attr("action"), form.serialize(), loadDomosFromServer);

    return false;
};

var DomoForm = function DomoForm(props) {
    return React.createElement(
        "form",
        { id: "domoForm",
            onSubmit: handleDomo,
            name: "domoForm",
            action: "/maker",
            method: "POST",
            className: "domoForm"
        },
        React.createElement(
            "label",
            { htmlFor: "name" },
            "Name: "
        ),
        React.createElement("input", { id: "domoName", type: "text", name: "name", placeholder: "Domo Name" }),
        React.createElement(
            "label",
            { htmlFor: "age" },
            "Age: "
        ),
        React.createElement("input", { id: "domoAge", type: "text", name: "age", placeholder: "Domo Age" }),
        React.createElement(
            "label",
            { htmlFor: "teeth" },
            "Teeth: "
        ),
        React.createElement("input", { id: "domoTeeth", type: "text", name: "teeth", placeholder: "Number of Teeth" }),
        React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
        React.createElement("input", { className: "makeDomoSubmit", type: "submit", value: "Make Domo" })
    );
};

var DomoList = function DomoList(props) {
    if (props.domos.length === 0) {
        return React.createElement(
            "div",
            { className: "domoList" },
            React.createElement(
                "h3",
                { className: "emptyDomo" },
                "No Domos yet"
            )
        );
    }

    var domoNodes = props.domos.map(function (domo) {
        return React.createElement(
            "form",
            { action: "/edit", method: "POST", onSubmit: editDomo, key: domo._id, className: "domo" },
            React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
            React.createElement("input", { type: "hidden", name: "_id", value: domo._id }),
            React.createElement("img", { src: "/assets/img/domoface.jpeg", alt: "domo face", className: "domoFace" }),
            React.createElement(
                "h3",
                { className: "domoName" },
                " Name: ",
                React.createElement("input", { name: "name", type: "text", defaultValue: domo.name })
            ),
            React.createElement(
                "h3",
                { className: "domoAge" },
                " Age: ",
                React.createElement("input", { name: "age", type: "text", defaultValue: domo.age })
            ),
            React.createElement(
                "h3",
                { className: "domoTeeth" },
                "Teeth: ",
                React.createElement("input", { name: "teeth", type: "text", defaultValue: domo.teeth })
            ),
            React.createElement("input", { type: "submit", value: "Edit Domo" })
        );
    });

    return React.createElement(
        "div",
        { className: "domoList" },
        domoNodes
    );
};

var loadDomosFromServer = function loadDomosFromServer() {
    sendAjax('GET', '/getDomos', null, function (data) {
        ReactDOM.render(React.createElement(DomoList, { csrf: csrf, domos: data.domos }), document.querySelector("#domos"));
    });
};

var setup = function setup() {
    ReactDOM.render(React.createElement(DomoForm, { csrf: csrf }), document.querySelector("#makeDomo"));

    ReactDOM.render(React.createElement(DomoList, { csrf: csrf, domos: [] }), document.querySelector("#domos"));

    loadDomosFromServer();
};

var getToken = function getToken() {
    sendAjax('GET', '/getToken', null, function (result) {
        csrf = result.csrfToken;
        setup();
    });
};

// window.onload
$(document).ready(getToken);
"use strict";

var handleError = function handleError(message) {
    $("#errorMessage").text(message);
    $("#domoMessage").animate({ width: 'toggle' }, 350);
};

var redirect = function redirect(res) {
    $("domoMessage").animate({ width: 'hide' }, 350);
    window.location = res.redirect;
};

var sendAjax = function sendAjax(type, action, data, success) {
    $.ajax({
        cache: false,
        type: type,
        url: action,
        data: data,
        dataType: "json",
        success: success,
        error: function error(xhr, status, _error) {
            var messageObj = xhr.response;
            handleError(messageObj.error);
        }
    });
};
