import type {Request, Response, NextFunction} from 'express';
import {Types} from 'mongoose';
import FollowCollection from './collection';
import UserCollection from '../user/collection';

/**
 * Checks if a user with userId as followee id in req.body exists
 */
 const isFolloweeExistsBody = async (req: Request, res: Response, next: NextFunction) => {
	if (!req.body.followee) {
	  res.status(400).json({
		error: 'Provided followee username must be nonempty.'
	  });
	  return;
	}
  
	const user = await UserCollection.findOneByUsername(req.body.followee as string);
	if (!user) {
	  res.status(404).json({
		error: `A user with username ${req.body.followee as string} does not exist.`
	  });
	  return;
	}
  
	next();
};

/**
 * Checks if a user with userId as followee id in req.body can be followed by the user
 */
 const isFolloweeFollowable = async (req: Request, res: Response, next: NextFunction) => {
	const followee = await UserCollection.findOneByUsername(req.body.followee as string);
	if (followee._id.toString() === req.session.userId.toString()) {
		res.status(409).json({
			error: `The user cannot follow themselves.`
		});
		return;
	}

	const follow = await FollowCollection.findOne(req.session.userId, followee._id);
	if (follow) {
		res.status(409).json({
			error: `The user is already following the user with username ${req.body.followee as string}.`
		});
		return;
	}
  
	next();
};

/**
 * Checks if a user with userId as followee id in req.params exists
 */
 const isFolloweeExistsParams = async (req: Request, res: Response, next: NextFunction) => {
	if (!req.params.followee) {
	  res.status(400).json({
		error: 'Provided followee username must be nonempty.'
	  });
	  return;
	}
  
	const user = await UserCollection.findOneByUsername(req.params.followee as string);
	if (!user) {
	  res.status(404).json({
		error: `A user with username ${req.params.followee as string} does not exist.`
	  });
	  return;
	}
  
	next();
};

/**
 * Checks if a user with userId as followee id in req.params can be unfollowed by the user
 */
 const isFolloweeUnfollowable = async (req: Request, res: Response, next: NextFunction) => {
	const followee = await UserCollection.findOneByUsername(req.params.followee as string);
	if (followee._id.toString() === req.session.userId.toString()) {
		res.status(409).json({
			error: `The user cannot unfollow themselves.`
		});
		return;
	}
	
	const follow = await FollowCollection.findOne(req.session.userId, followee._id);
	if (!follow) {
		res.status(409).json({
			error: `The user is already not following the user with username ${req.params.followee as string}.`
		});
		return;
	}
  
	next();
};

export {
	isFolloweeExistsBody,
	isFolloweeFollowable,
	isFolloweeExistsParams,
	isFolloweeUnfollowable,
}
  