const PostFeed = (props) => {
    if (props.posts.length === 0) {
        return (
            <div id="posts">
                <h3 className="empty">No posts yet.</h3>
            </div>
        );
    }

    const postNodes = props.posts.map((post) => {
        if (!post.owner.style) {
            return (
            <div className="post">
                <a href={`/profile?user=${post.owner.username}`}>{post.owner.username}</a>
                {post.postTitle &&
                    <h2 className="title">
                        {post.postTitle}
                    </h2>
                }
                <p className="body">
                    {post.postBody}
                </p>
            </div>
            );
        }
        const rootStyle = {
            backgroundColor: post.owner.style.backgroundColor,
            color: post.owner.style.color,
            fontFamily: post.owner.style.fontFamilyBody
        }
        return (
            <div className="post"
                style={rootStyle}>
                <a href={`/profile?user=${post.owner.username}`}>{post.owner.username}</a>
                {post.postTitle &&
                    <h2 className="title" style={{ fontFamily: post.owner.style.fontFamilyHead }}>
                        {post.postTitle}
                    </h2>
                }
                <p className="body">
                    {post.postBody}
                </p>
            </div>
        );
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
    if ($("#posts-container")[0]) {
        ReactDOM.render(
            <PostFeed posts={[]} />,
            document.querySelector("#posts-container")
        );
        loadPostsFromServer();
    }
    else if ($("#profile-container")[0]) {
        const user = document.querySelector("#profile-container").dataset.user;

        // TODO: change this to rendering whole profile
        ReactDOM.render(
            <PostFeed posts={[]} />,
            document.querySelector("#profile-container")
        );

        loadPostsFromServer(user);
    }
};

$(document).ready(setup);