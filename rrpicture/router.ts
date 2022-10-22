import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import RRPictureCollection from './collection';
import * as userValidator from '../user/middleware';
import * as rrpicturevalidator from './middleware';
import * as util from './util';
import { RRPictureStatus } from './model';
import UserCollection from '../user/collection';

const router = express.Router();

/**
 * See current profile picture of the user
 * 
 * @name GET /api/rrpictures/current
 * 
 * @return {RRPictureResponse} - the user's current profile picture, if any
 * @throws {403} - if the user is not logged in
 */
router.get(
	'/current',
	[
		userValidator.isUserLoggedIn,
	],
	async (req: Request, res: Response) => {
		const rrpicture = await RRPictureCollection.findCurrentByUser(req.session.userId);
		const response = rrpicture ? util.constructRRPictureResponse(rrpicture): null;
		res.status(200).json(response);
	},
);

/**
 * See current profile picture for the specified user
 * 
 * @name GET /api/rrpictures/current/:username
 * 
 * @return {RRPictureResponse} - the current profile picture of `username`, if any
 * @throws {404} - if `username` cannot be found
 */
router.get(
	'/current/:username?',
	[
		userValidator.isUserLoggedIn,
		userValidator.isUsernameExists,
	],
	async (req: Request, res: Response) => {
		const user = await UserCollection.findOneByUsername(req.params.username);
		const rrpicture = await RRPictureCollection.findCurrentByUser(user._id.toString());
		const response = rrpicture ? util.constructRRPictureResponse(rrpicture): null;
		res.status(200).json(response);
	},
);

/**
 * Set a new current profile picture for the user
 * 
 * @name POST /api/rrpictures/current
 * 
 * @param {string} picture - the desired picture (raw, a path, or a link) represented as a string
 * @param {string} pictureType - the type of the picture, one of: "RawString", "Path", "Link"
 * @param {boolean} maintainPrevious - whether to store the current profile picture in the list of maintained previous profile pictures (ignored if the current profile picture is `None`); defaults to `false`
 * @return {RRPictureResponse} - an object with the details of the new profile picture
 * @throws {403} - if the user is not logged in
 * @throws {400} - if `picture` or `pictureType` is missing in the req or `pictureType` is an invalid value
 */
router.post(
	'/current',
	[
		userValidator.isUserLoggedIn,
		rrpicturevalidator.isPictureAndTypeValid,
	],
	async (req: Request, res: Response) => {
		const rrpictureCurrent = await RRPictureCollection.findCurrentByUser(req.session.userId);
		const maintainPrevious = req.body.maintainPrevious==='true' || req.body.maintainPrevious==='on';
		if (rrpictureCurrent){
			if (maintainPrevious) {
				RRPictureCollection.updateCurrentToPrevious(req.session.userId);
			} else {
				RRPictureCollection.deleteCurrentByUser(req.session.userId);
			}
		}
		const rrpicture = await RRPictureCollection.addOne(
			req.session.userId,
			req.body.picture,
			req.body.pictureType,
			RRPictureStatus.Current,
		);

		res.status(201).json({
			message: 'Your current profile picture was created successfully.',
			rrpicture: util.constructRRPictureResponse(rrpicture),
		});
	},
);

/**
 * Delete the current profile picture of the user
 * 
 * @name DELETE /api/rrpictures/current
 * 
 * @return {string} - a success message
 * @throws {403} - if the user is not logged in
 * @throws {409} - if the user does not have a current profile picture
 */
router.delete(
	'/current',
	[
		userValidator.isUserLoggedIn,
		rrpicturevalidator.hasCurrentPicture,
	],
	async (req: Request, res: Response) => {
		await RRPictureCollection.deleteCurrentByUser(req.session.userId);
		res.status(200).json({
			message: 'Your current profile picture was deleted successfully.'
		});
	}
);

/**
 * Get the user's list of maintained previous profile pictures
 * 
 * @name GET /api/rrpictures/previous
 * 
 * @return {RRPictureResponse[]} - a list of objects with the details of the user's maintained previous profile pictures
 * @throws {403} - if the user is not logged in
 */
router.get(
	'/previous',
	[
		userValidator.isUserLoggedIn,
	],
	async (req: Request, res: Response) => {
		const rrpictures = await RRPictureCollection.findPreviousByUser(req.session.userId);
		const response = rrpictures.map(util.constructRRPictureResponse);
		res.status(200).json(response);
	},
);

/**
 * Add a picture to the user's list of maintained previous profile pictures
 * 
 * @name POST /api/rrpictures/previous
 * 
 * @param {string} picture - the desired picture (raw, a path, or a link) represented as a string
 * @param {string} pictureType - the type of the picture, one of: "RawString", "Path", "Link"
 * @return {RRPictureResponse[]} - a list of objects with the details of the user's updated maintained previous profile pictures
 * @throws {403} - if the user is not logged in
 * @throws {400} - if `picture` or `pictureType` is in the wrong format or missing in the req
 */
router.post(
	'/previous',
	[
		userValidator.isUserLoggedIn,
		rrpicturevalidator.isPictureAndTypeValid,
	],
	async (req: Request, res: Response) => {
		const rrpicture = await RRPictureCollection.addOne(
			req.session.userId,
			req.body.picture,
			req.body.pictureType,
			RRPictureStatus.Previous.toString(),
		);
		const rrpictures = await RRPictureCollection.findPreviousByUser(req.session.userId);
		res.status(200).json({
			message: 'Your previous profile picture was created successfully.',
			rrpictures: rrpictures.map(util.constructRRPictureResponse),
		});
	},
);

/**
 * Remove the picture from the user's list of maintained previous profile pictures
 * 
 * @name DELETE /api/rrpictures/previous/:rrpictureId
 * 
 * @return {RRPictureResponse[]} - a list of objects with the details of the user's updated maintained previous profile pictures
 * @throws {403} - if the user is not logged in
 * @throws {404} - if `rrpictureId` cannot be found or is not associated with the user
 */
router.delete(
	'/previous/:rrpictureId?',
	[
		userValidator.isUserLoggedIn,
		rrpicturevalidator.isUsersPicture,
	],
	async (req: Request, res: Response) => {
		await RRPictureCollection.deleteOne(req.params.rrpictureId);
		const rrpictures = await RRPictureCollection.findPreviousByUser(req.session.userId);
		res.status(200).json({
			message: 'Your previous profile picture was deleted successfully.',
			rrpictures: rrpictures.map(util.constructRRPictureResponse),
		});
	},
);

export {router as rrpictureRouter};
