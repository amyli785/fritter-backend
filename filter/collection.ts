import type {HydratedDocument, Types} from 'mongoose';
import type {Filter} from './model';
import FilterModel from './model';

class FilterCollection {
	/**
	 * Add a new filter
	 * 
	 * @param {string} userId - the userId of the owner of the filter
	 * @param {string} expression - the expression of the filter
	 * @param {string} name - the name of the filter
	 * @returns {Promise<HydratedDocument<Filter>>} - the newly created filter
	 */
	static async addOne(userId: Types.ObjectId | string, expression: string, name: string): Promise<HydratedDocument<Filter>> {
		const filter = new FilterModel({
			userId: userId,
			expression: expression,
			name: name
		});
		await filter.save();
		return filter;
	}

	/**
	 * Find a filter by filterId
	 * 
	 * @param {string} filterId - the filterId of the filter to find
	 * @returns {Promise<HydratedDocument<Filter>> | Promise<null>} - the filter with the given filterId, if any
	 */
	static async findOne(filterId: Types.ObjectId | string): Promise<HydratedDocument<Filter>> {
		return FilterModel.findOne({_id: filterId});
	}

	/**
	 * Find all filter by userId
	 * 
	 * @param {string} userId - the userId of the filter to find
	 * @returns {Promise<HydratedDocument<Filter>> | Promise<null>} - the filter with the given userId, if any
	 */
	static async findAllByUserId(userId: Types.ObjectId | string): Promise<Array<HydratedDocument<Filter>>> {
		return FilterModel.find({userId: userId});
	}

	/**
	 * Update filter's information
	 * 
	 * @param {string} filterId - the filterId of the filter to update
	 * @param {Object} filterDetails - an object with the filter's updated information
	 * @returns {Promise<HydratedDocument<Filter>>} - The updated filter
	 */
	static async updateOne(filterId: Types.ObjectId | string, filterDetails: any): Promise<HydratedDocument<Filter>> {
		const filter = await FilterModel.findOne({_id: filterId});
		if (filterDetails.expression) {
			filter.expression = filterDetails.expression as string;
		}
		if (filterDetails.name) {
			filter.name = filterDetails.name as string;
		}

		await filter.save();
		return filter;
	}

	/**
	 * Delete a filter from the collection
	 * 
	 * @param {string} filterId - the filterId of the filter to delete
	 * @returns {Promise<Boolean>} - true if the filter has been deleted, false otherwise
	 */
	static async deleteOne(filterId: Types.ObjectId | string): Promise<boolean> {
		const filter = await FilterModel.deleteOne({_id: filterId});
		return filter !== null;
	}
}

export default FilterCollection;