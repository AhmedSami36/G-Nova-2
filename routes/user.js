const express = require('express');
const router = express();
const userContoller=require('../controllers/UserController')
const notificationController=require('../controllers/NotificationController');
const userestateController = require('../controllers/estateController');
const middleware=require('../middleware/authMiddleware');
const compoundController=require("../controllers/compoundController")


router.post('/register',userContoller.uploadphoto,userContoller.resizePhoto,userContoller.signup);
router.post('/login',userContoller.signin);
router.get('/getinfo',middleware,userContoller.getuserinfo);
router.post('/forgetpassword',userContoller.forgotPassword);
router.post('/resetpassword',userContoller.resetPassword);
router.put('/editprofile',middleware,userContoller.uploadphoto,userContoller.resizePhoto,userContoller.updateprofile);
  
router.get('/getallestates',middleware, userestateController.getAllEstates);
router.get('/getestatebyid/:id', middleware,userestateController.getEstateById);

router.get('/getestatebyname/:name',middleware, userestateController.getEstateByName);
router.get('/getestatesbycategory/:category',middleware, userestateController.getEstatesByCategory);
router.get('/getEstatesByCity/:city', middleware,userestateController.getEstatesByCity);


//view offers
router.get('/getAllEstatesWithOffers', middleware,userestateController.getAllEstatesWithOffers);
//newlaunched
router.get('/getNewlyLaunchedEstates',middleware, userestateController.getNewlyLaunchedEstates);
// Bio routes
router.put('/updateBio', middleware, userContoller.updateBio); // No need for :id
router.get('/viewbio', middleware, userContoller.viewBio); // No need for :id

// Favorite routes
router.post('/addtofavorites', middleware, userContoller.addToFavourites); // No need for :id
router.delete('/removefromfavorites', middleware, userContoller.removeFromFavourites); // No need for :id
router.get('/viewfavorites', middleware, userContoller.viewFavourites); // No need for :id




router.get('/getAllChatsForUser',middleware,userContoller.getAllChatsForUser);
router.get('/getChatHistoryForUser/:chatId',middleware,userContoller.getChatHistoryForUser);
router.get('/searchUserByUsername/:username',middleware,userContoller.getAllChatsForUser);

// compound routes
// Get all compounds
router.get('/getAllCompounds', compoundController.getAllCompounds);
// Get a single compound by ID
router.get('/getCompoundById/:id', compoundController.getCompoundById);



router.get('/getNotifications', middleware, notificationController.getNotifications);


router.patch('/markAsRead/:id/read', middleware, notificationController.markAsRead);



module.exports = router;
