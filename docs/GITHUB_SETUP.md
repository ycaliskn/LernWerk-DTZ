# GitHub connection and repository protection

## Connect GitHub to ChatGPT

1. In ChatGPT, open **Settings → Apps** (some older clients show Plugins).
2. Select **GitHub** and choose **Connect** / **Install** if prompted.
3. GitHub opens an authorisation page. Sign in to `ycaliskn`, review the app's requested permissions, and choose the repositories it can access.
4. Return to ChatGPT and share the repository URL, for example `https://github.com/ycaliskn/lernwerk-dtz`, after it has been created.

Official setup article: https://help.openai.com/en/articles/11145903-connecting-github-to-chatgpt

**Important limitation:** the ChatGPT GitHub app is documented as read-only for repository analysis. It does not push commits or create/update repository files. For code generation, editing and pushing, use Codex with the repository connected. Never paste a GitHub Personal Access Token, password, private signing certificate or store credential into a chat.

## Suggested repository

- Owner: `ycaliskn`
- Suggested repository name: `lernwerk-dtz`
- Visibility: Public (as requested)
- Default branch: `main`
- Enable Issues and Actions.
- Add the project files from the source ZIP or use Codex to create the repository and push the checked project.

## Protecting `main`

In GitHub repository Settings → Rules → Rulesets (or Branches → Branch protection rules):

- Target branch: `main`.
- Require a pull request before merging.
- Require the CI workflow checks to pass.
- Require CODEOWNERS review when there are additional contributors.
- Restrict who can push/update the protected branch to the repository owner only; configure the owner as the only bypass actor if direct owner maintenance is desired.
- Disable force pushes and branch deletion.

A public repository allows anyone to read and fork the code. Repository write access remains controlled separately. No access token is embedded in the project.
