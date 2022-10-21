import type {HydratedDocument, Types} from 'mongoose';
import type {RRPicture} from './model';
import RRPictureModel from './model';
import { RRPictureType, RRPictureStatus } from './model';

class RRPictureCollection {
	/**
	 * Add a rrpicture to the collection
	 * 
	 * @param {string} userId - the id of the user
	 * @param {string} picture - the picture (raw, path, or link) as a string
	 * @param {RRPictureType} pictureType - the type of the picture: raw, path, link
	 * @param {RRPictureStatus} status - the status of the picture: current or previous
	 * @returns {Promise<HydratedDocument<RRPicture>>} - the newly created rrpicture
	 */
	static async addOne(userId: Types.ObjectId | string, picture: string, pictureType: RRPictureType | string, status: RRPictureStatus | string): Promise<HydratedDocument<RRPicture>> {
		const rrpicture = new RRPictureModel({
			userId,
			picture,
			pictureType,
			status,
		});
		await rrpicture.save();
		return rrpicture.populate('userId');
	}

	/**
	 * Find a rrpicture by rrpictureId
	 * 
	 * @param {string} rrpictureId - the id of the rrpicture to find
	 * @returns {Promise<HydratedDocument<RRPicture>> | Promise<null>} - the rrpicture with the given rrpictureId, if any
	 */
	static async findOne(rrpictureId: Types.ObjectId | string): Promise<HydratedDocument<RRPicture>> {
		return RRPictureModel.findOne({_id: rrpictureId}).populate('userId');
	}

	/**
	 * Find a rrpicture by rrpictureId and userId
	 * 
	 * @param {string} rrpictureId - the id of the rrpicture to find
	 * @param {string} userId - the id of the user the rrpicture is associated with
	 * @returns {Promise<HydratedDocument<RRPicture>> | Promise<null>} - the rrpicture found, if any
	 */
	static async findOneByIdAndUser(rrpictureId: Types.ObjectId | string, userId: Types.ObjectId | string): Promise<HydratedDocument<RRPicture>> {
		return RRPictureModel.findOne({_id: rrpictureId, userId: userId}).populate('userId');
	}

	/**
	 * Find the current rrpicture for userId
	 * 
	 * @param {string} userId - the id of the user the rrpicture is for
	 * @returns {Promise<HydratedDocument<RRPicture>> | Promise<null>} - the user's current rrpicture, if any
	 */
	static async findCurrentByUser(userId: Types.ObjectId | string): Promise<HydratedDocument<RRPicture>> {
		return RRPictureModel.findOne({userId: userId, status: RRPictureStatus.Current.toString()}).populate('userId');
	}

	/**
	 * Find the previous rrpictures for userId
	 * 
	 * @param {string} userId - the id of the user the rrpictures are for
	 * @returns {Promise<HydratedDocument<RRPicture>[]} - an array of the user's previous rrpictures
	 */
	static async findPreviousByUser(userId: Types.ObjectId | string): Promise<Array<HydratedDocument<RRPicture>>> {
		return RRPictureModel.find({userId: userId, status: RRPictureStatus.Previous.toString()}).populate('userId');
	}

	/**
	 * Update a rrpicture with a new status
	 * 
	 * @param {string} rrpictureId - the id of the rrpicture to be updated
	 * @param {RRPictureStatus} status - the new status of the rrpicture
	 * @returns {Promise<HydratedDocument<RRPicture>} - the newly updated rrpicture
	 */
	static async updateOneStatus(rrpictureId: Types.ObjectId | string, status: RRPictureStatus | string): Promise<HydratedDocument<RRPicture>> {
		const rrpicture = await RRPictureModel.findOne({_id: rrpictureId});
		rrpicture.status = status.toString();
		await rrpicture.save();
		return rrpicture.populate('userId');
	}

	/**
	 * Update the user's current rrpicture to be a previous picture
	 * 
	 * @param {string} userId - the id of the user to update the current rrpicture of
	 * @returns {Promise<HydratedDocument<RRPicture>>} - the newly updated rrpicture
	 */
	static async updateCurrentToPrevious(userId: Types.ObjectId | string): Promise<HydratedDocument<RRPicture>> {
		const rrpicture = await RRPictureModel.findOne({userId: userId, status: RRPictureStatus.Current});
		rrpicture.status = RRPictureStatus.Previous.toString();
		await rrpicture.save();
		return rrpicture.populate('userId');
	}

	/**
	 * Delete a rrpicture with the given rrpictureId
	 * 
	 * @param {string} rrpictureId - the rrpictureId of the rrpicture to delete
	 * @returns {Promise<Boolean>} - true if the rrpicture has been deleted, false otherwise
	 */
	static async deleteOne(rrpictureId: Types.ObjectId | string): Promise<boolean> {
		const rrpicture = await RRPictureModel.deleteOne({_id: rrpictureId});
		return rrpicture !== null;
	}

	/**
	 * Delete the user's current rrpicture
	 * 
	 * @param {string} userId - the userId to delete the current rrpicture of
	 */
	static async deleteCurrentByUser(userId: Types.ObjectId | string): Promise<void> {
		await RRPictureModel.deleteOne({userId: userId, status: RRPictureStatus.Current.toString()});
	}

	/**
	 * Delete the user's previous rrpictures
	 * 
	 * @param {string} userId - the userId to delete the current rrpicture of
	 */
	static async deletePreviousByUser(userId: Types.ObjectId | string): Promise<void> {
		await RRPictureModel.deleteMany({userId: userId, status: RRPictureStatus.Previous.toString()});
	}

	/**
	 * Delete the user's rrpictures
	 * 
	 * @param {string} userId - the userId to delete the current rrpicture of
	 */
	static async deleteAllByUser(userId: Types.ObjectId | string): Promise<void> {
		await RRPictureModel.deleteMany({userId: userId});
	}
}

export default RRPictureCollection;