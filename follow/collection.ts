import type {HydratedDocument, Types} from 'mongoose';
import type {Follow} from './model';
import FollowModel from './model';

/**
 * TODO
 */
class FollowCollection{
	/**
	 * Add a follow to the collection
	 * 
	 * @param followerId 
	 * @param followeeId
	 * @returns 
	 */
	static async addOne(followerId: Types.ObjectId | string, followeeId: Types.ObjectId | string): Promise<HydratedDocument<Follow>> {
		const follow = new FollowModel({
			followerId,
			followeeId,
		});
		await follow.save();
		await follow.populate('followeeId');
		await follow.populate('followerId');
		return follow;
	}

	/**
	 * Delete a follow with given followerId and followeeUsername.
	 * 
	 * @param followerId 
	 * @param followeeId
	 * @returns 
	 */
	static async deleteOne(followerId: Types.ObjectId | string, followeeId: Types.ObjectId | string): Promise<boolean> {
		const follow = await FollowModel.deleteOne({followerId: followerId, followeeId: followeeId});
		return follow !== null;
	}

  /**
   * Find a follow by follower id and followee id.
   *
   * @param {string} followerId - The follower id
	 * @param {string} followeeId - The followee id
   * @return {Promise<HydratedDocument<Follow>> | Promise<null>} - The user with the given username, if any
   */
  static async findOne(followerId: Types.ObjectId | string, followeeId: Types.ObjectId | string): Promise<HydratedDocument<Follow>> {
    return FollowModel.findOne({followerId: followerId, followeeId: followeeId});
  }

	static async findAllFollowers(followeeId: Types.ObjectId | string): Promise<Array<HydratedDocument<Follow>>> {
		return FollowModel.find({followeeId: followeeId});
	}

	static async findAllFollowees(followerId: Types.ObjectId | string): Promise<Array<HydratedDocument<Follow>>> {
		return FollowModel.find({followerId: followerId});
	}
}

export default FollowCollection;