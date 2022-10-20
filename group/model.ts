import type {Types, PopulatedDoc, Document} from 'mongoose';
import {Schema, model} from 'mongoose';
import type {User} from '../user/model';

export type Group = {
	_id: Types.ObjectId;
	userId: Types.ObjectId;
	name: string;
};

export type PopulatedGroup = {
	_id: Types.ObjectId;
	userId: User;
	name: string;
};

const GroupSchema = new Schema<Group>({
	userId: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: 'User',
	},
	name: {
		type: String,
		required: true,
	},
});

const GroupModel = model<Group>('Group', GroupSchema);
export default GroupModel;
