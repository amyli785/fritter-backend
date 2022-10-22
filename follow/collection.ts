import type {HydratedDocument, Types} from 'mongoose';
import type {Follow} from './model';
import FollowModel from './model';

class FollowCollection{
	/**
	 * Add a follow to the collection
	 * 
	 * @param {string} followerId - the id of the follower
	 * @param {string} followeeId - the id of the followee
	 * @returns {Promise<HydratedDocument<Follow>>} - the newly created follow
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
	 * @param {string} followerId - the id of the follower
	 * @param {string} followeeId - the id of the followee
	 * @returns {PRomise<Boolean>} - true if the follow has been deleted, false otherwise
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
   * @return {Promise<HydratedDocument<Follow>> | Promise<null>} - The follow, if any
   */
  static async findOne(followerId: Types.ObjectId | string, followeeId: Types.ObjectId | string): Promise<HydratedDocument<Follow>> {
		return FollowModel.findOne({followerId: followerId, followeeId: followeeId}).populate(['followerId', 'followeeId']);
  }

	/**
	 * Find all follows by followee id.
	 * 
	 * @param followeeId - the followee id
	 * @returns {Promise<HydratedDocument<Follow>[]>} - The follows, if any
	 */
	static async findAllFollowers(followeeId: Types.ObjectId | string): Promise<Array<HydratedDocument<Follow>>> {
		const follows = await FollowModel.find({followeeId: followeeId});
		const followsPopulated = await Promise.all(follows.map((follow) => follow.populate('followerId')));
		return followsPopulated;
	}

	/**
	 * Find all follows by follower id.
	 * 
	 * @param followerId - the follower id
	 * @returns {Promise<HydratedDocument<Follow>[]>} - The follows, if any
	 */
	static async findAllFollowees(followerId: Types.ObjectId | string): Promise<Array<HydratedDocument<Follow>>> {
		const follows = await FollowModel.find({followerId: followerId});
		const followsPopulated = await Promise.all(follows.map((follow) => follow.populate('followeeId')));
		return followsPopulated;
	}
}

export default FollowCollection;