import type {HydratedDocument, Types} from 'mongoose';
import type {Group} from './model';
import GroupModel from './model';

class GroupCollection {
	/**
	 * Add a group to the collection
	 * 
	 * @param {string} userId - the id of the user being viewed by the group
	 * @param {string} name - a name for the group
	 * @returns {Promise<HydratedDocument<Group>>} - the newly created group
	 */
	static async addOne(userId: Types.ObjectId | string, name: string): Promise<HydratedDocument<Group>> {
		const group = new GroupModel({
			userId,
			name,
		});
		await group.save();
		return group.populate('userId');
	}

	/**
	 * Find a group by groupId
	 * 
	 * @param {string} groupId - the id of the group to find
	 * @returns {Promise<HydratedDocument<Group>> | Promise<null>} - the group with the given groupId, if any
	 */
	static async findOne(groupId: Types.ObjectId | string): Promise<HydratedDocument<Group> | null> {
		return GroupModel.findOne({_id: groupId}).populate('userId');
	}

	/**
	 * Find a group by userId and name
	 * 
	 * @param {string} userId - the id of the user to find the group for
	 * @param {string} name - the name of the group to find
	 * @returns {Promise<HydratedDocument<Group>> | Promise<null>} - the group with the given groupId, if any
	 */
	static async findOneByUserAndName(userId: Types.ObjectId | string, name: string): Promise<HydratedDocument<Group> | null> {
		return GroupModel.findOne({userId: userId, name: name}).populate('userId');
	}

	/**
	 * Get all groups viewing the given user
	 * 
	 * @param {string} userId - the id the user viewed by the groups
	 * @returns {Promise<HydratedDocument<Group>[]>} - an array of all of the groups
	 */
	static async findAllByUserId(userId: Types.ObjectId | string): Promise<Array<HydratedDocument<Group>>> {
		return GroupModel.find({userId: userId}).populate('userId');
	}

	/**
	 * Delete a group with given groupId
	 * 
	 * @param {string} groupId - the groupId of the group to delete
	 * @returns {Promise<Boolean>} - true if the group has been deleted, false otherwise
	 */
	static async deleteOne(groupId: Types.ObjectId | string): Promise<boolean> {
		const group = await GroupModel.deleteOne({_id: groupId});
		return group !== null;
	}
}

export default GroupCollection;
