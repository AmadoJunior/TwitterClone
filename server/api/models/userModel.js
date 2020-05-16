class User{
    constructor(userName, email, password){
        this.userName = userName;
        this.email = email;
        this.password = password;
        this.profileImg = "https://twittercloneprofiles.s3.us-east-2.amazonaws.com/tempProfile.png",
        this.backgroundImg = "https://twittercloneprofiles.s3.us-east-2.amazonaws.com/tempBackgroundImg.png"
    }
}
module.exports = User;