import fetch from 'node-fetch';
import { GithubPersonnalToken, GithubRepo, GithubUser } from './variables';

/**
 * The following functions use the Github REST Issues API
 * to synchronize the Bug Tracker with Github Issues
 * To learn more see the official documentation:
 * https://docs.github.com/en/rest/issues/issues
 */

let IssueId: number;
let CommentId: number;

/**
 *  This function creates an issue in Github Issues 
 */
const createGitIssues = async (title: string, body: string, category?: string) => {
    let label: string = '';
    if (category === "Question") {label = "question"}
    else if (category === "Enhancement") {label = "enhancement"}
    else {label = "bug"}

    const JSON_DATA = {
        title: `${title}`,
        body: `${body}`,
        labels: [`${label}`]
    };
    try {
        await fetch(`https://api.github.com/repos/${GithubUser}/${GithubRepo}/issues`, {
            method: 'post',
            body:    JSON.stringify(JSON_DATA),
            headers: {'Content-Type': 'application/json', 'Authorization': `token ${GithubPersonnalToken}`}
        })
            .then(res => res.json())
            .then(res => IssueId = res.number)

    } catch (e) {console.log(e)};

   return IssueId;
}

/**
 *  This function updates an issue in Github Issues 
 */
const updateGitIssues = async (title: string, body: string, ISSUE_NUMBER: number, category?: string) => {
    let label: string = '';
    if (category === "Question") {label = "question"}
    else if (category === "Enhancement") {label = "enhancement"}

    const JSON_DATA = {
        title: `${title}`,
        body: `${body}`,
        labels: [`${label}`]
    };

    try {
        await fetch(`https://api.github.com/repos/${GithubUser}/${GithubRepo}/issues/${ISSUE_NUMBER}`, {
        method: 'patch',
        body:    JSON.stringify(JSON_DATA),
        headers: {'Content-Type': 'application/json', 'Authorization': `token ${GithubPersonnalToken}`}
    })
        .then(res =>  res.json())
    } catch (e) {console.log(e)};
}

/**
 *  This function closes an issue in Github Issues 
 */
const closeGitIssues = async (ISSUE_NUMBER: number) => {
    // First API Call to lock the issue conversation
    const JSON_LOCK_DATA = {
        lock_reason : 'resolved'
    };

    try {
        await fetch(`https://api.github.com/repos/${GithubUser}/${GithubRepo}/issues/${ISSUE_NUMBER}/lock`, {
        method:  'put',
        body:   JSON.stringify(JSON_LOCK_DATA),
        headers: {'Accept': 'application/vnd.github+json', 'Authorization': `token ${GithubPersonnalToken}`}
    })
    .then(function(res) {
        return res.text()
    })
    } catch (e) {console.log(e)};

    // Second API Call to close the issue
    const JSON_CLOSE_DATA = {
        state: 'closed'
    };

    try {
        await fetch(`https://api.github.com/repos/${GithubUser}/${GithubRepo}/issues/${ISSUE_NUMBER}`, {
        method: 'patch',
        body:    JSON.stringify(JSON_CLOSE_DATA),
        headers: {'Content-Type': 'application/json', 'Authorization': `token ${GithubPersonnalToken}`}
    })
        .then(res =>  res.json())
    } catch (e) {console.log(e)};
}

/**
 *  This function re-opens an issue in Github Issues 
 */
const reopenGitIssues = async (ISSUE_NUMBER: number) => {
    // First API Call to unlock the issue conversation
    try {
        await fetch(`https://api.github.com/repos/${GithubUser}/${GithubRepo}/issues/${ISSUE_NUMBER}/lock`, {
        method: 'delete',
        headers: {'Content-Type': 'application/vnd.github+json', 'Authorization': `token ${GithubPersonnalToken}`}
    })
        .then(res =>  res.json())

    } catch (e) {console.log(e)};
    // Second API Call to re-open the issue
    const JSON_OPEN_DATA = {
        state: 'open'
    };

    try {
        await fetch(`https://api.github.com/repos/${GithubUser}/${GithubRepo}/issues/${ISSUE_NUMBER}`, {
        method: 'patch',
        body:    JSON.stringify(JSON_OPEN_DATA),
        headers: {'Content-Type': 'application/json', 'Authorization': `token ${GithubPersonnalToken}`}
    })
        .then(res =>  res.json())
    } catch (e) {console.log(e)};   
}

/**
 *  This function assigns an issue to a specified user in Github Issues 
 *  The user must have admin permissions on the repository
 */
const assignGitIssues = async (ISSUE_NUMBER: number, assignees: string[]) => {
    const JSON_DATA = {
        assignees: assignees,
    };

    try {
        await fetch(`https://api.github.com/repos/${GithubUser}/${GithubRepo}/issues/${ISSUE_NUMBER}`, {
        method: 'patch',
        body:    JSON.stringify(JSON_DATA),
        headers: {'Content-Type': 'application/json', 'Authorization': `token ${GithubPersonnalToken}`}
    })
        .then(res =>  res.json())

    } catch (e) {console.log(e)};
}

/**
 *  This function fetches all the issues from a repository
 *  It does not fetches the comments
 */
const getGitIssues = async () => {
    let response: Response | string = "";
    try {
        await fetch(`https://api.github.com/repos/${GithubUser}/${GithubRepo}/issues?`, {
            method: 'get',
            headers: {'Content-Type': 'application/json', 'Authorization': `token ${GithubPersonnalToken}`}
        })
        .then(res => res.text())
        .then(res => response = res)
            
    } catch (e) {console.log(e)};

    return response;
}

/**
 *  This function fetches all the comments from a Github issue
 */
const getGitIssueComments = async (ISSUE_NUMBER: number) => {
    let response: Response | string = "";
    try {
        await fetch(`https://api.github.com/repos/${GithubUser}/${GithubRepo}/issues/${ISSUE_NUMBER}/comments`, {
            method: 'get',
            headers: {'Content-Type': 'application/json', 'Authorization': `token ${GithubPersonnalToken}`}
        })
        .then(res => res.text())
        .then(res => response = res)
            
    } catch (e) {console.log(e)};

    return response;
}

/**
 *  This function create a comment on a Github issue
 *  Unfortunately the comment author on Github is always the owner of the repository
 */
 const createGitIssueComment = async (ISSUE_NUMBER: number, body: string) => {
    const JSON_DATA = {
        body: `${body}`,
    }
    try {
        await fetch(`https://api.github.com/repos/${GithubUser}/${GithubRepo}/issues/${ISSUE_NUMBER}/comments`, {
            method: 'post',
            body:    JSON.stringify(JSON_DATA),
            headers: {'Content-Type': 'application/json', 'Authorization': `token ${GithubPersonnalToken}`}
        })
        .then(res => res.json())
        .then(res => CommentId = res.id)
            
    } catch (e) {console.log(e)};

    return CommentId;
}

/**
 *  This function updates a comment on a Github issue
 */
const updateGitIssueComment = async (COMMENT_ID: number, body: string) => {
    const JSON_DATA = {
        body: `${body}`,
    }
    try {
        await fetch(`https://api.github.com/repos/${GithubUser}/${GithubRepo}/issues/comments/${COMMENT_ID}`, {
            method: 'post',
            body:    JSON.stringify(JSON_DATA),
            headers: {'Content-Type': 'application/json', 'Authorization': `token ${GithubPersonnalToken}`}
        })
        .then(res => res.json())
            
    } catch (e) {console.log(e)};
}

/**
 *  This function deletes a comment on a Github issue
 */
 const deleteGitIssueComment = async (COMMENT_ID: number) => {
    try {
        await fetch(`https://api.github.com/repos/${GithubUser}/${GithubRepo}/issues/comments/${COMMENT_ID}`, {
            method: 'delete',
            headers: {'Content-Type': 'application/vnd.github+json', 'Authorization': `token ${GithubPersonnalToken}`}
        })
        .then(res => res.json())
            
    } catch (e) {console.log(e)};
}

/**
 *  This function fetches public data from a Github user using his personal access token
 */
const verifyGitUser = async (personalToken: string) => {
    let response: Response | string = "";
    try {
        await fetch(`https://api.github.com/user`, {
            method: 'get',
            headers: {'Accept': 'application/vnd.github+json', 'Authorization': `token ${personalToken}`}
        })
        .then(res =>res.text())
        .then(res => response = res)
            
    } catch (e) {
        console.log(e);
    };
    
    return response;
}

export { createGitIssues };
export { updateGitIssues };
export { closeGitIssues };
export { reopenGitIssues };
export { assignGitIssues };
export { getGitIssues };
export { getGitIssueComments };
export { createGitIssueComment };
export { updateGitIssueComment };
export { deleteGitIssueComment };
export { verifyGitUser };