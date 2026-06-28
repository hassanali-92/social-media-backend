import User from '../models/User.js';

// SEND FRIEND REQUEST
export const sendFriendRequest = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!targetUser) return res.status(404).json({ message: "User not found" });
    if (currentUser.friends.includes(targetUser._id)) return res.status(400).json({ message: "Already friends" });

    if (!targetUser.friendRequests.includes(currentUser._id)) {
      targetUser.friendRequests.push(currentUser._id);
      currentUser.sentRequests.push(targetUser._id);
      await targetUser.save();
      await currentUser.save();
    }

    res.status(200).json({ message: "Friend request sent successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ACCEPT FRIEND REQUEST
export const acceptFriendRequest = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const senderUser = await User.findById(req.params.id);

    if (!currentUser.friendRequests.includes(senderUser._id)) {
      return res.status(400).json({ message: "No friend request found from this user" });
    }

    // Remove from request lists
    currentUser.friendRequests = currentUser.friendRequests.filter(id => id.toString() !== senderUser._id.toString());
    senderUser.sentRequests = senderUser.sentRequests.filter(id => id.toString() !== currentUser._id.toString());

    // Add to friends lists
    currentUser.friends.push(senderUser._id);
    senderUser.friends.push(currentUser._id);

    await currentUser.save();
    await senderUser.save();

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// TOGGLE PRIVACY SETTING (PUBLIC/PRIVATE)
export const togglePrivacy = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.isPrivate = !user.isPrivate;
    await user.save();
    res.status(200).json({ message: `Account is now ${user.isPrivate ? 'Private' : 'Public'}`, isPrivate: user.isPrivate });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};