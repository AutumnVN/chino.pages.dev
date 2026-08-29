const ANILIST_USER_ID = 7883267;

async function anilistGetUser() {
    return anilistQuery(`
        query ($userId: Int) {
            User(id: $userId) {
                avatar { large }
                siteUrl
            }
        }
    `, { userId: ANILIST_USER_ID });
}

async function anilistGetActivity() {
    return anilistQuery(`
        query ($userId: Int) {
            Page(perPage: 4) {
                activities(userId: $userId, sort: ID_DESC, type: MEDIA_LIST) {
                    ... on ListActivity {
                        status
                        progress
                        createdAt
                        siteUrl
                        media {
                            title { userPreferred }
                            coverImage { medium }
                        }
                    }
                }
            }
        }
    `, { userId: ANILIST_USER_ID });
}