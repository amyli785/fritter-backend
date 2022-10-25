import type { HydratedDocument, Types } from 'mongoose';
import mongoose from 'mongoose';
import type { Tag } from './model';
import TagModel from "./model";

class TagCollection {
	/**
	 * Add a new tag
	 * 
	 * @param {string} label - the label of the tag
	 * @returns {Promise<HydratedDocument<Tag>>} - the newly created tag
	 */
	static async addOne(label: string): Promise<HydratedDocument<Tag>> {
		const tag = new TagModel({
			label: label,
			freetIds: new Array<Types.ObjectId>(),
		});
		await tag.save();
		return tag;
	}

	/**
	 * Find a tag by label
	 * 
	 * @param {string} label - the label of the tag to find
	 * @returns {Promise<HydratedDocument<User>> | Promise<null>} - the tag with the given label
	 */
	static async findOne(label: string): Promise<HydratedDocument<Tag>> {
		return TagModel.findOne({label: label});
	}

	/**
	 * Tries to add freetIds to a tag found by label, or makes a new tag with label and freetIds if not found.
	 * 
	 * @param {string} label - the label of the tag
	 * @param {Types.ObjectId[] | string[]} freetIds - the list of freetIds
	 * @returns {Promise<HydratedDocument<Tag>>} - the updated or newly created tag
	 */
	static async updateOrAddOne(label: string, freetIds: Array<Types.ObjectId | string>): Promise<HydratedDocument<Tag>> {
		const freetIdObjs = freetIds.map(freetId => new mongoose.Types.ObjectId(freetId));
		const tag = await TagModel.findOne({label: label});
		if (!tag) {
			const tagNew = new TagModel({
				label: label,
				freetIds: freetIdObjs,
			});
			await tagNew.save();
			return tagNew;
		}
		tag.freetIds.push(...freetIdObjs);
		await tag.save();
		return tag;
	}
}

export default TagCollection;