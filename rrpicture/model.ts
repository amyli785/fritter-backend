import type {Types} from 'mongoose';
import {Schema, model} from 'mongoose';
import type {User} from '../user/model';

export enum RRPictureType {
	RawString = "RawString",
	Path = "Path",
	Link = "Link",
}

export const RRPictureTypeValues = new Set(Object.values(RRPictureType));

export enum RRPictureStatus {
	Current = "Current",
	Previous = "Previous",
}

export const RRPictureStatusValues = new Set(Object.values(RRPictureStatus));

export type RRPicture = {
	_id: Types.ObjectId;
	userId: Types.ObjectId;
	picture: string;
	pictureType: string;
	status: string;
};

export type PopulatedRRPicture = {
	_id: Types.ObjectId;
	userId: User;
	picture: string;
	pictureType: string;
	status: string;
};

const RRPictureSchema = new Schema<RRPicture>({
	userId: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: 'User',
	},
	picture: {
		type: String,
		required: true,
	},
	pictureType: {
		type: String,
		required: true,
	},
	status: {
		type: String,
		required: true,
	},
});

const RRPictureModel = model<RRPicture>('RRPicture', RRPictureSchema);
export default RRPictureModel;