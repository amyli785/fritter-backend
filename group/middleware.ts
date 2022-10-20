import type {Request, Response, NextFunction} from 'express';
import GroupMemberCollection from 'groupMember/collection';
import {Types} from 'mongoose';
import UserCollection from '../user/collection';
import GroupCollection from './collection';

/**
 * Checks if a name in req.body is valid (a nonempty alphanumeric string)
 */
const isNameValid = (req: Request, res: Response, next: NextFunction) => {
	const nameRegex = /^\w+$/;
	if (!nameRegex.test(req.body.name)) {
		res.status(400).json({
			error: {
				name: 'Name must be a nonempty alphanumeric string.'
			}
		});
		return;
	}
	next();
};

/**
 * Checks that a name in req.body is not already in use
 */
const isNameNotAlreadyInUse = async (req: Request, res: Response, next: NextFunction) => {
	const group = await GroupCollection.findOneByUserAndName(req.session.userId, req.body.name);

	if (group) {
		res.status(409).json({
			error: {
				name: 'A group with this name already exists for this user.'
			}
		});
		return;
	}

	next();
};

/**
 * Checks if group name in req.params exists and views the user
 */
const isGroupExistsAndViews = async (req: Request, res: Response, next: NextFunction) => {
	const group = await GroupCollection.findOneByUserAndName(req.session.userId, req.params.name);

	if (!group) {
		res.status(404).json({
			error: `The group ${req.params.name} does not exist, or the user cannot access it.`
		});
		return;
	}

	next();
};

/**
 * Checks if a member in req.body or req.params is non-empty, exists, and is not the user.
 */
const isMemberValid = async (req: Request, res: Response, next: NextFunction) => {
	const memberUsername = req.body.member ? req.body.member : req.params.member;
	if (!memberUsername) {
		res.status(400).json({
			error: 'Provided member must be nonempty.'
		});
		return;
	}

	const member = await UserCollection.findOneByUsername(memberUsername as string);
	if (!member) {
		res.status(404).json({
			error: `A user with id ${memberUsername as string} does not exist.`
		});
		return;
	}

	if (member._id.toString() === req.session.userId as string) {
		res.status(409).json({
			error: `The user cannot change their own membership in a view group.`
		});
		return;
	}

	next();
};

export {
	isNameValid,
	isNameNotAlreadyInUse,
	isGroupExistsAndViews,
	isMemberValid,
};