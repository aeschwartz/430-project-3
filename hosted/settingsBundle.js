"use strict";

var setup = function setup() {
    var elements = $("form>[name]:not([type=hidden]");
    var csrf = $("[name=_csrf]");
    elements.each(function (index, el) {
        el.addEventListener("change", function (e) {
            var data = el.name + "=" + el.value + "&_csrf=" + csrf.val();
            sendAjax('POST', '/settings', data, function () {
                location.reload();
            });
        });
    });

    var selects = $("form>select");
    selects.each(function (index, el) {
        el = $(el);
        if (!el.attr("value")) return;
        var selectVal = el.attr("value");
        el.find("option[value='" + selectVal + "']")[0].selected = true;
    });
};

$(document).ready(setup);
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
