import {Request, Response, NextFunction, request, response} from 'express';
import {Types} from 'mongoose';
import FreetCollection from '../freet/collection';
import * as freetValidator from '../freet/middleware';

/**
 * Finds the freetIds that are viewable for the user.
 * 
 * @param {string[]} freetIds - the ids of the freets to check, valid object id
 * @param {string} userId - the id of the user, a valid object id
 * @returns {Promise<string[]>} - the freetIds that the user can view
 */
async function FindViewableFreets (freetIds: (Types.ObjectId | string)[], userId: Types.ObjectId | string): Promise<Array<Types.ObjectId | string>> {
	return Promise.all(freetIds.filter(async (freetId) => freetValidator.FreetIdExistsViewableForUserId(freetId, userId)));
}

export {
	FindViewableFreets,
};