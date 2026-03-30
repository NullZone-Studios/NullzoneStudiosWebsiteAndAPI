import React from "react";
import "./Blog.css";
import ProfileIcon from "../ProfileIcon/ProfileIcon";
import BlogShowcase from "./BlogShowcase";
import Icon from "../Icon/Icon";
import ProtectedRoute from "../../ProtectedRoute/ProtectedRoute";

class Blog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            active: "",
            currentUser: {
                id: 1,
                role: "admin"
            },
            isDraggingBlog: false,
            isLoadingComments: false,
            selectedPostId: null,
            draftComment: "",
            posts: this.NormalizePosts(props.posts)
        }
        this.blogRef = React.createRef();
        this.timeRefreshInterval = null;
        this.commentLoadRequestId = 0;
        this.blogDrag = {
            isPointerDown: false,
            startX: 0,
            startScrollLeft: 0,
            hasDragged: false
        };
        this.suppressNextClick = false;
    }

    NormalizePosts = (posts = []) => {
        return posts.map(post => ({
            ...post,
            comments: Array.isArray(post.comments) ? post.comments : []
        }));
    }

    componentDidMount() {
        this.timeRefreshInterval = setInterval(() => {
            this.forceUpdate();
        }, 60000);
        this.LoadCommentsForPosts(this.state.posts);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.posts !== this.props.posts) {
            const normalizedPosts = this.NormalizePosts(this.props.posts);
            const selectedPostStillExists = normalizedPosts.some(post => post.id === this.state.selectedPostId);

            this.setState({
                posts: normalizedPosts,
                selectedPostId: selectedPostStillExists ? this.state.selectedPostId : null,
                draftComment: selectedPostStillExists ? this.state.draftComment : ""
            });
            this.LoadCommentsForPosts(normalizedPosts);
            return;
        }
    }

    componentWillUnmount() {
        clearInterval(this.timeRefreshInterval);
        this.commentLoadRequestId += 1;
    }

    LoadCommentsForPosts = async (posts) => {
        if (typeof this.props.callbacks?.getComments !== "function" || posts.length === 0) {
            return;
        }

        const requestId = ++this.commentLoadRequestId;
        this.setState({ isLoadingComments: true });

        const commentsByPostId = await Promise.all(
            posts.map(async (post) => {
                try {
                    const comments = await this.props.callbacks.getComments(post.id);
                    return [post.id, Array.isArray(comments) ? comments : []];
                } catch (error) {
                    console.error(`Failed to load comments for post ${post.id}:`, error);
                    return [post.id, post.comments ?? []];
                }
            })
        );

        if (requestId !== this.commentLoadRequestId) {
            return;
        }

        const commentMap = new Map(commentsByPostId);

        this.setState(prevState => ({
            isLoadingComments: false,
            posts: prevState.posts.map(post => ({
                ...post,
                comments: commentMap.get(post.id) ?? post.comments ?? []
            }))
        }));
    }

    FormatPostDate = (createdAt) => {
        const createdDate = new Date(createdAt);
        const now = new Date();
        const diffInMinutes = Math.max(Math.floor((now - createdDate) / 60000), 0);

        if (diffInMinutes < 60) {
            return `${Math.max(diffInMinutes, 1)} minute${diffInMinutes === 1 ? "" : "s"} ago`;
        }

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
        }

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) {
            return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
        }

        const day = String(createdDate.getDate()).padStart(2, "0");
        const month = String(createdDate.getMonth() + 1).padStart(2, "0");
        const year = createdDate.getFullYear();

        return `${day}/${month}/${year}`;
    }

    UpdateLikesFromServer = () => {
        // Simulate fetching updated likes from an API
        const updatedPosts = this.state.posts.map(post => ({
            ...post,
            likes: post.likes + 1 // Simulate an increase in likes
        }));
        this.setState({ posts: updatedPosts });
    }

    ToggleLike = (postId) => {
        const updatedPosts = this.state.posts.map(post => {
            if (post.id !== postId) {
                return post;
            }

            const liked = !post.liked;
            const disliked = liked ? false : post.disliked;
            const dislikes = post.disliked && liked
                ? Math.max(post.dislikes - 1, 0)
                : post.dislikes;

            return {
                ...post,
                liked,
                disliked,
                likes: liked ? post.likes + 1 : Math.max(post.likes - 1, 0),
                dislikes
            };
        });

        this.setState({ posts: updatedPosts });

        if (typeof this.props.callbacks?.react === "function") {
            Promise.resolve(this.props.callbacks.react(postId, "like")).catch(error => {
                console.error("Failed to react to post:", error);
            });
        }
    }

    ToggleDislike = (postId) => {
        const updatedPosts = this.state.posts.map(post => {
            if (post.id !== postId) {
                return post;
            }

            const disliked = !post.disliked;
            const liked = disliked ? false : post.liked;
            const likes = post.liked && disliked
                ? Math.max(post.likes - 1, 0)
                : post.likes;

            return {
                ...post,
                liked,
                disliked,
                likes,
                dislikes: disliked ? post.dislikes + 1 : Math.max(post.dislikes - 1, 0)
            };
        });

        this.setState({ posts: updatedPosts });

        if (typeof this.props.callbacks?.react === "function") {
            Promise.resolve(this.props.callbacks.react(postId, "dislike")).catch(error => {
                console.error("Failed to react to post:", error);
            });
        }
    }

    CanManagePost = (post) => {
        const { currentUser } = this.state;

        if (!currentUser) {
            return false;
        }

        if (currentUser.role === "admin") {
            return true;
        }

        return currentUser.role === "author" && currentUser.id === post.authorId;
    }

    HandleEditPost = (postId) => {
        console.log(`Edit post ${postId}`);
    }

    HandleDeletePost = (postId) => {
        this.props.callbacks.deletePost(postId);
        this.setState(prevState => ({
            posts: prevState.posts.filter(post => post.id !== postId),
            selectedPostId: prevState.selectedPostId === postId ? null : prevState.selectedPostId,
            draftComment: prevState.selectedPostId === postId ? "" : prevState.draftComment
        }));
    }

    OpenShowcase = (postId) => {
        this.setState({
            selectedPostId: postId,
            draftComment: ""
        });
    }

    CloseShowcase = () => {
        this.setState({
            selectedPostId: null,
            draftComment: ""
        });
    }

    UpdateCommentDraft = (draftComment) => {
        this.setState({ draftComment });
    }

    SubmitComment = (postId, content) => {
        const trimmedComment = content.trim();

        if (!trimmedComment) {
            return;
        }

        const updatedPosts = this.state.posts.map(post => {
            if (post.id !== postId) {
                return post;
            }

            return {
                ...post,
                comments: [
                    ...post.comments,
                    {
                        id: Date.now(),
                        author: "You",
                        content: trimmedComment,
                        createdAt: "Just now"
                    }
                ]
            };
        });

        this.setState({
            posts: updatedPosts,
            draftComment: ""
        });

        if (typeof this.props.callbacks?.comment === "function") {
            Promise.resolve(this.props.callbacks.comment(postId, trimmedComment)).catch(error => {
                console.error("Failed to submit comment:", error);
            });
        }
    }

    IsInteractiveTarget = (target) => {
        return target.closest("button, a, input, textarea, select, [role='button']");
    }

    StartBlogDrag = (clientX) => {
        const blogElement = this.blogRef.current;

        if (!blogElement) {
            return;
        }

        this.blogDrag = {
            isPointerDown: true,
            startX: clientX,
            startScrollLeft: blogElement.scrollLeft,
            hasDragged: false
        };
    }

    UpdateBlogDrag = (clientX) => {
        const blogElement = this.blogRef.current;

        if (!this.blogDrag.isPointerDown || !blogElement) {
            return false;
        }

        const deltaX = clientX - this.blogDrag.startX;

        if (Math.abs(deltaX) > 6) {
            this.blogDrag.hasDragged = true;
        }

        if (this.blogDrag.hasDragged) {
            blogElement.scrollLeft = this.blogDrag.startScrollLeft - deltaX;

            if (!this.state.isDraggingBlog) {
                this.setState({ isDraggingBlog: true });
            }
        }

        return this.blogDrag.hasDragged;
    }

    EndBlogDrag = () => {
        if (!this.blogDrag.isPointerDown) {
            return;
        }

        this.suppressNextClick = this.blogDrag.hasDragged;
        this.blogDrag.isPointerDown = false;
        this.blogDrag.hasDragged = false;

        if (this.state.isDraggingBlog) {
            this.setState({ isDraggingBlog: false });
        }
    }

    HandleBlogMouseDown = (event) => {
        if (event.button !== 0 || this.IsInteractiveTarget(event.target)) {
            return;
        }

        this.StartBlogDrag(event.clientX);
        event.preventDefault();
    }

    HandleBlogMouseMove = (event) => {
        if (this.UpdateBlogDrag(event.clientX)) {
            event.preventDefault();
        }
    }

    HandleBlogTouchStart = (event) => {
        if (event.touches.length !== 1 || this.IsInteractiveTarget(event.target)) {
            return;
        }

        this.StartBlogDrag(event.touches[0].clientX);
    }

    HandleBlogTouchMove = (event) => {
        if (event.touches.length !== 1) {
            return;
        }

        if (this.UpdateBlogDrag(event.touches[0].clientX) && event.cancelable) {
            event.preventDefault();
        }
    }

    HandleBlogClickCapture = (event) => {
        if (!this.suppressNextClick) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        this.suppressNextClick = false;
    }

    renderBlogPost = (post) => {
        return (
            <div className="blog-post" key={post.id}>
                <ProtectedRoute accessLevel="1">
                    <div className="blog-post-admin-actions">
                        <button
                            type="button"
                            className="post-admin-button"
                            onClick={() => this.HandleEditPost(post.id)}
                        >
                            <Icon name="pencil-square" />
                        </button>
                        <button
                            type="button"
                            className="post-admin-button delete"
                            onClick={() => this.HandleDeletePost(post.id)}
                        >
                            <Icon name="trash" />
                        </button>
                    </div>
                </ProtectedRoute>
                <div className="blog-post-author">
                    <ProfileIcon
                        className="blog-post-author-image"
                        src={post.authorImage}
                        alt={`${post.author} profile`}
                        userId={post.authorId}
                    />
                    <div className="blog-post-author-details">
                        <h3>{post.author}</h3>
                        <span className="blog-post-date">{this.FormatPostDate(post.createdAt)}</span>
                    </div>
                </div>
                <h2 id="title">{post.title}</h2>
                <p>{post.content}</p>
                {post.postImage && (
                    <img className="blog-post-image" src={post.postImage} alt={`Blog post ${post.id}`} />
                )}
                <div className="blog-post-actions">
                    <button
                        type="button"
                        className={`like-button ${post.liked ? "liked" : ""}`}
                        onClick={() => this.ToggleLike(post.id)}
                        aria-pressed={post.liked}
                        aria-label={post.liked ? "Unlike this post" : "Like this post"}
                    >
                        <Icon name="hand-thumbs-up" />
                    </button>
                    <span className="like-count">{post.likes}</span>
                    <button
                        type="button"
                        className={`like-button dislike-button ${post.disliked ? "disliked" : ""}`}
                        onClick={() => this.ToggleDislike(post.id)}
                        aria-pressed={post.disliked}
                        aria-label={post.disliked ? "Remove dislike from this post" : "Dislike this post"}
                    >
                        <Icon name="hand-thumbs-down" />
                    </button>
                    <span className="like-count">{post.dislikes}</span>
                    <button
                        type="button"
                        className="comment-button"
                        onClick={() => this.OpenShowcase(post.id)}
                    >
                        <Icon name="chat-left-dots" />
                    </button>
                    <span className="like-count">{post.comments.length}</span>
                </div>
            </div>
        );
    }
    

    render() {
        const selectedPost = this.state.posts.find(post => post.id === this.state.selectedPostId) || null;

        return (
            <>
                <div
                    ref={this.blogRef}
                    className={`blog ${this.state.isDraggingBlog ? "dragging" : ""}`}
                    onMouseDown={this.HandleBlogMouseDown}
                    onMouseMove={this.HandleBlogMouseMove}
                    onMouseUp={this.EndBlogDrag}
                    onMouseLeave={this.EndBlogDrag}
                    onTouchStart={this.HandleBlogTouchStart}
                    onTouchMove={this.HandleBlogTouchMove}
                    onTouchEnd={this.EndBlogDrag}
                    onTouchCancel={this.EndBlogDrag}
                    onClickCapture={this.HandleBlogClickCapture}
                >
                    {this.state.posts.map(this.renderBlogPost)}
                </div>
                <BlogShowcase
                    post={selectedPost}
                    isOpen={selectedPost !== null}
                    draftComment={this.state.draftComment}
                    formatPostDate={this.FormatPostDate}
                    onClose={this.CloseShowcase}
                    onCommentDraftChange={this.UpdateCommentDraft}
                    onSubmitComment={this.SubmitComment}
                    onLike={this.ToggleLike}
                    onDislike={this.ToggleDislike}
                />
            </>
        );
    }
}

export default Blog;
