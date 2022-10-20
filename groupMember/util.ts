import type { HydratedDocument } from "mongoose";
import type { GroupMember, PopulatedGroupMember } from "./model";

type GroupMemberResponse = {
	_id: string;
	groupId: string;
	groupName: string;
	memberId: string;
	memberUsername: string;
}

/**
 * Transform a raw GroupMember object from the database into an object
 * will all the information needed by the frontend
 * 
 * @param {HydratedDocument<GroupMember>} groupMember - a group member
 * @returns {GroupMemberResponse} - the group member object formatted for the frontend
 */
 const constructGroupMemberResponse = (groupMember: HydratedDocument<GroupMember>): GroupMemberResponse => {
	const groupMemberCopy: PopulatedGroupMember = {
		...groupMember.toObject({
			versionKey: false
		})
	};
	return {
		_id: groupMemberCopy._id.toString(),
		groupId: groupMemberCopy.groupId._id.toString(),
		groupName: groupMemberCopy.groupId.name,
		memberId: groupMemberCopy.memberId._id.toString(),
		memberUsername: groupMemberCopy.memberId.username,
	};
}

export type GroupMemberOnlyResponse = {
	memberId: string;
	memberUsername: string;
}

/**
 * Transform a raw GroupMember object from the database into an object
 * will only the information about the user member
 * 
 * @param {HydratedDocument<GroupMember>} groupMember - a group member
 * @returns {GroupMemberOnlyResponse} - the user member of the group member object formatted for the frontend
 */
 const constructGroupMemberOnlyResponse = (groupMember: HydratedDocument<GroupMember>): GroupMemberOnlyResponse => {
	const groupMemberCopy: PopulatedGroupMember = {
		...groupMember.toObject({
			versionKey: false
		})
	};
	return {
		memberId: groupMemberCopy.memberId._id.toString(),
		memberUsername: groupMemberCopy.memberId.username,
	};
}

export {
	constructGroupMemberResponse,
	constructGroupMemberOnlyResponse,
};

