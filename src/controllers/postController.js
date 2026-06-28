import Post from '../models/Post.js';
import Comment from '../models/Comment.js';

// CREATE POST
export const createPost = async (req, res) => {
  try {
    const { caption, mediaUrl, mediaType } = req.body;
    const newPost = await Post.create({
      user: req.user.id, // Auth middleware se milega
      caption,
      mediaUrl,
      mediaType
    });
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET FEED POSTS (SABKE POSTS YA FRIENDS KE POSTS)
export const getFeed = async (req, res) => {
  try {
    // Abhi ke liye saare posts fetch kar rahe hain, baad mein isko privacy ke mutabiq filter kar sakte hain
    const posts = await Post.find()
      .populate('user', 'username profilePic')
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// LIKE / UNLIKE POST
export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.likes.includes(req.user.id)) {
      // Unlike
      post.likes = post.likes.filter(id => id.toString() !== req.user.id);
      await post.save();
      return res.status(200).json({ message: "Post unliked", likes: post.likes });
    } else {
      // Like
      post.likes.push(req.user.id);
      await post.save();
      
      // NOTE: Yahan se real-time notification trigger hogi socket ke through (baand mein add karenge)
      return res.status(200).json({ message: "Post liked", likes: post.likes, postOwner: post.user });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ADD COMMENT
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = await Comment.create({
      post: req.params.id,
      user: req.user.id,
      text
    });

    post.commentsCount += 1;
    await post.save();

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const getCommentsByPost = async (req, res) => {
  try {
    const { id } = req.params;

    // Comment model se saare comments find karna jo is postId se attach hain
    const comments = await Comment.find({ post: id })
      .populate('user', 'username profilePic')
      .sort({ createdAt: -1 }); // Naye comments sabse upar

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};