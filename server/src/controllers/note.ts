import { Request, Response } from 'express';
import { Note } from '../entity/Note';
import nodemailer from 'nodemailer';
import { EMAIL, PASSWORD } from '../utils/variables';
import { User } from '../entity/User';
import { Bug } from '../entity/Bug';
import { createGitIssueComment, deleteGitIssueComment, getGitIssueComments, updateGitIssueComment } from '../utils/githubIssuesAPI';

export const getNotes = async (req: Request, res: Response) => {
  // Here we make sure that the bug comments are the same on Github and the Bug Tracker
  const bugId = req.params.bugId;
  
  await Bug.findOne({ where: { id: bugId } }).then(async (bug) => {
    if (bug) {
      //Get notes from the Bug Tracker
      const notes = await Note.find({ bugId: bug.id });
      // Get notes from the Github issue
      await getGitIssueComments(bug.gitIssueNumber).then(async (r) => {
        // Response is a string so we convert it to JSON
        const comments = JSON.parse(r);
        // If the bug (on the BugTracker) has zero notes
        // Add every comment from Github
        if (notes.length === 0) {
          let GithubNotes: Note[] = [];
          for (let comment of comments) {
            // Get the author id (works if he entered his Github username in his settings)
            let writerId: string = ''; 
            await User.findOne({ where: { github: comment.user.login }}).then((u) => {
              if (u) {writerId = u.id}
              else {writerId = "00000000-0000-0000-0000-000000000000"}
            });
            const newNote = Note.create({ 
              body: comment.body, 
              authorId: writerId,
              bugId: bug.id,
              gitCommentId: comment.id
            });
            await newNote.save()
            GithubNotes.push(newNote);
          }
          const Notes = await Note.createQueryBuilder('note')
          .leftJoinAndSelect('note.author', 'author')
          .select([
            'note.id',
            'note.bugId',
            'note.body',
            'note.gitCommentId',
            'note.createdAt',
            'note.updatedAt',
            'note.isReply',
            'note.replyId',
            'note.repliesNb',
            'author.id',
            'author.username',
          ])
          .getMany();

        res.status(201).json(Notes.filter((n) => GithubNotes.includes(n)));      
        }
        // Else, add the Github comments missing on the Bug Tracker
        else {
          let GithubNotes: Note[] = [];
          // For each Github comment
          for (let comment of comments) {
            let cpt = 0;
            // Compare with the ones on the Bug Tracker
            for (let note of notes) {
              if (comment.id === note.gitCommentId) {
                // Note already exists and is updated
                note.body = comment.body;
                await note.save();
                break;
              }
              if (comment.body.replace(/\s/g, '') !== note.body.replace(/\s/g, '')) {
                cpt += 1;
              }
              else {
                break;
              }
              // Bug is added from Github
              if (cpt === notes.length) {     
                // Get the author id (works if he entered his Github username in his settings)
                let writerId: string = ''; 
                await User.findOne({ where: { github: comment.user.login }}).then((u) => {
                  if (u) {writerId = u.id}
                  else {writerId = "00000000-0000-0000-0000-000000000000"}
                });

                const newNote = Note.create({ 
                  body: comment.body, 
                  authorId: writerId,
                  bugId: bug.id,
                  gitCommentId: comment.id
                });

                await newNote.save();
                GithubNotes.push(newNote);
              }
            }
          }
          const Notes = await Note.createQueryBuilder('note')
          .leftJoinAndSelect('note.author', 'author')
          .select([
            'note.id',
            'note.bugId',
            'note.body',
            'note.gitCommentId',
            'note.createdAt',
            'note.updatedAt',
            'note.isReply',
            'note.replyId',
            'author.id',
            'author.username',
          ])
          .getMany();

          res.status(201).json(Notes.filter((n) => GithubNotes.includes(n))); 
        }
      })
    }
  })
  
}

export const postNote = async (req: Request, res: Response) => {
  const { body, isReply, noteId } = req.body;
  const { bugId } = req.params;
  
  const currentUser = await User.findOne(req.user);

  if (!body || body.trim() === '') {
    return res
      .status(400)
      .send({ message: 'Note body field must not be empty.' });
  }

  const newNote = Note.create({ body, authorId: req.user, bugId, replyId: 0 });
  await newNote.save();

  const targetBug = await Bug.findOne({ id: bugId });

  // Add the comment on Github Issues (and the comment id to the database)
  if (targetBug) {
    createGitIssueComment(targetBug?.gitIssueNumber, body).then(async (id) => {
      newNote.gitCommentId = id;
      await newNote.save();
    })

  };

  // If the note is a reply
  if (isReply) {
    await Note.findOne({ id: noteId }).then(async (target) => {
      if (target) {
        target.repliesNb += 1;
        await target.save();
        newNote.isReply = true;
        newNote.replyId = target.id;
        await newNote.save();
    
      const authorId = target.authorId;
      const author = await User.findOne({ id: authorId })
      // If the author has entered an email, turned notifications on and the one replying is connected
      if (author?.email !== '' && author?.notificationsOn === true && currentUser?.username !== "user") {
        // send him a notification
        let transporter = nodemailer.createTransport({
          maxConnections: 200,
          pool: true,
          service: "hotmail", // outlook is hotmail service
          secure: false,
          auth: { 
            user: EMAIL,
            pass: PASSWORD,
          }
        });
        
        let mail = {
          from: EMAIL,
          to: author.email,
          subject: "VariaMos | New reply",
          text: `Hello ${author.username}, someone replied to you on VariaMos BugTracker concerning the following bug: ${targetBug?.title}.
          \nYour message: ${target.body}
          \n\n${currentUser?.username} replied: ${body}
          \n\n If you want to stop receiving these emails, turn your notifications off.
          \nPlease do not reply to this email.
          \n\nThe VariaMos Team.`
        };
      
        transporter.verify(function (error, _success) {
          if (error) {
            console.log(error);
          } else {
            console.log("Server is ready to take our messages");
          }
        });
      
        transporter.sendMail(mail, (error, info) => {
          if (error) {
            console.log(error);
            return res.status(421).send({ message: "A problem occured, please try again later." });
          } else {
            console.log(`Email sent for ${author.username}: ` + info);
          }
        });
      }    
    }});
  }
  const relationedNote = await Note.createQueryBuilder('note')
    .where('note.id = :noteId', { noteId: newNote.id })
    .leftJoinAndSelect('note.author', 'author')
    .select([
      'note.id',
      'note.bugId',
      'note.body',
      'note.gitCommentId',
      'note.createdAt',
      'note.updatedAt',
      'note.isReply',
      'note.replyId',
      'note.repliesNb',
      'author.id',
      'author.username',
    ])
    .getOne();

  res.status(201).json(relationedNote);
};

export const deleteNote = async (req: Request, res: Response) => {
  const { noteId } = req.params;

  const targetNote = await Note.findOne({ id: Number(noteId) });

  if (!targetNote) {
    return res.status(404).send({ message: 'Invalid note ID.' });
  }

  await Note.find().then(async (notes) => {
    if (notes) {
      for (let note of notes) {
        if (note.replyId === targetNote.id) {
          await note.remove();
        }
      }
    }
  })

  await targetNote.remove();

  // Delete note from Github Issues
  deleteGitIssueComment(targetNote.gitCommentId);
  
  res.status(204).end();
};

export const updateNote = async (req: Request, res: Response) => {
  const { body } = req.body;
  const { noteId } = req.params;

  if (!body || body.trim() === '') {
    return res
      .status(400)
      .send({ message: 'Note body field must not be empty.' });
  }

  const targetNote = await Note.findOne({ id: Number(noteId) });

  if (!targetNote) {
    return res.status(404).send({ message: 'Invalid note ID.' });
  }

  if (targetNote.authorId !== req.user) {
    return res.status(401).send({ message: 'Access is denied.' });
  }

  targetNote.body = body;
  await targetNote.save();

  // Update the comment on Github Issue
  updateGitIssueComment(targetNote.gitCommentId, body);

  res.json(targetNote);
};
