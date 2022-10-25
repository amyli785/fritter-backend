import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import TagCollection from '../tag/collection';
import FreetCollection from './collection';
import * as userValidator from '../user/middleware';
import * as freetValidator from '../freet/middleware';
import * as util from './util';

const router = express.Router();

/**
 * Get freets by freetIds
 * 
 * @name GET /api/freets?freetIds=id1,id2,...
 * 
 * @return {FreetResponse[]} - an array of objects with the details of freets with the given `freetIds` in descending order by date modified
 * @throws {400} - if `freetIds` is not given or is in the wrong format
 * @throws {404} - if for a freetId in `freetIds`, the freet cannot be found or the user is not a member of the audience
 */
router.get(
  '/',
  [
    freetValidator.areFreetsExistViewable,
  ],
  async (req: Request, res: Response) => {
    if (typeof req.query.freetIds !== "string") {
      res.status(400).json({
        error: 'Provided freetIds must be list of strings.',
      });
      return; // not possible, eliminated by freetValidator.areValidFreets
    }
    const freetIds = req.query.freetIds.toString().split(',');
    const freets = await FreetCollection.findAllByIds(freetIds);
    const response = freets.map(util.constructFreetResponse);
    res.status(200).json(response);
  }
);

/**
 * View the freet
 * 
 * @name GET /api/freets/:freetId
 * 
 * @return {FreetResponse} - an object with the details of the freet
 * @throws {400} - if `freetId` is in the wrong format
 * @throws {404} - if `freetId` cannot be found or the user is not a member of the audience of the freet
 */
router.get(
  '/:freetId?',
  [
    freetValidator.isFreetExistsViewable,
  ],
  async (req: Request, res: Response) => {
    const freet = await FreetCollection.findOne(req.params.freetId);
    res.status(200).json(util.constructFreetResponse(freet));
  }
);

/**
 * Create a new freet
 * 
 * @name POST /api/freets
 * 
 * @param {string} content - the content of the freet
 * @param {string[]} audience - the groups making up the audience who can see the freet
 * @param {string | None} responseTo - the freet to which the current freet responds, if any
 * @return {FreetResponse} - an object with the details of the new freet
 * @throws {403} - if the user is not logged in
 * @throws {400} - if the `content`, `audience`, or `responseTo` is in the wrong format
 * @throws {404} - if the `responseTo` cannot be found that the user can view or any of the groups in `audience` cannot be found for the user
 */
router.post(
  '/',
  [
    userValidator.isUserLoggedIn,
    freetValidator.isValidFreetContent,
    freetValidator.isValidFreetAudience,
    freetValidator.isValidFreetResponseTo,
  ],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    const content = req.body.content as string;
    const audience = req.body.audience ? req.body.audience.toString().split(',') : new Array<string>();
    const freet = await FreetCollection.addOne(userId, content, audience, req.body.responseTo as string);

    const tagLabelRexex = /(^|\s+)#(\w+)/g;
    const contentTagLabels = [...content.matchAll(tagLabelRexex)];
    await Promise.all(contentTagLabels.map(async (match: RegExpMatchArray) => {
      const label: string = match[2];
      return TagCollection.updateOrAddOne(label, [freet._id]);
    }));

    res.status(201).json({
      message: 'Your freet was created successfully.',
      freet: util.constructFreetResponse(freet),
    });
  }
);

export {router as freetRouter};
