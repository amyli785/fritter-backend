import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import UserCollection from '../user/collection';
import FollowCollection from './collection';
import * as userValidator from '../user/middleware';
import * as followValidator from '../follow/middleware';
import * as util from './util';

const router = express.Router();

/**
 * View followers
 * 
 * @name GET /api/follow/followers
 * 
 * @return {FollowResponse[]} - An array of follows where the user is followed.
 * @throws {403} - if the user is not logged in
 */
router.get(
	'/followers',
	[
		userValidator.isUserLoggedIn,
	],
	async (req: Request, res: Response) => {
		const allFollowers = await FollowCollection.findAllFollowers(req.session.userId as string);
		const response = allFollowers.map(util.constructFollowResponse); // TODO return list of users
		res.status(200).json(response);
	}
)

/**
 * View following
 * 
 * @name GET /api/follow/following
 * 
 * @return {FollowResponse[]} - An array of follows where the user follows.
 * @throws {403} - if the user is not logged in
 */
 router.get(
	'/following',
	[
		userValidator.isUserLoggedIn,
	],
	async (req: Request, res: Response) => {
		const allFollowees = await FollowCollection.findAllFollowees(req.session.userId as string);
		const response = allFollowees.map(util.constructFollowResponse); // TODO return list of users
		res.status(200).json(response);
	}
)

/**
 * Create a new follow.
 * 
 * @name POST /api/follow
 * 
 * @param {string} followee - the user to follow
 * @return {FollowResponse} - the created follow
 * @throws {403} - if the user is not logged in
 * @throws {400} - if `followee` is empty
 * @throws {404} - if `followee` cannot be found
 * @throws {409} - if the user is already following `followee` or the user is `followee`
 */
router.post(
	'/',
	[
		userValidator.isUserLoggedIn,
		followValidator.isFolloweeExistsBody,
		followValidator.isFolloweeFollowable,
	],
	async (req: Request, res: Response) => {
		const followee = await UserCollection.findOneByUsername(req.body.followee as string);
		const follow = await FollowCollection.addOne(req.session.userId, followee._id);

		res.status(201).json({
		  message: 'Your follow was created successfully.',
		  follow: util.constructFollowResponse(follow)
		});
	}
)

/**
 * Delete a follow.
 * 
 * @name POST /api/follow/:followee
 * 
 * @param {string} followee - the user to follow
 * @return {string} - A success message
 * @throws {403} - if the user is not logged in
 * @throws {404} - if `followee` cannot be found
 * @throws {409} - if the user was not following `followee` or the user is `followee`
 */
router.delete(
	'/:followee?',
	[
		userValidator.isUserLoggedIn,
		followValidator.isFolloweeExistsParams,
		followValidator.isFolloweeUnfollowable,
	],
	async (req: Request, res: Response) => {
		const followee = await UserCollection.findOneByUsername(req.params.followee as string);
		await FollowCollection.deleteOne(req.session.userId, followee._id);
		res.status(200).json({
		  message: 'Your follow was deleted successfully.'
		});
	}
)

export {router as followRouter};
