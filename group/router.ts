import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import UserCollection from '../user/collection';
import GroupCollection from './collection';
import GroupMemberCollection from '../groupMember/collection';
import * as userValidator from '../user/middleware';
import * as groupValidator from './middleware';
import * as util from './util';

const router = express.Router();

/**
 * Get the user's view groups
 * 
 * @name GET /api/groups
 * 
 * @return {GroupWithMembersResponse[]} - an array of objects with details of the user's view groups, including the group members
 * @throws {403} - if the user is not logged in
 */
router.get(
	'/',
	[
		userValidator.isUserLoggedIn
	],
	async (req: Request, res: Response) => {
		const groups = await GroupCollection.findAllByUserId(req.session.userId as string);
		const response = await Promise.all(groups.map(async (group) => {
			const members = await GroupMemberCollection.findAllByGroup(group._id)
			return util.constructGroupWithMembersResponse(group, members);
		}));
		res.status(200).json(response);
	}
);

/**
 * Make a new view group that views the user
 * 
 * @name POST /api/groups
 * 
 * @param {string} name - a name for the group
 * @return {GroupResonse} - an object with the details of the new group, excluding the members
 * @throws {403} - if the user is not logged in
 * @throws {400} - if `name` is not in correct format or missing in the req
 * @throws {409} - if the user already has a group named `name`
 */
router.post(
	'/',
	[
		userValidator.isUserLoggedIn,
		groupValidator.isNameValid,
		groupValidator.isNameNotAlreadyInUse,
	],
	async (req: Request, res: Response) => {
		const group = await GroupCollection.addOne(req.session.userId as string, req.body.name);

		res.status(201).json({
			message: 'Your group was created successfully.',
			group: util.constructGroupResponse(group),
		})
	}
);

/**
 * Get the details of the view group
 * 
 * @name GET /api/groups/:name
 * 
 * @return {GroupWithMembersResponse} - an object with the details of the group, including the group members
 * @throws {403} - if the user is not logged in
 * @throws {404} - if the group `name` cannot be found or does not "view" the user
 */
router.get(
	'/:name?',
	[
		userValidator.isUserLoggedIn,
		groupValidator.isGroupExistsAndViews,
	],
	async (req: Request, res: Response) => {
		const group = await GroupCollection.findOneByUserAndName(req.session.userId, req.params.name);
		const members = await GroupMemberCollection.findAllByGroup(group._id);

		res.status(200).json({
			group: util.constructGroupWithMembersResponse(group, members),
		});
	}
);

/**
 * Delete the view group
 * 
 * @name DELETE /api/groups/:name
 * 
 * @return {string} - a success message
 * @throws {403} - if the user is not logged in
 * @throws {404} - if the group `name` cannot be found or does not "view" the user
 */
router.delete(
	'/:name?',
	[
		userValidator.isUserLoggedIn,
		groupValidator.isGroupExistsAndViews,
	],
	async (req: Request, res: Response) => {
		const group = await GroupCollection.findOneByUserAndName(req.session.userId, req.params.name);
		await GroupMemberCollection.deleteByGroup(group._id);
		await GroupCollection.deleteOne(group._id);
		res.status(200).json({
			message: 'Your group (and its members) were deleted successfully.'
		});
	}
);

/**
 * Update the view group with a new member
 * 
 * @name POST /api/groups/:name
 * 
 * @param {string} member - the username of the member to add to the group
 * @return {GroupWithMembersResponse} - an object with the details of the updated group, including the group members
 * @throws {403} - if the user is not logged in
 * @throws {404} - if the group `name` cannot be found for the user or `member` cannot be found
 * @throws {400} - if `member` is missing in the req
 * @throws {409} - if the group `name` already contains `member` or `member` is the user
 */
router.post(
	'/:name?',
	[
		userValidator.isUserLoggedIn,
		groupValidator.isGroupExistsAndViews,
		groupValidator.isMemberValid,
	],
	async (req: Request, res: Response, next: NextFunction) => {
		const group = await GroupCollection.findOneByUserAndName(req.session.userId, req.params.name);
		const member = await UserCollection.findOneByUsername(req.body.member);
		const groupMember = await GroupMemberCollection.findOne(group._id, member._id);
		if (groupMember) {
			res.status(409).json({
				error: `The username ${req.body.member} is already a member of the view group.`,
			});
			return;
		}
		next();
	},
	async (req: Request, res: Response, next: NextFunction) => {
		const group = await GroupCollection.findOneByUserAndName(req.session.userId, req.params.name);
		const member = await UserCollection.findOneByUsername(req.body.member);
		const groupMember = await GroupMemberCollection.addOne(group._id, member._id);
	
		const groupUpdated = await GroupCollection.findOne(group._id);
		const members = await GroupMemberCollection.findAllByGroup(group._id);

		res.status(200).json({
			message: 'The group member was successfully created.',
			group: util.constructGroupWithMembersResponse(groupUpdated, members),
		});
	},
);

/**
 * Delete the member from the view group
 * 
 * @name DELETE /api/groups/:name/:member
 * 
 * @param {GroupWithMembersResponse} - an object with the details of the updated group, including the group members
 * @throws {403} - if the user is not logged in
 * @throws {404} - if the group `name` cannot be found for the user or `member` cannot be found
 * @throws {400} - if `member` is missing in the req
 * @throws {409} - if the group `name` did not contain `member` or `member` is the user
 */
router.delete(
	'/:name?/:member?',
	[
		userValidator.isUserLoggedIn,
		groupValidator.isGroupExistsAndViews,
		groupValidator.isMemberValid,
	],
	async (req: Request, res: Response) => {
		const group = await GroupCollection.findOneByUserAndName(req.session.userId, req.params.name);
		const member = await UserCollection.findOneByUsername(req.params.member);
		const groupMember = await GroupMemberCollection.findOne(group._id, member._id);
		if (!groupMember) {
			res.status(409).json({
				error: `The username ${req.body.member} is already not a member of the view group.`,
			});
			return;
		}

		await GroupMemberCollection.deleteOne(groupMember._id);
		
		const groupUpdated = await GroupCollection.findOne(group._id);
		const members = await GroupMemberCollection.findAllByGroup(group._id);

		res.status(200).json({
			message: 'The group member was successfully deleted.',
			group: util.constructGroupWithMembersResponse(groupUpdated, members),
		});
	},
);

export {router as groupRouter};