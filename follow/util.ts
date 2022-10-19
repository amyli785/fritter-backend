import type {HydratedDocument} from 'mongoose';
import moment from 'moment';
import type {Follow, PopulatedFollow} from '../follow/model';

type FollowResponse = {
	_id: string;
  followerId: string;
  followeeId: string;
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
  return {
    _id: followCopy._id.toString(),
    followerId: followCopy.followerId._id.toString(),
    followeeId: followCopy.followeeId._id.toString(),
    follower: followCopy.followerId.username,
		followee: followCopy.followeeId.username,
  };
};

type FollowUserResponse = {
	userId: string;
  username: string;
};

/**
 * Transform a raw Follow object from the database into an object
 * with all the follower's user information needed by the frontend
 *
 * @param {HydratedDocument<Follow>} follow - A follow
 * @returns {FollowUserResponse} - The follower's user object formatted for the frontend
 */
 const constructFollower = (follow: HydratedDocument<Follow>): FollowUserResponse => {
  const followCopy: PopulatedFollow = {
    ...follow.toObject({
      versionKey: false // Cosmetics; prevents returning of __v property
    })
  };
  return {
    userId: followCopy.followerId._id.toString(),
    username: followCopy.followerId.username,
  };
};

/**
 * Transform a raw Follow object from the database into an object
 * with all the followee's user information needed by the frontend
 *
 * @param {HydratedDocument<Follow>} follow - A follow
 * @returns {FollowUserResponse} - The followee's user object formatted for the frontend
 */
 const constructFollowee = (follow: HydratedDocument<Follow>): FollowUserResponse => {
  const followCopy: PopulatedFollow = {
    ...follow.toObject({
      versionKey: false // Cosmetics; prevents returning of __v property
    })
  };
  return {
    userId: followCopy.followeeId._id.toString(),
    username: followCopy.followeeId.username,
  };
};

export {
  constructFollowResponse,
  constructFollower,
  constructFollowee,
};
