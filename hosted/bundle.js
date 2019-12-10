"use strict";

var PostFeed = function PostFeed(props) {
    if (props.posts.length === 0) {
        return React.createElement(
            "div",
            { id: "posts" },
            React.createElement(
                "h3",
                { className: "empty" },
                "No posts yet."
            )
        );
    }

    var postNodes = props.posts.map(function (post) {
        return React.createElement(PostNode, { post: post });
    });

    postNodes.reverse();

    return React.createElement(
        "div",
        { id: "posts" },
        postNodes
    );
};

var ProfileHeader = function ProfileHeader(props) {
    return React.createElement(
        "div",
        { id: "profile-header" },
        React.createElement(
            "h1",
            { id: "user-heading" },
            props.user.username
        ),
        React.createElement(
            "p",
            { id: "user-bio" },
            props.user.bio
        )
    );
};

var Profile = function Profile(props) {
    return React.createElement(
        "div",
        { id: "profile" },
        React.createElement(ProfileHeader, { user: props.userData }),
        React.createElement(PostFeed, { posts: props.posts })
    );
};

var loadPostsFromServer = function loadPostsFromServer(user) {
    if (user) {
        sendAjax('GET', "/getUser?user=" + user, null, function (userData) {
            sendAjax('GET', "/getPosts?user=" + user, null, function (data) {
                ReactDOM.render(React.createElement(Profile, { userData: userData.user, posts: data.posts }), document.querySelector("#profile-container"));
            });
        });
    } else {
        sendAjax('GET', "/getPosts", null, function (data) {
            ReactDOM.render(React.createElement(PostFeed, { posts: data.posts }), document.querySelector("#posts-container"));
        });
    }
};

var setup = function setup() {
    if (document.querySelector("#posts-container")) {
        ReactDOM.render(React.createElement(PostFeed, { posts: [] }), document.querySelector("#posts-container"));
        loadPostsFromServer();
    } else if (document.querySelector("#profile-container")) {
        var user = document.querySelector("#profile-container").dataset.user;

        // TODO: change this to rendering whole profile
        ReactDOM.render(React.createElement(PostFeed, { posts: [] }), document.querySelector("#profile-container"));

        loadPostsFromServer(user);
    } else if (document.querySelector("#create-container")) {
        // see if reply div exists
        var replyDiv = document.querySelector("#reply-post");
        if (!replyDiv) return; // return if doesn't

        // get reply id
        var id = document.querySelector("#reply-post").dataset.id;
        sendAjax('GET', "/getPosts?id=" + id, null, function (data) {
            ReactDOM.render(React.createElement(PostNode, { post: data.post }), replyDiv);
        }, function () {
            // onerror
            location.href = "/";
        });
    }
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
