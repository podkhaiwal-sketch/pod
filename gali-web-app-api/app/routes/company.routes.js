module.exports = app => {

    const companies = require("../controllers/company.controller.js");
    var router = require("express").Router();
    // Create a new Tutorial
    console.log("helo");

    
    router.post("/create-company", companies.create);
    /*router.post("/social-register", users.SocialCreate);
    router.post("/complete-profile", users.CompleteProfile);
    router.post("/get-profile", users.getProfile);
    router.post("/get-company-users", users.getCompanyUsers);
    router.post("/schedule-interview", users.ScheduleInterview);
    router.post("/get-user-interviews", users.getUserInterviews);
    
    // Retrieve all Tutorials
    router.post("/check-otp", users.verifyOtp);
    // Retrieve all published Tutorials
    router.post("/user-login", users.login);
    router.post("/create-post", users.createPost);
    router.post("/logout", users.logout);
    router.post("/create-real", users.createReal);
    
    router.post("/get-reals", users.getReals);
  
    router.post("/create-experience", users.createExperience);
    router.delete("/delete-experience", users.deleteExperience);
    router.delete("/delete-education", users.deleteEducation);
    router.post("/update-profile-image", users.updateProfileImage);
    router.post("/update-profile", users.updateProfile);
    
  
    router.post("/update-experience", users.updateExperience);
    router.post("/create-education", users.createEducation);
    router.post("/update-education", users.updateEducation);
    router.delete("/delete-comment", users.deleteComment);
    router.delete("/delete-post", users.deletePost);
    
    router.post("/create-comment", users.createComment);
    router.post("/create-child-comment", users.createChildComment);
    router.post("/get-comments", users.getComment);
    router.post("/create-like", users.createLike);
    router.post("/get-likes", users.getLike);
    router.get("/get-skills", users.getSkill);
    router.post("/get-posts", users.getPost);*/
    app.use('/api/company', router);
  
  };