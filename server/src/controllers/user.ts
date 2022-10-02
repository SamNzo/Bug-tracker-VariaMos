import { Request, Response } from 'express';
import { User } from '../entity/User';
import { InviteCode } from '../entity/InviteCode';
import { Not } from 'typeorm';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { EMAIL, PASSWORD } from '../utils/variables';
import { verifyGitUser } from '../utils/githubIssuesAPI';

export const getAllUsers = async (req: Request, res: Response) => {
  
  const users = await User.find({
    where: { id: Not(req.user) },
    select: ['id', 'username', 'isAdmin', 'email', 'notificationsOn', 'github'],
  });

  res.json(users);
};

export const addAdmins = async (req: Request, res: Response) => {
  const currentUser = await User.findOne(req.user);

  if (currentUser?.isAdmin !== true) {
    return res.status(403).send({ message: 'Permission denied.'});
  }

  const adminsIds = req.body.admins as string[];
  
  if (adminsIds.length === 0) {
    return res
    .status(400)
    .send({ message: 'You have to select at least one user' });
  }

  let cpt: number = adminsIds.length;
  let ind: number = 0;

  while (cpt > 0) {
    const user = await User.findOne({
      where: { id: adminsIds[ind] },
    });

    if (user) { 
      user.isAdmin = true;
      user?.save();
    }
    ind += 1;
    cpt -= 1;
  }

  const updatedUsers = await User.createQueryBuilder('user')
    .where('user.isAdmin = :isAdmin', { isAdmin: true })
    .select([
      'user.id',
      'user.username',
      'user.isAdmin',
      'user.email',
      'user.notificationsOn',
      'user.github',
    ])
    .getMany();

  res.status(201).json(updatedUsers);
};

export const removeAdmin = async (req: Request, res: Response) => {
  const currentUser = await User.findOne(req.user);

  if (currentUser?.isAdmin !== true) {
    return res.status(403).send({ message: 'Permission denied.'});
  }

  const adminId = req.params.adminId;

  const user = await User.findOne({
    where: { id: adminId },
  });

  if (user) { 
    user.isAdmin = false;
    user?.save();
  }

  res.status(204).end();
};

export const changeSettings = async (req: Request, res: Response) => {
  const currentUser = await User.findOne(req.user);
  const { email, github, githubToken, notifications, newPassword, oldPassword } = req.body;
  // Check if the email adress format is valid 
  if (email) {
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    .test(email)) {
      return res.status(400).send({ message: 'Invalid email adress.' });
    }
  };

  // Check if someone already has this email adress or github username
  const users = await User.find();
  for (let user of users) {
    if (user.email === email && user.username !== currentUser?.username && email !== "") {
      return res.status(400).send({ message: `Email adress ${email} is already taken.` });
    }
    if (user.github === github && user.username !== currentUser?.username && user.isAdmin) {
      return res.status(400).send({ message: `Github username ${github} is already taken.` });
    }
  };

  if (github !== currentUser?.github && github !== '' && currentUser?.isAdmin) {
        let unauthorized = false;
        // Verify the user
        // Use the Github REST API to check if the username given matches the one associated with the token
        await verifyGitUser(githubToken).then(r => {
        const response = JSON.parse(r);
        if (response.message === 'Bad credentials') {
          unauthorized = true;
        }
        if (response.login !== github) {
          unauthorized = true;
        }
    }).then(() => {
      if (unauthorized) {
        return res.status(403).send({ message: `Personal access token does not match Github username ${github}.` });
      }
    })
  }

  if (githubToken !=='' && github === '' && currentUser?.isAdmin) {
    return res.status(400).send({ message: `Personal access token needs to be matched with a Github username.` })
  }
      
    
  if (currentUser) {

    // If there is a new password verify that the current one is correct
    if (oldPassword) {
      const credentialsValid = await bcrypt.compare(oldPassword, currentUser.passwordHash);
      if (!credentialsValid) {
        return res.status(401).send({ message: 'Wrong password..' });
      }
      const saltRounds = 10;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
      if (newPasswordHash === currentUser.passwordHash) {
        return res.status(400).send({ message: 'Cannot change password to your current one.'})
      }

      currentUser.passwordHash = newPasswordHash;
    }
    
    if (email && email !== '') {
      currentUser.email = email;
    }

    if (github && github !== '') {
      currentUser.github = github;
    }
    
    if (notifications === 'on') {
      currentUser.notificationsOn = true;
    }
    else if (notifications === 'off') {
      currentUser.notificationsOn = false;
    }
    currentUser?.save();
  }

  res.status(201).json(currentUser);
}

export const inviteAdmin = async (req: Request, res: Response) => {
  const email = req.body.data.email;
  
  // generate random code
  const inviteCode = crypto.randomBytes(15).toString('hex');

  // hash the code
  const saltRounds = 10;
  const inviteCodeHash = await bcrypt.hash(inviteCode, saltRounds);

  const code = InviteCode.create({ codeHash: inviteCodeHash })
  await code.save();

  // send email to new admin
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
    to: email,
    subject: "VariaMos | New invitation",
    text: `Hello, you have been invited to join the administrator team on VariaMos BugTracker !
    \nPlease create your account using the following link:
    \n      http://localhost:3000/invite/SUJ3NW12UVhIaVNiOTVuNzJrN2g=
    \nUse the following code to access the page:
    \n      ${inviteCode}
    \n\nPlease do not reply to this email.
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
      console.log(`Email sent at ${email}: ` + info);
    }
  });

  res.status(201).end();
};

export const sendNotification = async (req: Request, res: Response) => {
  const adminsIds = req.body;
  
  const admins: User[] = [];

  const admin = await User.findOne({
    where: { id: adminsIds.adminsIds }
  });
  if (admin) {
    admins.push(admin);
  }
  
 

  // send email to each admin that has notifications on
  for (let admin of admins) {
    
    if (admin.notificationsOn === true) {
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
      
      let email = {
        from: EMAIL,
        to: admin.email,
        subject: "VariaMos | New Bug Assigned",
        text: `Hello ${admin.username}, you have been assigned a bug on VariaMos BugTracker !
        \nIf you want to stop receiving those emails turn your notifications off. 
        \nPlease do not reply to this email.
        \n\nThe VariaMos Team.`
      };

      transporter.verify(function (error, _success) {
        if (error) {
          console.log(error);
          res.status(400);
        } else {
          console.log("Server is ready to take our messages");
        }
      });
     
      transporter.sendMail(email, (error, info) => {
        if (error) {
          console.log(error);
        } else {
          console.log(`Email sent for ${admin.username}: ` + info);
        }
      });    
    }
  }


  res.status(201).json(admins);
};
