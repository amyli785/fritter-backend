import type { HydratedDocument, Types } from "mongoose";
import type {GroupMember} from './model';
import GroupMemberModel from "./model";

class GroupMemberCollection {
	/**
	 * Add a group member to the collection
	 * 
	 * @param {string} groupId - the id of the group to add a member to
	 * @param {string} memberId - the id of the user being added to a group
	 * @returns {Promise<HydratedDocument<GroupMember>>} - the newly created group member
	 */
	static async addOne(groupId: Types.ObjectId | string, memberId: Types.ObjectId | string): Promise<HydratedDocument<GroupMember>> {
		const groupMember = new GroupMemberModel({
			groupId,
			memberId,
		});

		await groupMember.save();
		await groupMember.populate('groupId');
		await groupMember.populate('memberId');
		return groupMember;
	}

	/**
	 * Find a group member by groupId and memberId
	 * 
	 * @param {string} groupId - the id of the group to find
	 * @param {string} memberId - the id of the member to find
	 * @returns {Promise<HydratedDocument<GroupMember>> | Promise<null> } - the group member with the given groupId and memberId, if any
	 */
	static async findOne(groupId: Types.ObjectId | string, memberId: Types.ObjectId | string): Promise<HydratedDocument<GroupMember> | null> {
		const groupMember = await GroupMemberModel.findOne({groupId: groupId, memberId: memberId});
		if (groupMember === null) {
			return null;
		}
		await groupMember.populate('groupId');
		await groupMember.populate('memberId');
		return groupMember;
	}

	/**
	 * Get all group members in the given group
	 * 
	 * @param {string} groupId - the id of the group to find members of
	 * @returns {Promise<HydratedDocument<GroupMember>[]>} - an array of all of the group members
	 */
	static async findAllByGroup(groupId: Types.ObjectId | string): Promise<Array<HydratedDocument<GroupMember>>> {
		const groupMembers = await GroupMemberModel.find({groupId: groupId});
		return Promise.all(groupMembers.map((groupMember) => groupMember.populate('memberId')));
	}

	/**
	 * Get all groups a user is a member of
	 * 
	 * @param {string} memberId - the id of the user to find group membership in
	 * @returns {Promise<HydratedDocument<GroupMember>[]>} - an array of all of the group members
	 */
	static async findAllByMember(memberId: Types.ObjectId | string): Promise<Array<HydratedDocument<GroupMember>>> {
		const groupMembers = await GroupMemberModel.find({memberId: memberId});
		return Promise.all(groupMembers.map((groupMember) => groupMember.populate('groupId')));
	}

	/**
	 * Delete a group member with given groupMemberId
	 * 
	 * @param {string} groupMemberId - the groupMemberId of the group member to delete
	 * @returns {Promise<Boolean>} - true if the freet has been deleted, false otherwise
	 */
	static async deleteOne(groupMemberId: Types.ObjectId | string): Promise<boolean> {
		const groupMember = await GroupMemberModel.deleteOne({_id: groupMemberId});
		return groupMember !== null;
	}

	/**
	 * Delete all the group members in the given group
	 * 
	 * @param {string} groupId - the groupId of the group to delete members from
	 */
	static async deleteByGroup(groupId: Types.ObjectId | string): Promise<void> {
		await GroupMemberModel.deleteMany({groupId: groupId});
	}
}

export default GroupMemberCollection;