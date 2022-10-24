import type {HydratedDocument, Types} from 'mongoose';
import mongoose from 'mongoose';
import type {Freet} from './model';
import FreetModel from './model';
import UserCollection from '../user/collection';

/**
 * This files contains a class that has the functionality to explore freets
 * stored in MongoDB, including adding, finding, updating, and deleting freets.
 * Feel free to add additional operations in this file.
 *
 * Note: HydratedDocument<Freet> is the output of the FreetModel() constructor,
 * and contains all the information in Freet. https://mongoosejs.com/docs/typescript.html
 */
class FreetCollection {
  /**
   * Add a freet to the collection
   *
   * @param {string} authorId - The id of the author of the freet
   * @param {string} content - The id of the content of the freet
   * @return {Promise<HydratedDocument<Freet>>} - The newly created freet
   */
  static async addOne(
    authorId: Types.ObjectId | string,
    content: string,
    audience: Types.ObjectId[] | string[],
    responseTo: Types.ObjectId | string
  ): Promise<HydratedDocument<Freet>> {
    const date = new Date();
    const freet = new FreetModel({
      authorId: authorId,
      dateCreated: date,
      dateModified: date,
      content: content,
      audience: audience,
      responseThreadId: '',
      responses: new Array<Types.ObjectId>(),
    });
    if (!responseTo) {
      freet.responseThreadId = freet._id;
    } else {
      freet.responseTo = new mongoose.Types.ObjectId(responseTo as string);
      const freetResponseTo = await FreetCollection.findOne(responseTo);
      freet.responseThreadId = freetResponseTo.responseThreadId._id;
      freet.audience = freetResponseTo.audience;
      await FreetCollection.updateOneResponse(freetResponseTo._id, freet._id);
    }
    await freet.save(); // Saves freet to MongoDB
    return freet.populate(['authorId', 'audience', 'responses', 'responseTo']);
  }

  /**
   * Find a freet by freetId
   *
   * @param {string} freetId - The id of the freet to find
   * @return {Promise<HydratedDocument<Freet>> | Promise<null> } - The freet with the given freetId, if any
   */
  static async findOne(freetId: Types.ObjectId | string): Promise<HydratedDocument<Freet>> {
    return FreetModel.findOne({_id: freetId}).populate(['authorId', 'audience', 'responses', 'responseTo']);
  }

  /**
   * Get all the freets in the database
   *
   * @return {Promise<HydratedDocument<Freet>[]>} - An array of all of the freets
   */
  static async findAll(): Promise<Array<HydratedDocument<Freet>>> {
    // Retrieves freets and sorts them from most to least recent
    const freets = await FreetModel.find({}).sort({dateModified: -1});
    return Promise.all(freets.map(async (freet) => freet.populate(['authorId', 'audience', 'responses', 'responseTo'])));
  }

  /**
   * Get the freets with the given freetIds in the database
   *
   * @return {Promise<HydratedDocument<Freet>[]>} - An array of all of the freets
   */
  static async findAllByIds(freetIds: (Types.ObjectId | string)[]): Promise<Array<HydratedDocument<Freet>>> {
    // Retrieves freets and sorts them from most to least recent
    const freets = await FreetModel.find({_id: {$in: freetIds}}).sort({dateModified: -1});
    return Promise.all(freets.map(async (freet) => freet.populate(['authorId', 'audience', 'responses', 'responseTo'])));
  }

  /**
   * Get all the freets by given author
   *
   * @param {string} username - The username of author of the freets
   * @return {Promise<HydratedDocument<Freet>[]>} - An array of all of the freets
   */
  static async findAllByUsername(username: string): Promise<Array<HydratedDocument<Freet>>> {
    const author = await UserCollection.findOneByUsername(username);
    const freets = await FreetModel.find({authorId: author._id}).sort({dateModified: -1});
    return Promise.all(freets.map(async (freet) => freet.populate(['authorId', 'audience', 'responses', 'responseTo'])));
  }

  /**
   * Update a freet with the new content
   *
   * @param {string} freetId - The id of the freet to be updated
   * @param {string} content - The new content of the freet
   * @return {Promise<HydratedDocument<Freet>>} - The newly updated freet
   */
  static async updateOne(freetId: Types.ObjectId | string, content: string): Promise<HydratedDocument<Freet>> {
    const freet = await FreetModel.findOne({_id: freetId});
    freet.content = content;
    freet.dateModified = new Date();
    await freet.save();
    return freet.populate(['authorId', 'audience', 'responses', 'responseTo']);
  }

  /**
   * Update a freet with an additional response
   *
   * @param {string} freetId - The id of the freet to be updated
   * @param {string} content - The new content of the freet
   * @return {Promise<HydratedDocument<Freet>>} - The newly updated freet
   */
  static async updateOneResponse(freetId: Types.ObjectId | string, responseId: Types.ObjectId): Promise<HydratedDocument<Freet>> {
    const freet = await FreetModel.findOne({_id: freetId});
    freet.responses.push(responseId);
    await freet.save(); 
    return freet.populate(['authorId', 'audience', 'responses', 'responseTo']);
  }

  /**
   * Delete a freet with given freetId.
   *
   * @param {string} freetId - The freetId of freet to delete
   * @return {Promise<Boolean>} - true if the freet has been deleted, false otherwise
   */
  static async deleteOne(freetId: Types.ObjectId | string): Promise<boolean> {
    const freet = await FreetModel.deleteOne({_id: freetId});
    return freet !== null;
  }

  /**
   * Delete all the freets by the given author
   *
   * @param {string} authorId - The id of author of freets
   */
  static async deleteMany(authorId: Types.ObjectId | string): Promise<void> {
    await FreetModel.deleteMany({authorId});
  }
}

export default FreetCollection;
