import {Request, Response, NextFunction, request, response} from 'express';
import {Types} from 'mongoose';
import GroupCollection from '../group/collection';
import GroupMemberCollection from '../groupMember/collection';
import FreetCollection from './collection';

/**
 * Checks if a freet with freetId exists and is viewable by the given userId
 * 
 * @param freetId the id of the freet, a valid object id
 * @param userId the id of the user, a valid object id
 * @returns true iff the freet exists and can be viewed by the user
 */
async function FreetIdExistsViewableForUserId (freetId: Types.ObjectId | string, userId: Types.ObjectId | string): Promise<boolean> {
  const freet = await FreetCollection.findOne(freetId);
  if (!freet) {
    return false;
  }
  if (freet.authorId._id.toString() === userId as string) {
    return true;
  }
  const groupMembers = await Promise.all(
    freet.audience.map(async (groupId) => 
      GroupMemberCollection.findOne(groupId, userId))
  );
  return groupMembers.some(groupMember => !!groupMember);
}

/**
 * Checks if a freet with freetId in req.params exists
 */
const isFreetExistsViewable = async (req: Request, res: Response, next: NextFunction) => {
  const validFormat = Types.ObjectId.isValid(req.params.freetId);
  if (!validFormat) {
    res.status(400).json({
      error: `Freet with freet ID ${req.params.freetId} is improperly formatted.`
    });
    return;
  }

  const existsViewable = await FreetIdExistsViewableForUserId(req.params.freetId as string, req.session.userId as string);
  if (!existsViewable) {
    res.status(404).json({
      error: {
        freetNotFound: `Freet with freet ID ${req.params.freetId} does not exist, or the user cannot access it.`
      }
    });
    return;
  }

  next();
};

/**
 * Checks if the content of the freet in req.body is valid, i.e not a stream of empty
 * spaces and not more than 140 characters
 */
const isValidFreetContent = (req: Request, res: Response, next: NextFunction) => {
  const {content} = req.body as {content: string};
  if (!content.trim()) {
    res.status(400).json({
      error: 'Freet content must be at least one character long.'
    });
    return;
  }

  if (content.length > 140) {
    res.status(413).json({
      error: 'Freet content must be no more than 140 characters.'
    });
    return;
  }

  next();
};

/**
 * Checks if the audience in req.body is a valid list of groupIds that belong to the user
 */
const isValidFreetAudience = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.body.audience) {
    next();
    return;
  }

  const groupIds = req.body.audience.toString().split(',');
  const validGroupIds = groupIds.every((groupId: string) => Types.ObjectId.isValid(groupId));
  if (!validGroupIds) {
    res.status(400).json({
      error: 'Provided audience must be list of groupId strings.',
    });
    return;
  }

  const groups = await Promise.all(groupIds.map((groupId: string) => GroupCollection.findOne(groupId)));
  const validGroups = groups.every((group) => group && group.userId._id.toString() === req.session.userId as string);
  if (!validGroups) {
    res.status(404).json({
      error: 'Provided audience must consist of existing groups viewing the user.'
    });
    return;
  }

  next();
};

/**
 * Checks if the responseTo in req.body, if given, is an existing freet id
 */
const isValidFreetResponseTo = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.body.responseTo) {
    next();
    return;
  }

  const validFormat = Types.ObjectId.isValid(req.body.responseTo);
  const responseTo = validFormat && await FreetIdExistsViewableForUserId(req.body.responseTo as string, req.session.userId as string);

  if (!responseTo) {
    res.status(404).json({
      error: `A responseTo freet with id ${req.body.responseTo as string} does not exist that the user can response to.`
    });
    return;
  }

  next();
};

/**
 * Checks if the current user is the author of the freet whose freetId is in req.params
 */
const isValidFreetModifier = async (req: Request, res: Response, next: NextFunction) => {
  const freet = await FreetCollection.findOne(req.params.freetId);
  const userId = freet.authorId._id;
  if (req.session.userId !== userId.toString()) {
    res.status(403).json({
      error: 'Cannot modify other users\' freets.'
    });
    return;
  }

  next();
};

/**
 * Checks if all ids in freetId in req.query are properly formatted
 */
const areFreetsExistViewable = async (req: Request, res: Response, next: NextFunction) => {
  if (typeof req.query.freetIds !== "string") {
    res.status(400).json({
      error: 'Provided freetIds must be list of strings.',
    });
    return;
  }
  const freetIds = req.query.freetIds.toString().split(',');
  const validFormat = freetIds.every((freetId: string) => Types.ObjectId.isValid(freetId));
  if (!validFormat) {
    res.status(400).json({
      error: 'Provided freetIds contains an improperly formatted freetId.'
    });
    return;
  }
  
  const existsViewable = (await Promise.all(freetIds.map(async (freetId) => 
    FreetIdExistsViewableForUserId(freetId as string, req.session.userId as string)
  ))).every(existsViewable => existsViewable);
  
  if (!existsViewable) {
    res.status(404).json({
      error: {
        freetNotFound: `A freet in freetIds does not exist or cannot be accessed by the user.`
      }
    });
    return;
  }

  next();
};

export {
  isFreetExistsViewable,
  isValidFreetContent,
  isValidFreetAudience,
  isValidFreetResponseTo,
  isValidFreetModifier,
  areFreetsExistViewable,
};
