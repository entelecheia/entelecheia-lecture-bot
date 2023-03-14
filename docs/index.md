# base-template

A base template for CI/CD workflows with MkDocs and Semantic Release

## Usage

### Create a new repository

1. Click the `Use this template` button
2. Enter a name for your repository
3. Click `Create repository from template`

## Add secrets for GitHub Actions

1. Go to the `Settings` tab of your repository
2. Click `Secrets` in the left sidebar
3. Click `New repository secret`
4. Add the following secrets:

| Name         | Value                         |
| ------------ | ----------------------------- |
| GITHUB_TOKEN | `${{ secrets.GITHUB_TOKEN }}` |
| NPM_TOKEN    | `${{ secrets.NPM_TOKEN }}`    |

### Initial release

Push a commit to the `main` branch with the message `feat: initial commit`

### GitHub Pages

1. Modify the contents of the `mkdocs.yaml` file
2. Add content to the `docs` folder
3. Push a commit to the `main` branch
4. Wait for the `Publish docs via GitHub Pages` workflow to complete
5. Go to the `Settings` tab of your repository
6. Scroll down to the `pages` section
7. Select `Deploy from a branch` as the source
8. Select `gh-pages` as the branch and `/(root)` as the folder, then click `Save`

## Features

- [x] Linting
- [x] Automated Release Draft
- [x] Semantic versioning
- [x] Documentation to PDF
- [x] Github Pages deployment (MkDocs)

## Workflows

### CI (Continuous Integration)

#### Lint

The `Lint` workflow is automatically triggered whenever there is push activity in `main` or pull request activity towards `main`. It has one job:

- Lint the codebase with GitHub's [Super-Linter](https://github.com/github/super-linter).

### CD (Continuous Deployment)

#### Docs to PDF

The `Docs to PDF` workflow is automatically triggered whenever there is push activity in `main` or pull request activity towards `main`. It has one job:

- Build the documentation to PDF with [Markdown to PDF](https://github.com/BaileyJM02/markdown-to-pdf)

#### Release

The `Release` workflow is automatically triggered whenever there is push activity in `main` or pull request activity towards `main`. It has one job:

- Create a release draft with [semantic-release](https://github.com/semantic-release/semantic-release)

#### Publish docs via GitHub Pages

The `Publish docs via GitHub Pages` workflow is automatically triggered whenever there is push activity in `main` or pull request activity towards `main`. It has one job:

- Publish the documentation to GitHub Pages with [MkDocs](https://www.mkdocs.org/)

## Semantic Release

### Commit message format

**semantic-release** uses the commit messages to determine the consumer impact of changes in the codebase.
Following formalized conventions for commit messages, **semantic-release** automatically determines the next [semantic version](https://semver.org) number, generates a changelog and publishes the release.

By default, **semantic-release** uses [Angular Commit Message Conventions](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#-commit-message-format).
The commit message format can be changed with the [`preset` or `config` options](docs/usage/configuration.md#options) of the [@semantic-release/commit-analyzer](https://github.com/semantic-release/commit-analyzer#options) and [@semantic-release/release-notes-generator](https://github.com/semantic-release/release-notes-generator#options) plugins.

Tools such as [commitizen](https://github.com/commitizen/cz-cli) or [commitlint](https://github.com/conventional-changelog/commitlint) can be used to help contributors and enforce valid commit messages.

The table below shows which commit message gets you which release type when `semantic-release` runs (using the default configuration):

| Commit message                                                                                                                                                                                   | Release type                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `fix(pencil): stop graphite breaking when too much pressure applied`                                                                                                                             | ~~Patch~~ Fix Release                                                                                           |
| `feat(pencil): add 'graphiteWidth' option`                                                                                                                                                       | ~~Minor~~ Feature Release                                                                                       |
| `perf(pencil): remove graphiteWidth option`<br><br>`BREAKING CHANGE: The graphiteWidth option has been removed.`<br>`The default graphite width of 10mm is always used for performance reasons.` | ~~Major~~ Breaking Release <br /> (Note that the `BREAKING CHANGE: ` token must be in the footer of the commit) |

### Automation with CI

**semantic-release** is meant to be executed on the CI environment after every successful build on the release branch.
This way no human is directly involved in the release process and the releases are guaranteed to be [unromantic and unsentimental](http://sentimentalversioning.org).

### Triggering a release

For each new commit added to one of the release branches (for example: `main`, `next`, `beta`), with `git push` or by merging a pull request or merging from another branch, a CI build is triggered and runs the `semantic-release` command to make a release if there are codebase changes since the last release that affect the package functionalities.

## Derived Templates

This template is used to create the following templates:

- [python-template](https://github.com/entelechiea/python-template)
- [pypi-template](https://github.com/entelechiea/pypi-template)
- [jupyter-book-template](https://github.com/entelechiea/jupyter-book-template)

## References

- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
- [semantic-release](https://github.com/semantic-release/semantic-release)
- [Semantic Release Action](https://github.com/cycjimmy/semantic-release-action)
- [Git Semantic Version](https://github.com/marketplace/actions/git-semantic-version)

## License

This project is released under the [MIT License][license-url].

<!-- Links: -->

[version-image]: https://img.shields.io/github/package-json/v/entelecheia/base-template
[workflows-badge-image]: https://github.com/entelecheia/base-template/actions/workflows/cd-pipeline.yaml/badge.svg
[release-date-image]: https://img.shields.io/github/release-date/entelecheia/base-template
[release-url]: https://github.com/entelecheia/base-template/releases
[semantic-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-url]: https://github.com/semantic-release/semantic-release
[license-image]: https://img.shields.io/github/license/entelecheia/base-template
[license-url]: https://github.com/entelecheia/base-template/blob/main/LICENSE
[changelog-url]: https://github.com/entelecheia/base-template/blob/main/docs/CHANGELOG.md
[linter-image]: https://github.com/entelecheia/base-template/workflows/Lint%20Code%20Base/badge.svg
[linter-url]: https://github.com/marketplace/actions/super-linter
[codacy-image]: https://app.codacy.com/project/badge/Grade/f5d47f43f3ba4f1eb5f1d5140d2c69cd
[codacy-url]: https://www.codacy.com/gh/entelecheia/base-template/dashboard?utm_source=github.com&utm_medium=referral&utm_content=entelecheia/base-template&utm_campaign=Badge_Grade
