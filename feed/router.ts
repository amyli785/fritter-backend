import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import { BooleanExpression, AuthorExpression, TagExpression, NotExpression, AndExpression, OrExpression } from '../expression/BooleanExpression';
import { parse } from '../expression/parser';
import FreetCollection from '../freet/collection';
import FilterCollection from '../filter/collection';
import FollowCollection from '../follow/collection';
import * as userValidator from '../user/middleware';
import * as filterValidator from '../filter/middleware';
import * as feedValidator from './middleware';
import * as freetUtil from '../freet/util';

const router = express.Router();

/**
 * See all freets visible to the user
 * 
 * @name GET /api/feed
 * 
 * @return {FreetResponse[]} - an array of objects with the details of all freets that the user can view in descending order by date modified
 * @throws {403} if the user is not logged in
 */
router.get(
	'/',
	[
		userValidator.isUserLoggedIn,
	],
	async (req: Request, res: Response) => {
		const freets = await FreetCollection.findAll();
		const freetIdsViewable = await feedValidator.FindViewableFreets(
			freets.map((freet) => freet._id.toString()),
			req.session.userId
		);
		const freetsViewable = await FreetCollection.findAllByIds(freetIdsViewable);
		const response = freetsViewable.map(freetUtil.constructFreetResponse);
		res.status(200).json(response);
	},
);

/**
 * See the visible freets by accounts that the user is following
 * 
 * @name GET /api/feed/following
 * 
 * @return {FreetResponse[]} - an array of objects with the details of freets that are by the user's following that the user can view in descending order by date modified
 * @throws {403} - if the user is not logged in
 */
/**
 * See the freets matching the filter and visible to the user
 * 
 * @name GET /api/feed/:filterId
 * 
 * @return {FreetResponse[]} - an array of objects with the details of freets that match the filter that the user can view in descending order by date modified
 * @throws {403} - if the user is not logged in
 * @throws {400} - if `filterId` is in the wrong format
 * @throws {404} - if `filterId` cannot be found or is not associated with the user
 */
 router.get(
	'/:filterId',
	[
		userValidator.isUserLoggedIn,
	],
	async (req: Request, res: Response, next: NextFunction) => {
		if (req.params.filterId !== 'following') {
			next();
			return;
		}

		const followees = await FollowCollection.findAllFollowees(req.session.userId);
		const authorExprs: Array<BooleanExpression> = followees.map((follow) => new AuthorExpression(follow.followeeId._id.toString()));
		const booleanExpr = authorExprs.reduce((sofar, authorExpr) => new OrExpression(sofar, authorExpr));
		const freetIds = await booleanExpr.freetIds();
		const freetIdsViewable = await feedValidator.FindViewableFreets(freetIds, req.session.userId);
		const freetsViewable = await FreetCollection.findAllByIds(freetIdsViewable);
		const response = freetsViewable.map(freetUtil.constructFreetResponse);
		res.status(200).json(response);
	},
	[
		filterValidator.isFilterExistsAndOwned,
	],
	async (req: Request, res: Response) => {
		const filter = await FilterCollection.findOne(req.params.filterId);
		const expression = filter.expression;
		const booleanExpr = parse(expression);
		const freetIds = await booleanExpr.freetIds();
		const freetIdsViewable = await feedValidator.FindViewableFreets(freetIds, req.session.userId);
		const freetsViewable = await FreetCollection.findAllByIds(freetIdsViewable);
		const response = freetsViewable.map(freetUtil.constructFreetResponse);
		res.status(200).json(response);
	},
);

export {router as feedRouter};
