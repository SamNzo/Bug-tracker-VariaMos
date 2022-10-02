import { Request, Response } from 'express';
import fs from 'fs';
import { AssignedAdmins } from '../entity/AssignedAdmins';
import { Bug } from '../entity/Bug';
import { Category } from '../entity/Category';
import { Note } from '../entity/Note';
import { User } from '../entity/User';
import { closeGitIssues, createGitIssues, getGitIssues, reopenGitIssues, updateGitIssues } from '../utils/githubIssuesAPI';
import { createBugValidator } from '../utils/validators';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let lastBugTitle: string = '';

const fieldsToSelect = [
  'bug.id',
  'bug.title',
  'bug.description',
  'bug.priority',
  'bug.isResolved',
  'bug.createdAt',
  'bug.updatedAt',
  'bug.closedAt',
  'bug.reopenedAt',
  'bug.ImageFilePath',
  'bug.JSONFilePath',
  'bug.gitIssueNumber',
  'bug.categoryId',
  'category.id',
  'category.name',
  'createdBy.id',
  'createdBy.username',
  'updatedBy.id',
  'updatedBy.username',
  'closedBy.id',
  'closedBy.username',
  'reopenedBy.id',
  'reopenedBy.username',
  'note.id',
  'note.bugId',
  'note.body',
  'note.gitCommentId',
  'note.createdAt',
  'note.updatedAt',
  'note.isReply',
  'note.replyId',
  'note.repliesNb',
  'noteAuthor.id',
  'noteAuthor.username',
  'assignment.adminId',
  'assignment.bugId',
  'assignment.joinedAt',
];

export const getBugs = async (_req: Request, res: Response) => {

  const bugs = await Bug.createQueryBuilder('bug')
    .leftJoinAndSelect('bug.createdBy', 'createdBy')
    .leftJoinAndSelect('bug.updatedBy', 'updatedBy')
    .leftJoinAndSelect('bug.closedBy', 'closedBy')
    .leftJoinAndSelect('bug.reopenedBy', 'reopenedBy')
    .leftJoinAndSelect('bug.notes', 'note')
    .leftJoinAndSelect('note.author', 'noteAuthor')
    .leftJoinAndSelect('bug.assignments', 'assignment')
    .leftJoinAndSelect('bug.category', 'category')
    .select(fieldsToSelect)
    .getMany();

  // Here we make sure that the issues on Github Issues are synchronized with
  // the Bug Tracker. If one was created/updated on Github Issues we create/update
  // the Bug Tracker one's to match

  // Get issues from the Github repository
  await getGitIssues().then(async (gitIssues) => {
    // Issues are received as a string so we convert them to JSON
    const JSON_issues = JSON.parse(gitIssues);
    // For each issue
    for (let gitIssue of JSON_issues) {
      // If it is a pull request do not fetch it
      if ('pull_request' in gitIssue) {
        break;
      }
      const gitIssueNumber = gitIssue.number;
      // Check if it is already on the Bug Tracker
      let cpt = 0;
      let over = false;
        for (let bug of bugs) {
          if (over) {
            break;
          }
          // If the bug is already on the Bug Tracker
          if (bug.gitIssueNumber === gitIssueNumber) {
            // Check if the bug data is the same as on Github Issues
            await Bug.findOne({
              where: { gitIssueNumber: gitIssueNumber }
            }).then(async (b) => {
                if (b) {
                    // If not, update it 
                    // Title
                    if (b.title !== gitIssue.title) {
                      b.title = gitIssue.title;
                    };
                    // Description
                    if (b.description !== gitIssue.body) {
                      b.description = gitIssue.body;
                    };
                    // Status (open/closed)
                    if (b.isResolved && gitIssue.state === "open") {
                      // Case where the bug is closed on the Bug Tracker but opened on Github (someone re-opened it on Github)
                      b.isResolved = false;
                    }
                    if (!b.isResolved && gitIssue.state === "closed") {
                      // Case where the bug is closed on Github
                      b.isResolved = true;
                    }
                    
                    // Category
                    if (gitIssue.labels.length > 0 && gitIssue.labels[0].name === "question") {
                      await Category.findOne({ where: {name: "Question"}}).then((cat) => {
                        if (cat) {
                          b.categoryId = cat.id;
                        }
                      })
                    }
                    else if (gitIssue.labels.length > 0 && gitIssue.labels[0].name === "enhancement") {
                      await Category.findOne({ where: {name: "Enhancement"}}).then((cat) => {
                        if (cat) {
                          b.categoryId = cat.id;
                        }
                      })
                    }
                    else if (gitIssue.labels.length > 0 && gitIssue.labels[0].name === "bug") {
                      await Category.findOne({ where: {name: "Bug"}}).then((cat) => {
                        if (cat) {
                          b.categoryId = cat.id;
                        }
                      })
                    }
                    // Assignments
                    // Get all assignments to this bug
                    await AssignedAdmins.find({ where: { bugId: b.id }}).then(async (assignments) => {
                      // If at least one admin is assigned to this bug on the Bug Tracker
                      if (assignments.length > 0) {
                        // Add assignments for admins assigned to the bug on Gitub 
                        // who are not already assigned to the bug on the Bug Tracker
                        for (let assignee of gitIssue.assignees) {
                          for (let assignment of assignments) {
                            await User.findOne({ where: {id: assignment.adminId }}).then(async (admin) => {
                              if (admin) {
                                if (assignee.login !== admin.github) {
                                  // Find the admin (works if he entered his github username)
                                  await User.findOne({ where: { github: assignee.login }}).then((u) => {
                                    // If he did assign him the bug
                                    if (u) {
                                      AssignedAdmins.create({
                                        bugId: b.id,
                                        adminId: u.id,
                                      })
                                    }                      
                                  })
                                }
                              }
                            })
                          }
                        }
                      }
                      // If no one is assigned to this bug on the Bug Tracker
                      else {
                        // Add all the assigned on Github to the Bug Tracker
                        for (let assignee of gitIssue.assignees) {
                          // Find the admin (works if he entered his github username)
                          await User.findOne({ where: { github: assignee.login }}).then((u) => {
                            // If he did assign him the bug
                            if (u) {
                              const newAssignment= AssignedAdmins.create({
                                bugId: b.id,
                                adminId: u.id,
                              })
                              newAssignment.save();
                            }                      
                          })
                        }
                      }
                    })
                    
                    // Image/Video
                    if (gitIssue.body !== null) {
                      if (gitIssue.body.includes('https://user-images.githubusercontent.com')) {
                        const fileUrl: string = gitIssue.body.match(/https:\/\/user-images\.githubusercontent\.com\/[0-9]+\/(.*)\.(mp4|png|jpg|jpeg|mp3|gif|tif|tiff)/gm)[0];
                        if (fileUrl !== '') {
                          b.ImageFilePath = fileUrl;
                        }
                      }
                    }

                
                    await b.save();
                    over = true;    
                }   
              });
          }
          else {
            cpt += 1;
          }
        }

        if (cpt === bugs.length) {
          // If not, it was created on Github Issues
          // So we create it on the Bug Tracker also
          // Get the creator id (works if he entered his Github username in his settings)
          let creatorId: string = ''; 
          let status: boolean = false;
          await User.findOne({ where: { github: gitIssue.user.login }}).then((u) => {
            if (u) {creatorId = u.id}
            else {creatorId = "00000000-0000-0000-0000-000000000000"}
            if (gitIssue.state === "closed") {status = true}
          });
          let fileUrl = null;
          let fileDescription = null;
          if (gitIssue.body !== null) {
            fileUrl = gitIssue.body.match(/https:\/\/user-images\.githubusercontent\.com\/[0-9]+\/(.*)\.(mp4|png|jpg|jpeg|mp3|gif|tif|tiff)/gm);
            if (fileUrl !== null) {
              fileUrl = fileUrl[0];
              fileDescription = gitIssue.body.match(/!\[.*]\(https:\/\/user-images\.githubusercontent\.com\/[0-9]+\/(.*)\.(mp4|png|jpg|jpeg|mp3|gif|tif|tiff)\)/gm);
            }
          }
          const description = gitIssue.body.replace(fileDescription, "");

          const newBug = Bug.create({
            title: gitIssue.title,
            description: description,
            createdById: creatorId,
            isResolved: status,
            ImageFilePath: fileUrl,
            gitIssueNumber: gitIssue.number
          });
          await newBug.save();
        }
    }
  });

  res.json(bugs);
};

export const createBug = async (req: Request, res: Response) => {
  const { title, description, priority } = req.body[0];
  const category = req.body[1];
  const { errors, valid } = createBugValidator(title, description, priority);

  if (!valid) {
    return res.status(400).send({ message: Object.values(errors)[0] });
  }

  // Verify that no other bug has the same title
  const Allbugs = await Bug.createQueryBuilder('bug')
    .leftJoinAndSelect('bug.createdBy', 'createdBy')
    .leftJoinAndSelect('bug.updatedBy', 'updatedBy')
    .leftJoinAndSelect('bug.closedBy', 'closedBy')
    .leftJoinAndSelect('bug.reopenedBy', 'reopenedBy')
    .leftJoinAndSelect('bug.notes', 'note')
    .leftJoinAndSelect('note.author', 'noteAuthor')
    .leftJoinAndSelect('bug.assignments', 'assignment')
    .leftJoinAndSelect('bug.category', 'category')
    .select(fieldsToSelect)
    .getMany();

  for (let bug of Allbugs) {
    if (bug.title === title) {
      return res.status(400).send({ message: "A reported bug already has this title. \nMake sure this issue has not already been reported."})
    }
  }
  lastBugTitle = title;

  const newBug = Bug.create({
    title,
    description,
    priority,
    createdById: req.user,
  });
  
  await newBug.save();

  // Category
  if (category === "") { 
    await Category.findOne({ where: { name: "Bug" } }).then((cat) => {
      if (cat) {
        newBug.categoryId = cat.id;
        newBug.save();
      }
    })
  }
  else {
    await Category.findOne({ where: { name: category } }).then((cat) => {
      if (cat) {
        newBug.categoryId = cat.id;
        newBug.save();
      }
    })
  }


  var promises: Promise<void>[] = [];
  // Create a corresponding issue in Github Issues
  promises.push(createGitIssues(title, description, category).then(function(result) {
    newBug.gitIssueNumber = result;
  }));

  Promise.all(promises).then(async () => {
    await newBug.save();
  });

  const relationedBug = await Bug.createQueryBuilder('bug')
    .where('bug.id = :bugId', { bugId: newBug.id })
    .leftJoinAndSelect('bug.createdBy', 'createdBy')
    .leftJoinAndSelect('bug.updatedBy', 'updatedBy')
    .leftJoinAndSelect('bug.closedBy', 'closedBy')
    .leftJoinAndSelect('bug.reopenedBy', 'reopenedBy')
    .leftJoinAndSelect('bug.notes', 'note')
    .leftJoinAndSelect('note.author', 'noteAuthor')
    .leftJoinAndSelect('bug.assignments', 'assignment')
    .leftJoinAndSelect('bug.category', 'category')
    .select(fieldsToSelect)
    .getOne()

    return res.status(201).json(relationedBug);
    

  
};

export const updateBug = async (req: Request, res: Response) => {
  const { title, description, priority } = req.body[0];
  const category = req.body[1];
  const { bugId } = req.params;

  const currentUser = await User.findOne(req.user);

  if (currentUser?.isAdmin !== true) {
    return res.status(403).send({ message: 'Permission denied.'});
  }

  const { errors, valid } = createBugValidator(title, description, priority);

  if (!valid) {
    return res.status(400).send({ message: Object.values(errors)[0] });
  }
  lastBugTitle = title;
  const targetBug = await Bug.findOne({ id: bugId });

  if (!targetBug) {
    return res.status(400).send({ message: 'Invalid bug ID.' });
  }

  // Category
  await Category.findOne({ where: { name: category } }).then((cat) => {
    if (cat) {
      targetBug.categoryId = cat.id;
      targetBug.save();
    }
  })
  

  targetBug.title = title;
  targetBug.description = description;
  targetBug.priority = priority;

  targetBug.updatedById = req.user;
  targetBug.updatedAt = new Date();

  await targetBug.save();

  updateGitIssues(title, description, targetBug.gitIssueNumber, category);

  const relationedBug = await Bug.createQueryBuilder('bug')
    .where('bug.id = :bugId', { bugId })
    .leftJoinAndSelect('bug.createdBy', 'createdBy')
    .leftJoinAndSelect('bug.updatedBy', 'updatedBy')
    .leftJoinAndSelect('bug.closedBy', 'closedBy')
    .leftJoinAndSelect('bug.reopenedBy', 'reopenedBy')
    .leftJoinAndSelect('bug.notes', 'note')
    .leftJoinAndSelect('note.author', 'noteAuthor')
    .leftJoinAndSelect('bug.assignments', 'assignment')
    .leftJoinAndSelect('bug.category', 'category')
    .select(fieldsToSelect)
    .getOne();

  return res.status(201).json(relationedBug);
};

export const deleteBug = async (req: Request, res: Response) => {
  const { bugId } = req.params;

  const targetBug = await Bug.findOne({ id: bugId });

  const currentUser = await User.findOne(req.user);

  if (currentUser?.isAdmin !== true) {
    return res.status(403).send({ message: 'Permission denied.'});
  }


  if (!targetBug) {
    return res.status(404).send({ message: 'Invalid bug ID.' });
  }

  // Remove image/video associated with bug from the Image folder
  const Imgpath = "../client/public/Images/" + targetBug.ImageFilePath
  fs.unlink(Imgpath, (err) => {
    if (err) {
      console.error(err)
      return
    }
  });
  
  // Remove JSON file associated with bug from the JSON_files folder
  const JSONpath = "../client/public/JSON_files/" + targetBug.JSONFilePath
  fs.unlink(JSONpath, (err) => {
    if (err) {
      console.error(err)
      return
    }
  });

  await Note.delete({ bugId });
  await targetBug.remove();

  closeGitIssues(targetBug.gitIssueNumber);
  
  res.status(204).end();
};

export const closeBug = async (req: Request, res: Response) => {
  const { bugId } = req.params;

  const currentUser = await User.findOne(req.user);

  if (currentUser?.isAdmin !== true) {
    return res.status(403).send({ message: 'Permission denied.'});
  }

  const targetBug = await Bug.findOne({ id: bugId });

  if (!targetBug) {
    return res.status(400).send({ message: 'Invalid bug ID.' });
  }

  if (targetBug.isResolved === true) {
    return res
      .status(400)
      .send({ message: 'Bug is already marked as closed.' });
  }

  targetBug.isResolved = true;
  targetBug.closedById = req.user;
  targetBug.closedAt = new Date();
  targetBug.reopenedById = null;
  targetBug.reopenedAt = null;

  await targetBug.save();

  closeGitIssues(targetBug.gitIssueNumber);

  const relationedBug = await Bug.createQueryBuilder('bug')
    .where('bug.id = :bugId', { bugId })
    .leftJoinAndSelect('bug.createdBy', 'createdBy')
    .leftJoinAndSelect('bug.updatedBy', 'updatedBy')
    .leftJoinAndSelect('bug.closedBy', 'closedBy')
    .leftJoinAndSelect('bug.reopenedBy', 'reopenedBy')
    .leftJoinAndSelect('bug.notes', 'note')
    .leftJoinAndSelect('note.author', 'noteAuthor')
    .leftJoinAndSelect('bug.assignments', 'assignment')
    .leftJoinAndSelect('bug.category', 'category')
    .select(fieldsToSelect)
    .getOne();

  return res.status(201).json(relationedBug);
};

export const reopenBug = async (req: Request, res: Response) => {
  const { bugId } = req.params;

  const currentUser = await User.findOne(req.user);

  if (currentUser?.isAdmin !== true) {
    return res.status(403).send({ message: 'Permission denied.'});
  }

  const targetBug = await Bug.findOne({ id: bugId });

  if (!targetBug) {
    return res.status(400).send({ message: 'Invalid bug ID.' });
  }

  if (targetBug.isResolved === false) {
    return res
      .status(400)
      .send({ message: 'Bug is already marked as opened.' });
  }

  targetBug.isResolved = false;
  targetBug.reopenedById = req.user;
  targetBug.reopenedAt = new Date();
  targetBug.closedById = null;
  targetBug.closedAt = null;

  await targetBug.save();

  reopenGitIssues(targetBug.gitIssueNumber);

  const relationedBug = await Bug.createQueryBuilder('bug')
    .where('bug.id = :bugId', { bugId })
    .leftJoinAndSelect('bug.createdBy', 'createdBy')
    .leftJoinAndSelect('bug.updatedBy', 'updatedBy')
    .leftJoinAndSelect('bug.closedBy', 'closedBy')
    .leftJoinAndSelect('bug.reopenedBy', 'reopenedBy')
    .leftJoinAndSelect('bug.notes', 'note')
    .leftJoinAndSelect('note.author', 'noteAuthor')
    .leftJoinAndSelect('bug.assignments', 'assignment')
    .leftJoinAndSelect('bug.category', 'category')
    .select(fieldsToSelect)
    .getOne();

  return res.status(201).json(relationedBug);
};

export const saveFilePath = async(ImageFilePath: string, JSONFilePath: string) => {
  await Bug.findOne({
    where: { title: lastBugTitle }
  }).then(async (bug) => {
    if (bug) {
      if (ImageFilePath !== '') {
        bug.ImageFilePath = ImageFilePath;
      }
      if (JSONFilePath !== '') {
        bug.JSONFilePath = JSONFilePath;
      }
      bug.save();
    }
  });

  

}
