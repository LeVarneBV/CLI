# LeVarne CLI
This repo contains the LeVarne CLI that is meant to speed up and ease our workflows and make them less error prone. The currently available commands are listed below under the command section. Commands always start with LeVarne or le.

## Installation

```
npm install -g @levarne/cli
```

## Commands

### Basics
We can import project folders from the remote LeVarne basics repo through the CLI. You can optionally specify a version number if you want to import a previous version of a project (e.g. Ionic 3 iso Ionic 4).

```
LeVarne basics init <project> [version]
```

### Githooks
We currently have some githooks to make it easier to work with Lambda repos, such as a pre-commit hook that will use git secret automatically on the background. These githooks can be added to your repo with the command below.

```
LeVarne githook add lambda
```

As of this moment, githooks can't be deleted through the CLI yet, so if you want to delete them, you will have to do this manually.
In case you want to use git checkout without revealing secrets, you can use NO_REVEAL=true git checkout.

### Git secret
In case of a merge conflict in .env files, we will get the conflict in a decrypted file (.secret extension). Because there is no easy way of knowing what exactly is different between the 2 commits, the following command will decrypt both versions, compare them and show you the merge conflict as usual in the conflicted file.

```
LeVarne secret-conflicts
```

Note that you will still need to manually resolve the conflict in .gitsecret/mapping.cfg. The way you do this doesn't matter that much, since the affected files will be re-encrypted.
