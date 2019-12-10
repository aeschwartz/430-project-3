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
