const PostFeed = (props) => {
    if (props.posts.length === 0) {
        return (
            <div id="posts">
                <h3 className="empty">No posts yet.</h3>
            </div>
        );
    }

    const postNodes = props.posts.map((post) => {
        return <PostNode post={post} />
    });

    postNodes.reverse();

    return (
        <div id="posts">
            {postNodes}
        </div>
    );
};

const ProfileHeader = (props) => {
    return (
        <div id="profile-header">
            <h1 id="user-heading">{props.user.username}</h1>
            <p id="user-bio">{props.user.bio}</p>
        </div>
    );
}

const Profile = (props) => {
    return (
        <div id="profile">
            <ProfileHeader user={props.userData} />
            <PostFeed posts={props.posts} />
        </div>
    );
}

const loadPostsFromServer = (user) => {
    if (user) {
        sendAjax('GET', `/getUser?user=${user}`, null, (userData) => {
            sendAjax('GET', `/getPosts?user=${user}`, null, (data) => {
                ReactDOM.render(
                    <Profile userData={userData.user} posts={data.posts} />,
                    document.querySelector("#profile-container")
                );
            });
        })

    }
    else {
        sendAjax('GET', `/getPosts`, null, (data) => {
            ReactDOM.render(
                <PostFeed posts={data.posts} />,
                document.querySelector("#posts-container")
            );
        });
    }
};

const setup = () => {
    if (document.querySelector("#posts-container")) {
        ReactDOM.render(
            <PostFeed posts={[]} />,
            document.querySelector("#posts-container")
        );
        loadPostsFromServer();
    }
    else if (document.querySelector("#profile-container")) {
        const user = document.querySelector("#profile-container").dataset.user;

        // TODO: change this to rendering whole profile
        ReactDOM.render(
            <PostFeed posts={[]} />,
            document.querySelector("#profile-container")
        );

        loadPostsFromServer(user);
    }
    else if (document.querySelector("#create-container")) {
        // see if reply div exists
        const replyDiv = document.querySelector("#reply-post");
        if(!replyDiv) return; // return if doesn't

        // get reply id
        const id = document.querySelector("#reply-post").dataset.id;
        sendAjax('GET', `/getPosts?id=${id}`, null, 
        (data) => {
            ReactDOM.render(
                <PostNode post={data.post} />,
                replyDiv
            );
        }, 
        () => { // onerror
            location.href = "/";
        });

    }
};

$(document).ready(setup);