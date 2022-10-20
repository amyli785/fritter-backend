import type {Types, PopulatedDoc, Document} from 'mongoose';
import {Schema, model} from 'mongoose';
import type {User} from '../user/model';
import type {Group} from '../group/model';

export type GroupMember = {
	_id: Types.ObjectId;
	groupId: Types.ObjectId;
	memberId: Types.ObjectId;
};

export type PopulatedGroupMember = {
	_id: Types.ObjectId;
	groupId: Group;
	memberId: User;
};

const GroupMemberSchema = new Schema<GroupMember>({
	groupId: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: 'Group',
	},
	memberId: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: 'User',
	},
});

const GroupMemberModel = model<GroupMember>('GroupMember', GroupMemberSchema);
export default GroupMemberModel;
