import { Request, Response } from 'express';
import { User } from '../entity/User';
import { Category } from '../entity/Category';

export const getCategories = async (_req: Request, res: Response) => {
    // Get all categories from database
    const categories = await Category.createQueryBuilder('category')
    .select([
        'category.id',
        'category.name',
      ])
    .getMany();

    res.json(categories);
}

export const createCategory = async (req: Request, res: Response) => {
    // Get category name from request
    const categoryName = req.body.categoryName;

    // Verify that the user creating a new bug category is an admin
    const currentUser = await User.findOne(req.user);

    if (currentUser) {
        if (!currentUser.isAdmin) {
            return res.status(403).send({ message: 'Permission denied.'});
        }
    } 
        
    // Verify that the category name provided doesn't already exist
    const cat = await Category.findOne({ where: {name: categoryName} });

    if (cat) {
            return res.status(403).send({ message: 'This bug category already exists.'});
    }

    // Create the new category
    const newCategory = Category.create({
        name: categoryName
    })
    await newCategory.save();

    const relationedCategory = await Category.createQueryBuilder('category')
    .where('category.id = :categoryId', { categoryId: newCategory.id })
    .select([
      'category.id',
      'category.name',
    ])
    .getOne();

    return res.status(201).json(relationedCategory);
    
}

export const removeCategory = async (req: Request, res: Response) => {
    // Get category name from request
    const { categoryName } = req.params;

    // Verify that the user deleting a bug category is an admin
    const currentUser = await User.findOne(req.user);

    if (currentUser) {
        if (!currentUser.isAdmin) {
            return res.status(403).send({ message: 'Permission denied.'});
        }
    }

    // Delete category
    await Category.findOne({ where: { name: categoryName }}).then((cat) => {
        if (cat) {
            cat.remove();
        }
    })
    
    res.status(204).end();
}