var express = require('express');
var router = express.Router();

const UserController = require('../controllers/user.controller');
const { isAuthenticated } = require('../middlewares/isAuth');

router.post('/signup', UserController.SignUp)
router.post('/login', UserController.Login)
router.post('/forgetpassword', UserController.forgetPassword)
router.post('/comparecode', UserController.compareCode)
router.post('/resetpassword', UserController.resetPassword)
router.post('/logout', isAuthenticated, UserController.logOut)
router.post('/token', UserController.token)

// router.route('signupq')
//     .get(isAuthenticated, UserController.SignUp)
//     .post(isAuthenticated, UserController.SignUp)   same route different methods use concept


router.post('/auth', isAuthenticated, async (req, res) => {
    res.send('profile')
})
//compareCode
module.exports = router;
