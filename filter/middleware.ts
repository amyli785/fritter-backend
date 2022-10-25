import type {Request, Response, NextFunction} from 'express';
import {Types} from 'mongoose';
import FilterCollection from './collection';
import { parse } from '../expression/parser';
import { BooleanExpression, AuthorExpression, TagExpression, NotExpression, AndExpression, OrExpression } from '../expression/BooleanExpression';

/**
 * Checks if filterId in req.params is in the correct format, exists, and is associated with the user
 */
const isFilterExistsAndOwned = async (req: Request, res: Response, next: NextFunction) => {
	const filterId = req.params.filterId as string;
	const validFormat = Types.ObjectId.isValid(filterId);
	if (!validFormat) {
		res.status(400).json({
			error: `Filter with filter ID ${filterId} is improperly formatted.`
		});
		return;
	}

	const filter = await FilterCollection.findOne(filterId);
	if (!filter || filter.userId.toString() !== req.session.userId as string) {
		res.status(404).json({
			error: `Filter with id ${filterId} does not exist for the user.`
		});
		return;
	}

	next();
};

/**
 * Checks if name in req.body is in the correct format
 */
const isNameValid = async (req: Request, res: Response, next: NextFunction) => {
	const nameRegex = /^\w+$/i;
	if (!nameRegex.test(req.body.name)) {
	  res.status(400).json({
		error: 'Name must be a nonempty alphanumeric string.'
	  });
	  return;
	}
  
	next();
};

/**
 * Checks if expression in req.body is in the correct format and can be parsed
 */
const isExpressionValid = async (req: Request, res: Response, next: NextFunction) => {
	const expression = req.body.expression as string;
	if (!expression) {
	  res.status(400).json({
		error: 'Expression must be a nonempty string.'
	  });
	  return;
	}

	try {
		parse(expression);
	} catch (e) {
	  console.log(e);
	  res.status(400).json({
		error: 'Expression cannot be parsed.'
	  });
	  return;
	}
  
	next();
};

export {
	isFilterExistsAndOwned,
	isNameValid,
	isExpressionValid,
};
