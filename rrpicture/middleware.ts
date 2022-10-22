import type {Request, Response, NextFunction} from 'express';
import {Types} from 'mongoose';
import {RRPictureType, RRPictureTypeValues, RRPictureStatus, RRPictureStatusValues} from './model';
import RRPictureCollection from './collection';

/**
 * Checks if picture and pictureType in req.body are valid, nonempty strings
 */
const isPictureAndTypeValid = async (req: Request, res: Response, next: NextFunction) => {
	if (!req.body.picture.trim()) {
		res.status(400).json({
			error: 'RRPicture picture must be at least one character long.'
		});
		return;
	}

	if (!req.body.pictureType.trim()) {
		res.status(400).json({
			error: 'RRPicture pictureType must be at least one character long.'
		});
		return;
	}

	if (!RRPictureTypeValues.has(req.body.pictureType)) {
		res.status(400).json({
			error: `RRPicture pictureType value ${req.body.pictureType} is not valid.`
		});
		return;
	}

	next();
};

/**
 * Checks if the user has a current picture
 */
const hasCurrentPicture = async (req: Request, res: Response, next: NextFunction) => {
	const rrpicture = await RRPictureCollection.findCurrentByUser(req.session.userId);
	if (!rrpicture) {
		res.status(409).json({
			error: 'The user does not have a current profile picture.',
		});
		return;
	}

	next();
};

/**
 * Checks if rrpictureId in req.params exists as a picture associated with the user
 */
const isUsersPicture = async (req: Request, res: Response, next: NextFunction) => {
	const validFormat = Types.ObjectId.isValid(req.params.rrpictureId);
	const rrpicture = validFormat ? await RRPictureCollection.findOneByIdAndUser(req.params.rrpictureId, req.session.userId) : undefined;
	if (!rrpicture) {
		res.status(404).json({
			error: `RRPicture with id ${req.params.rrpictureId} does not exist for the user.`,
		});
		return;
	}
	next();
};

export {
	isPictureAndTypeValid,
	hasCurrentPicture,
	isUsersPicture,
};