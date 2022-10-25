import type {Types} from 'mongoose';
import {Schema, model} from 'mongoose';

export type Filter = {
	_id: Types.ObjectId;
	userId: Types.ObjectId;
	expression: string;
	name: string;
};

const FilterSchema = new Schema({
	userId: {
		type: Schema.Types.ObjectId,
		required: true,
	},
	expression: {
		type: String,
		required: true,
	},
	name: {
		type: String,
		required: true,
	},
});

const FilterModel = model<Filter>('Filter', FilterSchema);
export default FilterModel;