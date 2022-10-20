import type { HydratedDocument } from "mongoose";
import type {Group, PopulatedGroup} from './model';
import * as groupMemberUtil from '../groupMember/util';
import { GroupMember } from "groupMember/model";

type GroupResponse = {
	_id: string;
	userId: string;
	username: string;
	name: string;
};

/**
 * Transform a raw Group object from the database into an object
 * will all the information needed by the frontend
 * 
 * @param {HydratedDocument<Group>} group - a group
 * @returns {GroupResponse} - the group object formatted for the frontend
 */
const constructGroupResponse = (group: HydratedDocument<Group>): GroupResponse => {
	const groupCopy: PopulatedGroup = {
		...group.toObject({
			versionKey: false
		})
	};
	return {
		_id: groupCopy._id.toString(),
		userId: groupCopy.userId._id.toString(),
		username: groupCopy.userId.username,
		name: groupCopy.name,
	};
}

type GroupWithMembersResponse = {
	_id: string;
	userId: string;
	username: string;
	name: string;
	members: groupMemberUtil.GroupMemberOnlyResponse[];
};

/**
 * Transform raw Group and array of raw GroupMember objects from the database into an object
 * will all the information needed by the frontend
 * 
 * @param {HydratedDocument<Group>} group - a group
 * @param {HydratedDocument<GroupMember[]>} groupMembers - the group members
 * @returns {GroupWithMembersResponse} - the group object with members formatted for the frontend
 */
const constructGroupWithMembersResponse = (group: HydratedDocument<Group>, groupMembers: Array<HydratedDocument<GroupMember>>): GroupWithMembersResponse => {
	const groupCopy: PopulatedGroup = {
		...group.toObject({
			versionKey: false
		})
	};
	return {
		_id: groupCopy._id.toString(),
		userId: groupCopy.userId._id.toString(),
		username: groupCopy.userId.username,
		name: groupCopy.name,
		members: groupMembers.map(groupMemberUtil.constructGroupMemberOnlyResponse),
	};
}

export {
	constructGroupResponse,
	constructGroupWithMembersResponse,
};
