import type {HydratedDocument} from 'mongoose';
import moment from 'moment';
import type {RRPicture, PopulatedRRPicture} from './model';
import {RRPictureType, RRPictureStatus} from './model';

type RRPictureResponse = {
	_id: string;
	userId: string;
	username: string;
	picture: string;
	pictureType: string;
	status: string;
}

/**
 * Transform a raw RRPicture object from the database into an object
 * with all the information needed by the frontend
 * 
 * @param {HydratedDocument<RRPicture>} rrpicture - an rrpicture
 * @returns {RRPictureResponse} - The rrpicture object formatted for the frontend
 */
const constructRRPictureResponse = (rrpicture: HydratedDocument<RRPicture>): RRPictureResponse => {
	const rrpictureCopy: PopulatedRRPicture = {
		...rrpicture.toObject({
			versionKey: false
		})
	};

	return {
		_id: rrpictureCopy._id.toString(),
		userId: rrpictureCopy.userId._id.toString(),
		username: rrpictureCopy.userId.username,
		picture: rrpictureCopy.picture,
		pictureType: rrpictureCopy.pictureType,
		status: rrpictureCopy.status,
	};
};

export {
	constructRRPictureResponse,
}
