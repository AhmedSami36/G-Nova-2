const express = require('express');
const router = express();
const userContoller=require('../controllers/UserController')

const userestateController = require('../controllers/estateController');
const middleware=require('../middleware/authMiddleware');
const compoundController=require("../controllers/compoundController")

router.post('/register',userContoller.signup);
router.post('/login',userContoller.signin);
router.get('/getinfo',middleware,userContoller.getuserinfo);
router.post('/forgetpassword',userContoller.forgotPassword);
router.post('/resetpassword',userContoller.resetPassword);
router.put('/editprofile',middleware,userContoller.updateprofile);
  
router.get('/getallestates',middleware, userestateController.getAllEstates);
router.get('/getestatebyid/:id', middleware,userestateController.getEstateById);
router.post('/createestate', middleware,userestateController.createEstate);
router.put('/updateestate/ :id',middleware, userestateController.updateEstate);
router.delete('/deleteestate/ :id',middleware, userestateController.deleteEstate);
router.get('/getestatebyname/:name',middleware, userestateController.getEstateByName);
router.get('/getestatesbycategory/:category',middleware, userestateController.getEstatesByCategory);
router.get('/estates/city/:city', middleware,userestateController.getEstatesByCity);
//view offers
router.get('/estates/offers', middleware,userestateController.getAllEstatesWithOffers);
//newlaunched
router.get('/estates/newly-launched',middleware, userestateController.getNewlyLaunchedEstates);
// Bio routes
//router.put('/addtobio', middleware, userContoller.updateBio); // No need for :id
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

module.exports = router;
