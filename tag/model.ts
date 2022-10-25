import type {Types, PopulatedDoc, Document} from 'mongoose';
import { Schema, model } from 'mongoose';
import type {Freet} from '../freet/model';

export type Tag = {
	_id: Types.ObjectId;
	label: string;
	freetIds: Types.ObjectId[];
};

export type PopulatedTag = {
	_id: Types.ObjectId;
	label: string;
	freetIds: Freet[];
};

const TagSchema = new Schema({
	label: {
		type: String,
		required: true,
	},
	freetIds: {
		type: [Schema.Types.ObjectId],
		required: true,
		ref: 'Freet',
	},
});

const TagModel = model<Tag>('Tag', TagSchema);
export default TagModel;