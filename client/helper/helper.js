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

// shared node
// TODO: add reply link to this
const PostNode = (props) => {
    const post = props.post;
    post.id = post._id || post.id;

    const returnNode = () => {
        if (!post.owner.style) {
            return (
            <div className="post" data-id={post.id}>
                {post.replyTo && 
                    <div className="replied-post"></div>
                }
                <a href={`/profile?user=${post.owner.username}`}>{post.owner.username}</a>
                {post.postTitle &&
                    <h2 className="title">
                        {post.postTitle}
                    </h2>
                }
                <p className="body">
                    {post.postBody}
                </p>
                <a id="reply-link" href={`/create?replyId=${post.id}`}><i className="fas fa-reply"></i></a>
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
                style={rootStyle}
                data-id={post.id}>
                {post.replyTo && 
                    <div className="replied-post"></div>
                }
                <a href={`/profile?user=${post.owner.username}`}>{post.owner.username}</a>
                {post.postTitle &&
                    <h2 className="title" style={{ fontFamily: post.owner.style.fontFamilyHead }}>
                        {post.postTitle}
                    </h2>
                }
                <p className="body">
                    {post.postBody}
                </p>
                <a id="reply-link" href={`/create?replyId=${post.id}`}><i className="fas fa-reply"></i></a>
            </div>
        );
    }

    const updateWithReply = (id, post) => {
        let linkStyle;

        if(post.owner.style){
            linkStyle = {
                backgroundColor: post.owner.style.backgroundColor,
                color: post.owner.style.color,
                fontFamily: post.owner.style.fontFamilyBody
            }
        }
        else linkStyle = {};
        
        let replyElement = (
            <div>
                <PostNode post={post} />
                <div className="to-line">replying to <a href={`/profile?user=${post.owner.username}`} style={linkStyle}>{post.owner.username}</a>:</div>
            </div>
        );

        for(let node of document.querySelectorAll(`.post[data-id='${id}']>.replied-post`)){
            ReactDOM.render(
                replyElement,
                node
            );
        }
    }

    if(post.replyTo){
        sendAjax('GET', `/getPosts?id=${post.replyTo}`, null, 
        (data) => {
            updateWithReply(post.id, data.post)
        });
    }

    return returnNode();
    
}


