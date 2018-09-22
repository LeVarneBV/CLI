# LeVarne CLI
This repo contains the LeVarne CLI that is meant to speed up and ease our workflows and make them less error prone. The currently available commands are listed below. Commands always start with LeVarne or le.

## Githooks
We currently have some githooks to make it easier to work with Lambda repos, such as a pre-commit hook that will use git secret automatically on the background. These githooks can be added to your repo with the command below.

```
LeVarne githook add lambda
```

Currently, githooks can't be deleted through the CLI yet, so if you want to delete them, you will have to do this manually.