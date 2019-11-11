const handleError = (message) => {
    $("#errorMessage").text(message);
    $("#domoMessage").animate({ width: 'toggle' }, 350);
};

const redirect = (res) => {
    $("domoMessage").animate({ width: 'hide' }, 350);
    window.location = res.redirect;
};

const sendAjax = (type, action, data, success) => {
    $.ajax({
        cache: false,
        type: type,
        url: action,
        data: data,
        dataType: "json",
        success: success,
        error: (xhr, status, error) => {
            const messageObj = xhr.response;
            handleError(messageObj.error);
        }
    });
};

