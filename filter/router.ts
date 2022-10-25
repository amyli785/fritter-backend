import type {Request, Response} from 'express';
import express from 'express';
import FilterCollection from './collection';
import * as userValidator from '../user/middleware';
import * as filterValidator from './middleware';

const router = express.Router();

/**
 * View the user's filters
 * 
 * @name GET /api/filters
 * 
 * @return {FilterModel[]} - an array of objects with the details of the filter
 * @throws {403} - if the user is not logged in
 */
router.get(
	'/',
	[
		userValidator.isUserLoggedIn,
	],
	async (req: Request, res: Response) => {
		const filters = await FilterCollection.findAllByUserId(req.session.userId as string);
		res.status(200).json(filters);
	}
);

/**
 * View the filter
 * 
 * @name GET /api/filters/:filterId
 * 
 * @return {FilterModel} - an object with the details of the filter
 * @throws {403} - if the user is not logged in
 * @throws {400} - if `filterId` is in the wrong format
 * @throws {404} - if `filterId` cannot be found or is not associated with the user
 */
router.get(
	'/:filterId?',
	[
		userValidator.isUserLoggedIn,
		filterValidator.isFilterExistsAndOwned,
	],
	async (req: Request, res: Response) => {
		const filter = await FilterCollection.findOne(req.params.filterId as string);
		res.status(200).json(filter);
	}
);

/**
 * Create a new filter
 * 
 * @name POST /api/filters
 * 
 * @param {string} `expression` - the boolean-like expression of the filter
 * @param {string} `name` - a name for the filter
 * @return {FilterModel} - an object with the details of the filter
 * @throws {403} - if the user is not logged in
 * @throws {400} - if the `expression` or `name` is in the wrong format
 */
router.post(
	'/',
	[
		userValidator.isUserLoggedIn,
		filterValidator.isNameValid,
		filterValidator.isExpressionValid,
	],
	async (req: Request, res: Response) => {
		const filter = await FilterCollection.addOne(req.session.userId as string, req.body.expression as string, req.body.name as string);
		res.status(201).json(filter);
	}
);

/**
 * Update an existing filter
 * 
 * @name PUT /api/filters/:filterId?
 * 
 * @param {string} `expression` - the new boolean-like expression of the filter
 * @param {string} `name` - the new name for the filter
 * @return {FilterModel} - an object with the details of the updated filter
 * @throws {403} - if the user is not logged in
 * @throws {400} - if `filterId`, `expression`, or `name` is in the wrong format
 * @throws {404} - if `filterId` cannot be found or is not associated with the user
 */
router.put(
	'/:filterId?',
	[
		userValidator.isUserLoggedIn,
		filterValidator.isFilterExistsAndOwned,
		filterValidator.isNameValid,
		filterValidator.isExpressionValid,
	],
	async (req: Request, res: Response) => {
		const filter = await FilterCollection.updateOne(req.params.filterId as string, req.body);
		res.status(200).json(filter);
	}
);

/**
 * Delete a filter
 * 
 * @name DELETE /api/filters/:filterId
 * 
 * @return {string} - a success message
 * @throws {403} - if the user is not logged in
 * @throws {400} - if `filterId` is in the wrong format
 * @throws {404} - if `filterId` cannot be found or is not associated with the user
 */
router.delete(
	'/:filterId?',
	[
		userValidator.isUserLoggedIn,
		filterValidator.isFilterExistsAndOwned,
	],
	async (req: Request, res: Response) => {
		await FilterCollection.deleteOne(req.params.filterId as string);
		res.status(200).json({
			message: 'Your filter was deleted successfully.'
		});
	}
);

export {router as filterRouter};
