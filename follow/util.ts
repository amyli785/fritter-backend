import type {HydratedDocument} from 'mongoose';
import moment from 'moment';
import type {Follow, PopulatedFollow} from '../follow/model';

type FollowResponse = {
	_id: string;
	follower: string;
	followee: string;
};

/**
 * Transform a raw Follow object from the database into an object
 * with all the information needed by the frontend
 *
 * @param {HydratedDocument<Follow>} follow - A follow
 * @returns {FollowResponse} - The follow object formatted for the frontend
 */
 const constructFollowResponse = (follow: HydratedDocument<Follow>): FollowResponse => {
  const followCopy: PopulatedFollow = {
    ...follow.toObject({
      versionKey: false // Cosmetics; prevents returning of __v property
    })
  };
  const follower = followCopy.followerId.username;
	const followee = followCopy.followeeId.username;
	// DELETE ?
  return {
    ...followCopy,
    _id: followCopy._id.toString(),
    follower: follower,
		followee: followee,
  };
};

export {
  constructFollowResponse
};
