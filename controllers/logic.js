const getReels = async (req, res, next) => {
    try {
        let userId = req.query.userId;

        if (!userId) {
            throw new Error('please provide a userId.')
        }

        let user = await User.findOne({ where: { userId: userId } });
        console.log("USER================", user);

        if (!user) {
            throw new Error("Couldn't find user");
        }

        let files = await UserImage.findAll({
            where: { userId: userId, type: 'reel' },
            order: [['createdAt', 'DESC']]
        });

        let arrayData = []

        for (let allData of files) {

            let userLikes = await LIKE_ACTIVITY.findAll({
                where: { postId: allData.id }
            });

            let users = await User.findOne({
                where: { userId: allData.userId }
            });

            let updatedReel = {
                ...allData.dataValues,
                username: users.username ?? null,
                name: users.name ?? null,
                profileImage: users.profileImage ?? null,
                likes: 0,
                hashTags: [],
                isLiked: false
            };

            if (userLikes && userLikes.length > 0) {
                updatedReel.likes = userLikes ? userLikes.length : 0;
                for (let index = 0; index < userLikes.length; index++) {
                    const element = userLikes[index];
                    if (element.likedBy == userId) {
                        updatedReel.isLiked = true;
                    }
                }
            }

            let allHashTagsData = await HASHTAG.findAll({
                where: { postId: allData.id }
            });

            const allTagsData = JSON.parse(JSON.stringify(allHashTagsData));

            let hashTagArray = [];
            for (let i = 0; i < allTagsData.length; i++) {
                const hashTag = allTagsData[i];
                hashTagArray.push(hashTag.name)
            }

            if (hashTagArray && hashTagArray.length > 0) {
                updatedReel.hashTags = hashTagArray ? hashTagArray : [];
            }
            arrayData.push(updatedReel);
        }
        // console.log(mainArray, "Updated Files");
        res.status(200).json({
            status: "success",
            message: "reels get successfully",
            data: arrayData // Directly use updated mainArray
        });
    } catch (error) {
        console.error("Error fetching user reels:", error); // Error log
        res.status(400).json({
            status: "fail",
            message: error.message
        });
    }
};

const likeActivityForPost = async (req, res) => {
    try {
        console.log('enter', req.query)

        const { likedBy, postId } = req.query;

        if (!likedBy) {
            throw new Error('please provide a likedBy.')
        }

        let likedUser = await User.findOne({ where: { userId: likedBy } });

        if (!likedUser) {
            throw new Error("Couldn't find likedBy");
        }

        if (!req.query.likedBy) {
            throw new Error('please provide a likedBy');
        } else if (!req.query.postId) {
            throw new Error('please provide a postId')
        }

        let file = await UserImage.findOne({ where: { id: postId } });

        if (!file) {
            throw new Error('post not found.')
        }

        const likedByUser = await USER.findOne({
            where: { userId: likedBy },
        });

        const user = await USER.findOne({
            where: { userId: file.userId },
        });

        const existingLike = await LIKE_ACTIVITY.findOne({
            where: { likedBy: likedBy, postId }
        });

        if (existingLike) {

            await existingLike.destroy();

            const allLikes = await LIKE_ACTIVITY.findAll({
                where: {
                    postId: postId,
                },
            });

            const userObj = {
                'likesCount': allLikes.length,
            };

            return res.status(200).json({
                status: true,
                message: "Disliked successfully",
                data: userObj
            });
        }
        // const currentDate = new Date();
        const newLike = await LIKE_ACTIVITY.create({
            postId: postId,
            likedBy: likedBy
        });

        // const savenotification = await Notification.build({
        //   message: `${likedByUser.name} liked your feed.`,
        //   user_id: file.userId,
        //   isRead: false,
        //   type: "reelLike",
        //   created_at: moment.utc(),
        // });

        // await savenotification.save();

        // sendPushNotification(likedByUser, user);

        const allLikes = await LIKE_ACTIVITY.findAll({
            where: {
                postId: postId,
            },
        });

        const likeObject = {
            'id': newLike.id,
            'userId': newLike.userId,
            'likedBy': newLike.likedBy,
            'createdAt': newLike.createdAt,
            'likesCount': allLikes.length
        }

        res.status(200).json({
            status: true,
            message: 'Liked Successfully',
            data: likeObject
        });

    } catch (error) {
        res.status(400).json({
            status: 400,
            message: error.message
        });
    }
};

const getAllReels = async (req, res) => {

    try {

        let { limit, currentUser } = req.query
        let { cacheArray } = req.body;

        if (!cacheArray) {
            cacheArray = []
        }

        if (!limit) {
            throw new Error('please provide a limit.')
        } else if (!currentUser) {
            throw new Error('please provide a currentUser.')
        }

        if (typeof cacheArray === 'string') {
            try {
                cacheArray = JSON.parse(cacheArray);
            } catch (error) {
                throw new Error('cacheArray must be a valid JSON array.');
            }
        }

        const user = await User.findOne({
            where: {
                userId: currentUser
            }
        })

        if (!user) {
            throw new Error('please provide valid user.')
        }

        let reelsArray = [];

        // if(typeof)

        const excludeIds = cacheArray.join(',');

        const randomReels = await sequelize.query(
            `SELECT * FROM userFiles WHERE type = "reel" AND userId != ${currentUser} ${excludeIds ? `AND id NOT IN (${excludeIds})` : ``} ORDER BY RAND() LIMIT ${limit}`,
            { type: sequelize.QueryTypes.SELECT }
        );

        console.log('Random Reels:', randomReels);

        // if (!randomReels || randomReels.length === 0) {
        //   throw new Error("Couldn't find random reels");
        // }

        for (let singleReel of randomReels) {

            let userLikes = await LIKE_ACTIVITY.findAll({
                where: { postId: singleReel.id }
            });

            let users = await User.findOne({
                where: { userId: singleReel.userId }
            });

            let allHashTagsData = await HASHTAG.findAll({
                where: { postId: singleReel.id }
            });

            const allTagsData = JSON.parse(JSON.stringify(allHashTagsData));

            let hashTagArray = [];
            for (let i = 0; i < allTagsData.length; i++) {
                const hashTag = allTagsData[i];
                hashTagArray.push(hashTag.name)
            }

            let isLiked = false;
            if (userLikes && userLikes.length > 0) {
                for (let index = 0; index < userLikes?.length; index++) {
                    const element = userLikes[index];
                    if (element.likedBy == currentUser) {
                        isLiked = true;
                    }
                }
            }

            let updatedReel = {
                ...singleReel,
                username: users.username ?? null,
                name: users.name ?? null,
                profileImage: users.profileImage ?? null,
                hashTags: hashTagArray?.length > 0 ? hashTagArray : [],
                likes: userLikes?.length > 0 ? userLikes?.length : 0,
                isLiked: isLiked
            };

            reelsArray.push(updatedReel);
        }

        res.status(200).json({
            status: "success",
            message: "reels get successfully",
            data: reelsArray
        });

    } catch (error) {
        console.error("Error fetching reels:", error);
        res.status(400).json({
            status: "fail",
            message: error.message
        });
    }
};

const deleteReel = async (req, res) => {
    try {
        console.log(req.body)
        const { postId } = req.query

        if (!postId) {
            throw new Error('please provide postId.')
        }

        let findReel = await UserImage.findOne({
            where: { id: postId, type: 'reel' }
        });

        if (!findReel) {
            throw new Error('reel not found.')
        }

        await UserImage.destroy({
            where: { id: postId, type: 'reel' }
        });


        await LIKE_ACTIVITY.destroy({
            where: { postId: postId },
        });

        res.status(200).json({
            status: "success",
            message: "reel Delete successfully"
        });

    } catch (error) {
        res.status(400).json({
            status: "fail",
            message: error.message
        });
    }
}
// search for reels and profiles

const searchForReelsAndProfiles = async (req, res) => {
    try {

        const { search, currentUser } = req.query;

        if (!search) {
            throw new Error('please provide a search.')
        }

        const user = await User.findOne({
            where: {
                userId: currentUser
            }
        });

        if (!user) {
            throw new Error('please provide valid user.')
        }

        const users = await User.findAll({
            where: {
                [Op.or]: [
                    { username: { [Op.like]: `%${search}%` } },
                    { name: { [Op.like]: `%${search}%` } }
                ],
                username: {
                    [Op.not]: `${_constants.main.adminName}`
                }
            },
            attributes: ['userId', 'username', 'name', 'profileImage', 'city', 'country']


        });

        const hashtagsAllData = await HASHTAG.findAll({
            where: {
                name: { [Op.like]: `%${search}%` }
            },
            attributes: ['postId', 'name']
        });

        // console.log(JSON.parse(JSON.stringify(hashtagsAllData)), "hashtagsAllData")

        const hashTags = JSON.parse(JSON.stringify(hashtagsAllData))

        const reelsArray = [];
        const imagesArray = [];
        const videosArray = [];

        for (const iterator of hashTags) {

            let singleFile = await UserImage.findOne({
                where: {
                    id: iterator.postId,
                    userId: {
                        [Op.ne]: currentUser
                    },
                    type: {
                        [Op.ne]: 'story'
                    }
                }
            })

            if (!singleFile) {
                continue;
            }

            if (singleFile.type === 'reel') {

                let singleReel = JSON.parse(JSON.stringify(singleFile));

                let userLikes = await LIKE_ACTIVITY.findAll({
                    where: { postId: singleReel.id }
                });

                let user = await User.findOne({
                    where: { userId: singleReel.userId }
                });

                let allHashTagsData = await HASHTAG.findAll({
                    where: { postId: singleReel.id }
                });

                const allTagsData = JSON.parse(JSON.stringify(allHashTagsData));

                let hashTagArray = [];

                for (let i = 0; i < allTagsData.length; i++) {
                    const hashTag = allTagsData[i];
                    hashTagArray.push(hashTag.name)
                }

                let isLiked = false;
                if (userLikes && userLikes.length > 0) {
                    for (let index = 0; index < userLikes?.length; index++) {
                        const element = userLikes[index];
                        if (element.likedBy == currentUser) {
                            isLiked = true;
                        }
                    }
                }

                let updatedReel = {
                    ...singleReel,
                    username: user?.username ?? null,
                    name: user?.name ?? null,
                    profileImage: user?.profileImage ?? null,
                    hashTags: hashTagArray?.length > 0 ? hashTagArray : [],
                    likes: userLikes?.length > 0 ? userLikes?.length : 0,
                    isLiked: isLiked
                };

                reelsArray.push(updatedReel)

            } else if (singleFile.type === 'image') {

                let singleImage = JSON.parse(JSON.stringify(singleFile));

                let userLikes = await LIKE_ACTIVITY.findAll({
                    where: { postId: singleImage.id }
                });

                let user = await User.findOne({
                    where: { userId: singleImage.userId }
                });

                let allHashTagsData = await HASHTAG.findAll({
                    where: { postId: singleImage.id }
                });

                const allTagsData = JSON.parse(JSON.stringify(allHashTagsData));

                let hashTagArray = [];

                for (let i = 0; i < allTagsData.length; i++) {
                    const hashTag = allTagsData[i];
                    hashTagArray.push(hashTag.name)
                }

                let isLiked = false;
                if (userLikes && userLikes.length > 0) {
                    for (let index = 0; index < userLikes?.length; index++) {
                        const element = userLikes[index];
                        if (element.likedBy == currentUser) {
                            isLiked = true;
                        }
                    }
                }

                let updatedImage = {
                    ...singleImage,
                    username: user?.username ?? null,
                    name: user?.name ?? null,
                    profileImage: user?.profileImage ?? null,
                    hashTags: hashTagArray.length > 0 ? hashTagArray : [],
                    likes: userLikes?.length > 0 ? userLikes?.length : 0,
                    isLiked: isLiked
                };

                imagesArray.push(updatedImage)

            } else if (singleFile.type === 'Video') {

                let singleVideo = JSON.parse(JSON.stringify(singleFile));

                let userLikes = await LIKE_ACTIVITY.findAll({
                    where: { postId: singleVideo.id }
                });

                let user = await User.findOne({
                    where: { userId: singleVideo.userId }
                });

                let allHashTagsData = await HASHTAG.findAll({
                    where: { postId: singleVideo.id }
                });

                const allTagsData = JSON.parse(JSON.stringify(allHashTagsData));

                let hashTagArray = [];

                for (let i = 0; i < allTagsData.length; i++) {
                    const hashTag = allTagsData[i];
                    hashTagArray.push(hashTag.name)
                }

                let isLiked = false;
                if (userLikes && userLikes.length > 0) {
                    for (let index = 0; index < userLikes?.length; index++) {
                        const element = userLikes[index];
                        if (element.likedBy == currentUser) {
                            isLiked = true;
                        }
                    }
                }

                let updatedVideo = {
                    ...singleVideo,
                    username: user?.username ?? null,
                    name: user?.name ?? null,
                    profileImage: user?.profileImage ?? null,
                    hashTags: hashTagArray?.length > 0 ? hashTagArray : [],
                    likes: userLikes?.length > 0 ? userLikes?.length : 0,
                    isLiked: isLiked
                };
                videosArray.push(updatedVideo)
            }

        }

        const response = {
            users,
            reels: reelsArray,
            videos: videosArray,
            images: imagesArray
        }

        res.status(200).json({
            status: "success",
            message: "search successfully",
            data: response
        });

    } catch (error) {
        res.status(400).json({
            status: "fail",
            message: error.message
        });
    }
}

const getMultiplePosts = async (req, res) => {
    try {

        let { limit, currentUser } = req.query
        let { cacheArray } = req.body;

        if (!cacheArray) {
            cacheArray = []
        }

        if (!limit) {
            throw new Error('please provide a limit.')
        } else if (!currentUser) {
            throw new Error('please provide a currentUser.')
        }

        if (typeof cacheArray === 'string') {
            try {
                cacheArray = JSON.parse(cacheArray);
            } catch (error) {
                throw new Error('cacheArray must be a valid JSON array.');
            }
        }

        let randomPostsArray = [];

        const user = await User.findOne({
            where: {
                userId: currentUser
            }
        })

        if (!user) {
            throw new Error('please provide valid user.')
        }

        const excludeIds = cacheArray.join(',');

        const randomPosts = await sequelize.query(
            `SELECT * FROM userFiles WHERE userId != ${currentUser} ${excludeIds ? `AND id NOT IN (${excludeIds})` : ``} AND type != "story" ORDER BY RAND() LIMIT ${limit}`,
            { type: sequelize.QueryTypes.SELECT }
        );

        if (!randomPosts || randomPosts.length === 0) {
            throw new Error("Couldn't find random reels");
        }

        for (let singlePost of randomPosts) {

            let userLikes = await LIKE_ACTIVITY.findAll({
                where: { postId: singlePost.id }
            });

            let user = await User.findOne({
                where: { userId: singlePost.userId }
            });

            let allHashTagsData = await HASHTAG.findAll({
                where: { postId: singlePost.id }
            });

            const allTagsData = JSON.parse(JSON.stringify(allHashTagsData));

            let hashTagArray = [];
            for (let i = 0; i < allTagsData.length; i++) {
                const hashTag = allTagsData[i];
                hashTagArray.push(hashTag.name)
            }

            let isLiked = false;
            if (userLikes && userLikes.length > 0) {
                for (let index = 0; index < userLikes?.length; index++) {
                    const element = userLikes[index];
                    if (element.likedBy == currentUser) {
                        isLiked = true;
                    }
                }
            }

            let updatedPost = {
                ...singlePost,
                username: user?.username ? user?.username : null,
                name: user?.name ? user?.name : null,
                profileImage: user?.profileImage ? user.profileImage : null,
                hashTags: hashTagArray.length > 0 ? hashTagArray : [],
                likes: userLikes?.length > 0 ? userLikes?.length : 0,
                isLiked: isLiked
            };
            randomPostsArray.push(updatedPost);
        }

        res.status(200).json({
            status: "success",
            message: "reels get successfully",
            data: randomPostsArray
        });

    } catch (error) {
        console.error("Error fetching reels:", error);
        res.status(400).json({
            status: "fail",
            message: error.message
        });
    }
}

const addBadgePoints = async (req, res) => {
    try {

        const { userId, points } = req.query;

        if (!userId) {
            throw new Error('please provide a userId.')
        } else if (!points) {
            throw new Error('please provide a points.')
        }

        if (isNaN(points)) {
            throw new Error('points must be a valid number');
        }

        const user = await User.findOne({
            where: { userId }
        })

        if (!user) {
            throw new Error('user not found.')
        }

        const updatedPoints = user.badge_points !== null ? parseInt(user.badge_points) + parseInt(points) : points;

        await User.update(
            { badge_points: updatedPoints },
            { where: { userId } }
        );

        const updatedUser = await User.findOne({
            where: { userId },
            attributes: ["username", "name", "userId", "badge_points"]
        })

        res.status(200).json({
            status: "success",
            message: "points add successfully",
            data: updatedUser
        });

    } catch (error) {
        res.status(400).json({
            status: "fail",
            message: error.message
        });
    }
}
// reel end

// story Functoinality

const getStory = async (req, res) => {
    try {

        const userId = req.params.id

        if (!userId) {
            throw new Error('please provide a valid userId')
        }

        const user = await User.findOne({
            where: {
                userId
            }
        })

        if (!user) {
            throw new Error('user not found.')
        }

        const twentyFourHoursAgo = new Date(Date.now() - (24 * 60 * 60 * 1000)).getTime(); // Get the timestamp for 24 hours ago

        const stories = await UserImage.findAll({
            where: {
                type: 'story',
                userId,
                createdAt: {
                    [Op.gte]: twentyFourHoursAgo // Filter stories created within the last 24 hours
                }
            },
            order: [['createdAt', 'DESC']], // For MySQL
        });

        const filteredStoriesByUser = {};

        stories.forEach(story => {
            const { userId } = story;
            if (!filteredStoriesByUser[userId]) {
                filteredStoriesByUser[userId] = [];
            }
            filteredStoriesByUser[userId].push(story);
        });

        const getUser = async (userId) => {

            let findUser = await User.findOne({
                where: {
                    userId: userId
                }
            });

            if (!findUser) {
                return null;
            } else {
                return findUser;
            }
        };

        const result = Object.keys(filteredStoriesByUser).map(userId => ({
            userId,
            stories: filteredStoriesByUser[userId].map(async story => {
                let { userId } = story;

                let isSeen = await STORY_SEEN.findOne({
                    where: {
                        storyId: story.id,
                        viewerId: userId
                    }
                });
                return {
                    ...story.dataValues,
                    isSeen: isSeen ? true : false
                };
            }),
        }));

        const resolvedResult = await Promise.all(result.map(async user => {
            const userDetails = await getUser(user.userId);
            return {
                userId: userDetails.userId,
                profileImage: userDetails.profileImage,
                username: userDetails.username,
                name: userDetails.name,
                stories: await Promise.all(user.stories)
            };
        }));

        resolvedResult.forEach(user => {
            user.stories.sort((a, b) => a.createdAt - b.createdAt);
        });

        res.status(200).json({
            status: "success",
            message: "story get successfully",
            data: resolvedResult
        });

    } catch (error) {
        res.status(400).json({
            status: "fail",
            message: error.message
        });
    }
}

const storySeen = async (req, res) => {
    try {

        let { postId, userId } = req.query;

        if (!postId) {
            throw new Error('postId is required.');
        } else if (!userId) {
            throw new Error('userId is required.');
        }
        // console.log('enter in story')
        const findStory = await UserImage.findOne({
            where: {
                // [Op.like]: `%${endsWithUrlForFile}`.
                id: postId,
                type: 'story'
            }
        });
        // console.log(JSON.parse(JSON.stringify(findStory)), 'findStory')
        if (findStory) {
            // console.log(typeof findStory.userId, typeof userId, userId, findStory.userId)
            const isViewer = await STORY_SEEN.findOne({
                where: {
                    storyId: findStory?.id,
                    viewerId: userId
                }
            })
            if (!isViewer) {
                await STORY_SEEN.create({
                    storyId: findStory.id,
                    viewerId: userId
                })
            }
        }

        res.status(200).json({
            status: "success",
            message: "Story seen successfully."
        });

    } catch (error) {
        res.status(400).json({
            status: "fail",
            message: error.message
        });
    }
}

const getAllStory = async (req, res) => {
    try {
        // console.log(req.headers)
        let { currentUser } = req.query;
        let { usersCacheArray, limit } = req.body;

        // console.log(req.body,limit)

        if (!currentUser) {
            throw new Error('please provide a currentUser');
        }

        const twentyFourHoursAgo = new Date(Date.now() - (24 * 60 * 60 * 1000)).getTime(); // Get the timestamp for 24 hours ago
        // console.log(twentyFourHoursAgo)

        let stories = await UserImage.findAll({
            where: {
                type: 'story',
                userId: {
                    [Op.and]: {
                        [Op.ne]: currentUser,
                        [Op.notIn]: usersCacheArray
                    }
                },
                createdAt: {
                    [Op.gte]: twentyFourHoursAgo // Filter stories created within the last 24 hours
                },
            },
            order: Sequelize.literal('RAND()'), // For MySQL
        });

        // console.log(JSON.parse(JSON.stringify(stories)))

        let filteredStoriesByUser = {};

        stories.forEach(story => {
            const { userId } = story;
            if (!filteredStoriesByUser[userId]) {
                filteredStoriesByUser[userId] = [];
            }
            filteredStoriesByUser[userId].push(story);
        });

        const getUser = async (userId) => {
            let findUser = await User.findOne({
                where: {
                    userId: userId
                }
            });
            if (!findUser) {
                return null;
            } else {
                return findUser;
            }
        };

        const result = Object.keys(filteredStoriesByUser).map(userId => ({
            userId,
            stories: filteredStoriesByUser[userId].map(async story => {
                let isSeen = await STORY_SEEN.findOne({
                    where: {
                        storyId: story.id,
                        viewerId: currentUser
                    }
                });
                return {
                    ...story.dataValues,
                    isSeen: isSeen ? true : false
                };
            }),
        }));

        let resolvedResult = await Promise.all(result.map(async user => {

            const userDetails = await getUser(user.userId);
            return {
                userId: user.userId || null,
                profileImage: userDetails?.profileImage || null,
                username: userDetails?.username || null,
                name: userDetails?.name || null,
                stories: await Promise.all(user.stories)
            };

        }));

        resolvedResult.forEach(user => {
            user.stories.sort((a, b) => a.createdAt - b.createdAt);
        })

        resolvedResult = resolvedResult.slice(0, limit)

        res.status(200).json({
            status: "success",
            message: "stories get successfully",
            data: resolvedResult
        });

    } catch (error) {
        res.status(400).json({
            status: "fail",
            message: error.message
        });
    }
}

const chatReaction = async (req, res) => {
    try {
        const { userId, chatId, reaction } = req.body;

        if (!userId) {
            throw new Error('userId is required.');
        } else if (!chatId) {
            throw new Error('chatId is required.');
        } else if (!reaction) {
            throw new Error('reaction is required.');
        }

        let findMessage = await chat.findOne({
            where: {
                id: chatId
            }
        })

        if (!findMessage) {
            throw new Error('please provide valid messageId.')
        }

        let receiver = await User.findOne({
            where: {
                userId: findMessage.receiver_id,
            },
        });

        let sender = await User.findOne({
            where: {
                userId: findMessage.sender_id,
            },
        });

        let validIdsForUser = [findMessage?.sender_id, findMessage?.receiver_id]

        if (!validIdsForUser.includes(parseInt(userId))) {
            throw new Error('please provide valid user.')
        }

        let user = await USER.findOne({
            where: {
                userId: userId
            }
        })

        if (!user) {
            throw new Error('please provide valid userId.')
        }

        let exitingReaction = await CHAT_REACTION.findOne({
            where: {
                chatId: chatId, userId: userId
            }
        })

        if (exitingReaction) {

            exitingReaction.reaction = reaction;
            await exitingReaction.save();

            let updatedReaction = await CHAT_REACTION.findOne({
                where: {
                    chatId: chatId, userId: userId
                }
            })

        } else {
            // Create a new reaction
            let newReaction = await CHAT_REACTION.create({
                userId,
                chatId,
                reaction
            });
        }

        var finalChat = await CHAT_REACTION.findOne({ where: { chatId: chatId } });


        let chat_list = {
            sender_name: sender?.name,
            sender_id: sender?.userId,
            receiver_id: receiver.userId,
            receiver_name: receiver.name,
            message: findMessage.message,
            file: findMessage?.file,
            type: findMessage?.type,
            createdAt: findMessage.createdAt,
            id: findMessage?.id,
        };

        console.log("call brodacst : " + JSON.parse(JSON.stringify(chat_list)));

        await broadcastMessage(chat_list);

        const serverKey =
            // UPDATE UPDATE UPDATE
            // 'AAAAFTN1ifI:APA91bEdVo8JxbG2_bNDIJWor8VAdaiNfXVAOqMECt2K9SCEIK2ySvUiWGL60FeQX5s27XEfoRcVyXOjq_vHOTibJlk_X14MwAqr47SqUXD9xMlLGassGbGJsr7T6htL-_fQmaJyczya';
            "AAAAU2XdtVU:APA91bHeWPRUyqjgrjnSDgqNM5AcJ-_k3XvrT3xhPpAoqvyTcoKnaKP7BMUQs6SzhYwTtnvODMGiLZPKMTQlwrPgi4LS5TSownpgOjfRUKD6-RvEs-iMQYCIgnz3LAi9EAchmqan-zND";
        //----------------------------------------------------------------
        let fcm = new FCM(serverKey);
        // var notification = {
        //   title: "Notification",
        //   type: 0,
        //   body: `you received a new message form ${sender.name}`,
        // };

        console.log("token : " + receiver.device_token);
        let message = {
            data: {
                title: "Notification",
                type: "message",
                body: `${user.name} reacted your message`

            },
            notification: {
                title: "Notification",
                type: "message",
                body: `${user.name} reacted your message`

            },
            to: receiver.device_token,
        };
        console.log("message received", message);
        console.log("fcm : " + fcm);
        console.log("message : " + message);

        await fcm.send(message, function (err, response) {
            if (err) {
                console.log("Something has gone wrong!" + err);
                console.log("Respponse:! " + response);
            } else {
                console.log(message);
                // showToast("Successfully sent with response");
                console.log("Successfully sent with response: ", response);
            }
        });
        // Send success response
        res.status(200).json({
            status: "success",
            message: "Reaction added successfully",
            data: finalChat
        });
    } catch (error) {
        res.status(400).json({
            status: "fail",
            message: error.message
        });
    }
}

const getFeedUser = async (req, res, next) => {
    try {

        let userId = req.query.userId;
        let currentUser = req.query.currentUser

        var user = await User.findOne({ where: { userId: userId } })
        // console.log(user)

        var fileImages = await UserImage.findAll({
            where: { userId: userId, type: 'image', }
            , order: [['createdAt', 'DESC']]
        })

        var fileVideos = await UserImage.findAll({
            where: { userId: userId, type: 'video', }
            , order: [['createdAt', 'DESC']]
        })

        var fileReels = await UserImage.findAll({
            where: { userId: userId, type: 'reel', }
            , order: [['createdAt', 'DESC']]
        })

        let reelsArray = []
        for (let singleReel of fileReels) {

            let userLikes = await LIKE_ACTIVITY.findAll({
                where: { postId: singleReel.id }
            });

            let users = await User.findOne({
                where: { userId: singleReel.userId }
            });

            let updatedReel = {
                ...singleReel.dataValues,
                username: users.username ?? null,
                name: users.name ?? null,
                profileImage: users.profileImage ?? null,
                likes: 0,
                hashTags: [],
                isLiked: false
            };

            if (userLikes && userLikes.length > 0) {
                updatedReel.likes = userLikes ? userLikes?.length : 0;
                for (let index = 0; index < userLikes.length; index++) {
                    const element = userLikes[index];
                    // console.log(element.likedBy, userId, "check")
                    if (element.likedBy == currentUser) {
                        updatedReel.isLiked = true;
                    }
                }
            }

            let allHashTagsData = await HASHTAG.findAll({
                where: { postId: singleReel.id }
            });

            const allTagsData = JSON.parse(JSON.stringify(allHashTagsData));

            let hashTagArray = [];
            for (let i = 0; i < allTagsData.length; i++) {
                const hashTag = allTagsData[i];
                hashTagArray.push(hashTag.name)
            }

            if (hashTagArray && hashTagArray.length > 0) {
                updatedReel.hashTags = hashTagArray ? hashTagArray : [];
            }
            reelsArray.push(updatedReel);
        }

        let imageArray = [];
        for (let singleReel of fileImages) {
            let userLikes = await LIKE_ACTIVITY.findAll({
                where: { postId: singleReel.id }
            });

            let users = await User.findOne({
                where: { userId: singleReel.userId }
            });

            let updatedReel = {
                ...singleReel.dataValues,
                username: users.username ?? null,
                name: users.name ?? null,
                profileImage: users.profileImage ?? null,
                likes: 0,
                hashTags: [],
                isLiked: false
            };

            if (userLikes && userLikes.length > 0) {
                updatedReel.likes = userLikes ? userLikes.length : 0;
                for (let index = 0; index < userLikes.length; index++) {
                    const element = userLikes[index];
                    console.log(element.likedBy, userId, "check")
                    if (element.likedBy == currentUser) {
                        updatedReel.isLiked = true;
                    }
                }
            }

            let allHashTagsData = await HASHTAG.findAll({
                where: { postId: singleReel.id }
            });

            const allTagsData = JSON.parse(JSON.stringify(allHashTagsData));

            let hashTagArray = [];
            for (let i = 0; i < allTagsData.length; i++) {
                const hashTag = allTagsData[i];
                hashTagArray.push(hashTag.name)
            }

            if (hashTagArray && hashTagArray.length > 0) {
                updatedReel.hashTags = hashTagArray ? hashTagArray : [];
            }
            imageArray.push(updatedReel);
        }

        let videoArray = [];
        for (let singleReel of fileVideos) {
            let userLikes = await LIKE_ACTIVITY.findAll({
                where: { postId: singleReel.id }
            });

            let users = await User.findOne({
                where: { userId: singleReel.userId }
            });

            let updatedReel = {
                ...singleReel.dataValues,
                username: users.username ?? null,
                name: users.name ?? null,
                profileImage: users.profileImage ?? null,
                likes: 0,
                hashTags: [],
                isLiked: false
            };
            if (userLikes && userLikes.length > 0) {
                updatedReel.likes = userLikes ? userLikes.length : 0;
                for (let index = 0; index < userLikes.length; index++) {
                    const element = userLikes[index];
                    console.log(element.likedBy, userId, "check")
                    if (element.likedBy == currentUser) {
                        updatedReel.isLiked = true;
                    }
                }
            }

            let allHashTagsData = await HASHTAG.findAll({
                where: { postId: singleReel.id }
            });

            const allTagsData = JSON.parse(JSON.stringify(allHashTagsData));

            let hashTagArray = [];
            for (let i = 0; i < allTagsData.length; i++) {
                const hashTag = allTagsData[i];
                hashTagArray.push(hashTag.name)
            }

            if (hashTagArray && hashTagArray.length > 0) {
                updatedReel.hashTags = hashTagArray ? hashTagArray : [];
            }
            videoArray.push(updatedReel);
        }

        var response = {
            user: user,
            images: imageArray,
            videos: videoArray,
            reels: reelsArray
        }

        res.status(200).json({
            status: true,
            message: "get feed of user successfully.",
            data: response
        })
    } catch (error) {
        res.status(400).json({
            status: false,
            message: error.message
        })
    }
};