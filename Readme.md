# BW Starter Web App - Front-End
This monorepo provides npm packages that can be used with the [API Component Bundle](https://github.com/silverbackis/ApiComponentBundle)

Usage can be seen in the [BW Starter](https://github.com/silverbackis/BwStarterWebsite) project

Packages include the precompiled `@bwstarter/server` package for use with an express server and that also provides functions to be used in the `@bwstarter/core` package. The core package deals with interactions between the front-end and API.

The `@bwstarter/components` package provides common components and mixins which can be used across any CSS framework.

Finally, `@bwstarter/bulma` package provides components and styling specific to Bulma and the preconfigured entities available in the [API Component Bundle](https://github.com/silverbackis/ApiComponentBundle)

You can configure which components should be used for which entities from the back-end. More documentation to follow. This will be done in your main NuxtJS application configuration.
