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
        if (!post.owner.style) {
            return React.createElement(
                "div",
                { className: "post" },
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
                style: rootStyle },
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
            )
        );
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
    if ($("#posts-container")[0]) {
        ReactDOM.render(React.createElement(PostFeed, { posts: [] }), document.querySelector("#posts-container"));
        loadPostsFromServer();
    } else if ($("#profile-container")[0]) {
        var user = document.querySelector("#profile-container").dataset.user;

        // TODO: change this to rendering whole profile
        ReactDOM.render(React.createElement(PostFeed, { posts: [] }), document.querySelector("#profile-container"));

        loadPostsFromServer(user);
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
