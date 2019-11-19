const redirect = (res) => {
    window.location = res.redirect;
};

const sendAjax = (type, action, data, success, handleError) => {
    $.ajax({
        cache: false,
        type: type,
        url: action,
        data: data,
        dataType: "json",
        success: success,
        error: (xhr, status, error) => {
            const messageObj = $.parseJSON(xhr.responseText);
            handleError(messageObj.error);
        }
    });
};

